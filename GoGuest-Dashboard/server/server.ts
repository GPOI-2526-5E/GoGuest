/*
import express from 'express';
import type { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

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

// ──────────────────────────────────────────────
// GET /api/visite?periodo=oggi|mese|anno
// ──────────────────────────────────────────────
app.get('/api/visite', async (req: Request, res: Response) => {
  const periodo = (req.query['periodo'] as string) ?? 'oggi';

  let whereClause: string;
  switch (periodo) {
    case 'mese':
      whereClause = `MONTH(v.DataOraIngresso) = MONTH(CURDATE())
                     AND YEAR(v.DataOraIngresso)  = YEAR(CURDATE())`;
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

app.listen(PORT, () => {
  console.log(`Server Dashboard in ascolto su http://localhost:${PORT}`);
});

// --- SALVATAGGIO NUOVO UTENTE  ---
app.post('/api/nuovoUtente', async (req: Request, res: Response) => {
  try {
    const { nome, cognome, azienda, dataNascita, firma, email } = req.body;

    if (!nome || !cognome || !firma) {
      res.status(400).json({ message: 'Dati incompleti' });
      return;
    }

    const [result]: any = await pool.execute(
      'INSERT INTO visitatore (Nome, Cognome, Azienda, Email, VisitaAttiva, Firma, DataNascita) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, cognome, azienda || '', email || null, 1, firma, dataNascita || null]
    );

    res.status(201).json({ message: 'Utente salvato!', nuovoId: result.insertId });
  } catch (error) {
    console.error("Errore salvataggio:", error);
    res.status(500).json({ message: 'Errore database' });
  }
});

// --- AGGIORNAMENTO STATO  ---
app.post('/api/impostaStato', async (req: Request, res: Response) => {
  try {
    const { id, stato, referente } = req.body;
    await pool.execute(
      'UPDATE visitatore SET VisitaAttiva = ? WHERE IdVisitatore = ?',
      [stato, id]
    );

    if (stato === 1) {
      await pool.execute(
        'INSERT INTO visita (IdVisitatore, NomeReferente, DataOraIngresso) VALUES (?, ?, NOW())',
        [id, referente || null]
      );
    } else if (stato === 0) {
      // Se vuoi chiudere l'ultima visita aperta (opzionale ma utile)
      await pool.execute(
        'UPDATE visita SET DataOraUscita = NOW() WHERE IdVisitatore = ? AND DataOraUscita IS NULL ORDER BY IdVisita DESC LIMIT 1',
        [id]
      );
    }

    res.status(200).json({ message: 'Stato aggiornato' });
  } catch (error) {
    res.status(500).json({ message: 'Errore aggiornamento' });
  }
});

// --- GENERAZIONE QR CODE ---
app.post('/api/generate-qr', async (req: Request, res: Response) => {
  try {
    const { idVisitatore, nome, cognome, email, referente } = req.body;

    if (!nome || !cognome) {
       res.status(400).json({ message: 'Nome e Cognome obbligatori' });
       return;
    }

    // 1. Inserisci in DB e ottieni IdQr (imposto FineValidita a 4 ore da adesso)
    const [result]: any = await pool.execute(
      'INSERT INTO qrGenerati (IdVisitatore, Nome, Cognome, Email, Referente, DataOraInizioValidita, DataOraFineValidita) VALUES (?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 4 HOUR))',
      [idVisitatore || null, nome, cognome, email || null, referente || null]
    );
    const idQr = result.insertId;

    // 2. Genera QR code contenente solo l'ID
    const qrData = idQr.toString();
    const qrBuffer = await QRCode.toBuffer(qrData, { errorCorrectionLevel: 'M' });

    // 3. Invia email se l'utente l'ha fornita
    if (email) {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'goguest2026@gmail.com',
          pass: (process.env.EMAIL_PASSWORD || 'inserisci_la_password_qui').replace(/\s/g, '')
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      let info = await transporter.sendMail({
        from: '"GoGuest System" <goguest2026@gmail.com>',
        to: email,
        subject: "Il tuo QR Code di Ingresso",
        text: `Ciao ${nome},\necco il tuo QR Code per l'ingresso. Mostralo al lettore.`,
        html: `<p>Ciao ${nome},</p><p>Ecco il tuo QR Code per l'ingresso. Mostralo al lettore.</p>`,
        attachments: [
          {
            filename: 'qrcode.png',
            content: qrBuffer
          }
        ]
      });
      console.log("Email inviata con successo a:", email);
    }

    res.status(200).json({ message: 'QR Code generato e inviato' });
  } catch (error) {
    console.error("Errore generazione QR:", error);
    res.status(500).json({ message: 'Errore interno' });
  }
});

// --- SCANSIONE QR CODE ---
app.post('/api/scan-qr', async (req: Request, res: Response) => {
  try {
    const { idQr, action } = req.body;

    if (!idQr || !action) {
      res.status(400).json({ message: 'ID QR e Azione sono obbligatori' });
      return;
    }

    // 1. Verifica se il QR esiste ed è ancora valido
    const [qrRows]: any = await pool.execute(
      'SELECT IdVisitatore, Referente, DataOraFineValidita FROM qrGenerati WHERE IdQr = ?',
      [idQr]
    );

    if (qrRows.length === 0) {
      res.status(404).json({ message: 'QR Code non trovato' });
      return;
    }

    const qrRecord = qrRows[0];
    const oraAttuale = new Date();
    const scadenza = new Date(qrRecord.DataOraFineValidita);

    if (oraAttuale > scadenza) {
      res.status(400).json({ message: 'QR Code scaduto' });
      return;
    }

    const idVisitatore = qrRecord.IdVisitatore;
    if (!idVisitatore) {
      res.status(400).json({ message: 'Nessun Visitatore associato a questo QR Code' });
      return;
    }

    // 2. Recupera Info Visitatore
    const [visitatoreRows]: any = await pool.execute(
      'SELECT Nome, Cognome, VisitaAttiva FROM visitatore WHERE IdVisitatore = ?',
      [idVisitatore]
    );

    if (visitatoreRows.length === 0) {
      res.status(404).json({ message: 'Visitatore non trovato' });
      return;
    }

    const visitatore = visitatoreRows[0];
    const nomeCompleto = `${visitatore.Nome} ${visitatore.Cognome}`;

    // 3. Esegui l'azione richiesta
    if (action === 'entry') {
      if (visitatore.VisitaAttiva === 1) {
        res.status(400).json({ message: `Attenzione: ${nomeCompleto} risulta già all'interno dell'azienda.` });
        return;
      }
      
      await pool.execute('UPDATE visitatore SET VisitaAttiva = 1 WHERE IdVisitatore = ?', [idVisitatore]);
      await pool.execute(
        'INSERT INTO visita (IdVisitatore, NomeReferente, DataOraIngresso) VALUES (?, ?, NOW())',
        [idVisitatore, qrRecord.Referente || null]
      );
      
      res.status(200).json({ message: `Ingresso registrato! Benvenuto, ${nomeCompleto}.` });
    } 
    else if (action === 'exit') {
      if (visitatore.VisitaAttiva === 0) {
        res.status(400).json({ message: `Attenzione: ${nomeCompleto} risulta già fuori dall'azienda.` });
        return;
      }

      await pool.execute('UPDATE visitatore SET VisitaAttiva = 0 WHERE IdVisitatore = ?', [idVisitatore]);
      await pool.execute(
        'UPDATE visita SET DataOraUscita = NOW() WHERE IdVisitatore = ? AND DataOraUscita IS NULL ORDER BY IdVisita DESC LIMIT 1',
        [idVisitatore]
      );

      res.status(200).json({ message: `Uscita registrata! Arrivederci, ${nomeCompleto}.` });
    } 
    else {
      res.status(400).json({ message: 'Azione non valida' });
    }

  } catch (error) {
    console.error("Errore scansione QR:", error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// --- JOB SCHEDULATO PER CHIUSURA AUTOMATICA VISITE ---
const ORE_SCADENZA = 4;
const INTERVALLO_CONTROLLO_MS = 30 * 60 * 1000; // Controlla ogni 30 minuti

setInterval(async () => {
  try {
    const query = `
      UPDATE visitatore v
      JOIN visita vi ON v.IdVisitatore = vi.IdVisitatore
      SET v.VisitaAttiva = 0, vi.DataOraUscita = NOW()
      WHERE v.VisitaAttiva = 1 
        AND vi.DataOraUscita IS NULL 
        AND vi.DataOraIngresso < DATE_SUB(NOW(), INTERVAL ? HOUR)
    `;
    const [result]: any = await pool.execute(query, [ORE_SCADENZA]);
    
    if (result.affectedRows > 0) {
      console.log(`Chiusura automatica: chiuse/modificate ${result.affectedRows} visite scadute da più di ${ORE_SCADENZA} ore.`);
    }
  } catch (error) {
    console.error("Errore nel job di chiusura automatica:", error);
  }
}, INTERVALLO_CONTROLLO_MS);
*/
