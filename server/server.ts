import express, { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// Crea un "Pool" di connessioni a MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',  
  database: 'goguest',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/firma/:id', async (req: Request, res: Response) => {
  try {
    // Prendiamo l'ID dall'indirizzo web
    const idVisitatore = req.params.id;

    // 1. Ci connettiamo al database
    const connection = await mysql.createConnection(pool);

    const [rows]: any = await connection.execute(
      'SELECT firma FROM utenti WHERE id = ?', 
      [idVisitatore]
    );

    await connection.end();

    if (rows.length > 0) {
      // Trovato
      res.status(200).json({ firma: rows[0].firma_base64 });
    } else {
      // Non trovato
      res.status(404).json({ message: 'Visitatore non trovato' });
    }

  } catch (error) {
    console.error("Errore nel database:", error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});