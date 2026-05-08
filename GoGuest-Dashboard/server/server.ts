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
