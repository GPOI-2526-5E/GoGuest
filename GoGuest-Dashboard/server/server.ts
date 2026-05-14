import express from 'express';
import type { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const envPath = [
  resolve(process.cwd(), 'GoGuest-Dashboard/server/.env'),
  resolve(process.cwd(), 'server/.env'),
  resolve(process.cwd(), '.env')
].find(existsSync);

if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const EMAIL_USER = process.env.EMAIL_USER || 'goguest2026@gmail.com';

function getEmailPassword(): string | null {
  const password = process.env.EMAIL_PASSWORD?.replace(/\s/g, '');
  if (!password || password === 'inserisci_la_password_qui') {
    return null;
  }

  return password;
}

function getInviteErrorMessage(error: unknown): string {
  const mailError = error as { code?: string; responseCode?: number };

  if (mailError.code === 'EAUTH' || mailError.responseCode === 535) {
    return 'Errore autenticazione email: controlla EMAIL_PASSWORD nel file .env del server.';
  }

  return "Errore interno durante l'invito. Controlla i log del server.";
}

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'goguest',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --------------------------------------------------------------
// GET /api/dashboard
// --------------------------------------------------------------
app.get('/api/dashboard', async (_req: Request, res: Response) => {
  try {
    const [statsRows]: any = await db.execute(`
      SELECT
        (SELECT COUNT(*)
         FROM visita
         WHERE DATE(DataOraIngresso) = CURDATE()) AS visitatoriOggi,
        (SELECT COUNT(*)
         FROM visita v
         JOIN visitatore vis ON v.IdVisitatore = vis.IdVisitatore
         WHERE v.DataOraIngresso IS NOT NULL
           AND v.DataOraUscita IS NULL
           AND COALESCE(vis.VisitaAttiva, 0) = 1) AS ingressiAttivi,
        (SELECT COUNT(*)
         FROM qrgenerati) AS qrGenerati,
        (SELECT COUNT(*)
         FROM visita
         WHERE DataOraUscita IS NOT NULL) AS usciteRegistrate
    `);

    const [monthlyRows]: any = await db.execute(`
      SELECT
        MONTH(DataOraIngresso) AS mese,
        COUNT(*) AS totale
      FROM visita
      WHERE DataOraIngresso >= MAKEDATE(YEAR(CURDATE()), 1)
        AND DataOraIngresso < DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL 1 YEAR)
      GROUP BY MONTH(DataOraIngresso)
      ORDER BY mese
    `);

    const stats = statsRows[0] ?? {};
    const totalsByMonth = new Map<number, number>(
      monthlyRows.map((row: any) => [Number(row.mese), Number(row.totale)])
    );
    const monthLabels = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const currentMonth = new Date().getMonth() + 1;

    res.json({
      stats: {
        visitatoriOggi: Number(stats.visitatoriOggi ?? 0),
        ingressiAttivi: Number(stats.ingressiAttivi ?? 0),
        qrGenerati: Number(stats.qrGenerati ?? 0),
        usciteRegistrate: Number(stats.usciteRegistrate ?? 0)
      },
      visitatoriMensili: monthLabels.slice(0, currentMonth).map((label, index) => ({
        mese: index + 1,
        label,
        totale: totalsByMonth.get(index + 1) ?? 0
      }))
    });
  } catch (err: any) {
    console.error('Errore DB /api/dashboard:', err.message);
    res.status(500).json({ message: 'Errore nel recupero dei dati dashboard.' });
  }
});

// ──────────────────────────────────────────────
// GET /api/visite?periodo=oggi|mese|anno
// ──────────────────────────────────────────────
app.get('/api/visite', async (req: Request, res: Response) => {
  const periodo = (req.query['periodo'] as string) ?? 'oggi';

  let whereClause: string;
  switch (periodo) {
    case 'mese':
      whereClause = `MONTH(v.DataOraIngresso) = MONTH(CURDATE())
                     AND YEAR(v.DataOraIngresso) = YEAR(CURDATE())`;
      break;
    case 'anno':
      whereClause = `YEAR(v.DataOraIngresso) = YEAR(CURDATE())`;
      break;
    case 'oggi':
    default:
      whereClause = `DATE(v.DataOraIngresso) = CURDATE()`;
      break;
  }

  const sql = `
    SELECT
      v.IdVisita,
      vis.Nome,
      vis.Cognome,
      vis.Azienda,
      vis.Email,
      v.NomeReferente,
      v.DataOraIngresso,
      v.DataOraUscita,
      vis.VisitaAttiva
    FROM visita v
    JOIN visitatore vis ON v.IdVisitatore = vis.IdVisitatore
    WHERE ${whereClause}
    ORDER BY v.DataOraIngresso DESC
  `;

  try {
    const [rows] = await db.execute(sql);
    res.json(rows);
  } catch (err: any) {
    console.error('Errore DB /api/visite:', err.message);
    res.status(500).json({ error: 'Errore nel recupero delle visite.' });
  }
});

// ──────────────────────────────────────────────
// POST /api/invita-visitatore
// ──────────────────────────────────────────────
app.post('/api/invita-visitatore', async (req: Request, res: Response) => {
  try {
    const { nome, cognome, dataNascita, email } = req.body;

    if (!nome || !cognome || !email) {
      res.status(400).json({ message: 'Nome, Cognome e Email sono obbligatori' });
      return;
    }

    const emailPassword = getEmailPassword();
    if (!emailPassword) {
      res.status(500).json({
        message: 'Configurazione email mancante: verifica EMAIL_PASSWORD nel file .env del server.'
      });
      return;
    }

    // 1. Inserisci in visitatore (VisitaAttiva = 0 poichè è solo un invito)
    const [result]: any = await db.execute(
      'INSERT INTO visitatore (Nome, Cognome, DataNascita, Email, VisitaAttiva) VALUES (?, ?, ?, ?, ?)',
      [nome, cognome, dataNascita || null, email, 0]
    );
    const idVisitatore = result.insertId;

    // 2. Inserisci in qrGenerati
    const [qrResult]: any = await db.execute(
      'INSERT INTO qrGenerati (IdVisitatore, Nome, Cognome, Email, DataOraInizioValidita, DataOraFineValidita) VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [idVisitatore, nome, cognome, email]
    );
    const idQr = qrResult.insertId;

    // 3. Genera QR
    const qrData = idQr.toString();
    const qrBuffer = await QRCode.toBuffer(qrData, { errorCorrectionLevel: 'M' });

    // 4. Invia email
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: emailPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    let info = await transporter.sendMail({
      from: `"GoGuest System" <${EMAIL_USER}>`,
      to: email,
      subject: "Il tuo QR Code di Ingresso (Invito)",
      text: `Ciao ${nome},\nSei stato invitato come visitatore. Ecco il tuo QR Code per l'ingresso. Mostralo al lettore.`,
      html: `<p>Ciao ${nome},</p><p>Sei stato invitato come visitatore. Ecco il tuo QR Code per l'ingresso. Mostralo al lettore.</p>`,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrBuffer
        }
      ]
    });
    console.log("Email invito inviata con successo a:", email);

    res.status(200).json({ message: 'Visitatore invitato, QR Code generato e inviato' });
  } catch (error) {
    console.error("Errore invito visitatore:", error);
    res.status(500).json({ message: getInviteErrorMessage(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Server Dashboard in ascolto su http://localhost:${PORT}`);
});
