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
    const idVisitatore = req.params.id;

    const connection = await mysql.createConnection(pool);

    const [rows]: any = await connection.execute(
      'SELECT firma FROM visitatore WHERE IdVisitatore = ?', 
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

app.get('/api/idVisitatore', async (req: Request, res: Response) => {
  try {
    const nome = req.query.nome as string;
    const cognome = req.query.cognome as string;
    const azienda = req.query.azienda as string;

    if (!nome || !cognome || !azienda) {
      res.status(400).json({ message: 'Mancano dei dati (nome, cognome o azienda)' });
      return;
    }

    const connection = await mysql.createConnection(pool);
    const [rows]: any = await connection.execute(
      'SELECT id FROM visitatore WHERE Nome = ? AND Cognome = ? AND Azienda = ? LIMIT 1', 
      [nome, cognome, azienda]
    );

    await connection.end();

    if (rows.length > 0) {
      res.status(200).json({ id: rows[0].id });
    } else {
      res.status(404).json({ message: 'Visitatore non trovato' });
    }

  } catch (error) {
    console.error("Errore nel database durante la ricerca dell'ID:", error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

app.post('/api/nuovoUtente', async (req: Request, res: Response) => {
  try {
    const { nome, cognome, azienda, firma } = req.body;

    if (!nome || !cognome || !azienda || !firma) {
      res.status(400).json({ message: 'Dati incompleti. Impossibile salvare l\'utente.' });
      return;
    }

    const connection = await mysql.createConnection(pool);
    const [result]: any = await connection.execute(
      'INSERT INTO Visitatore (Nome, Cognome, Azienda, VisitaAttiva, Firma) VALUES (?, ?, ?, ?, ?)',
      [nome, cognome, azienda, 1, firma]
    );

    await connection.end();

    res.status(201).json({ 
      message: 'Utente salvato con successo!',
      nuovoId: result.insertId 
    });

  } catch (error) {
    console.error("Errore nel database durante il salvataggio:", error);
    res.status(500).json({ message: 'Errore interno del server durante il salvataggio' });
  }
});

app.post('/api/impostaStato', async (req: Request, res: Response) => {
  try {
    const { id, stato } = req.body;

    if (id === undefined || stato === undefined) {
      res.status(400).json({ message: 'Dati incompleti per aggiornare lo stato.' });
      return;
    }

    const connection = await mysql.createConnection(pool);

    // Nota: hai chiamato la tabella "visitatore" nel prompt, ho usato questo nome. 
    // Se la tua tabella si chiama "utenti", cambialo qui!
    await connection.execute(
      'UPDATE visitatore SET VisitaAttiva = ? WHERE id = ?',
      [stato, id]
    );

    await connection.end();

    res.status(200).json({ message: 'Stato visita aggiornato con successo!' });

  } catch (error) {
    console.error("Errore nell'aggiornamento dello stato visita:", error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});