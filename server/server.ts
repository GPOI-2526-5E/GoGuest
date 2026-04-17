import express from 'express';
import type { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// Configurazione Database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',  
  database: 'goguest',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- RICERCA ID INTELLIGENTE ---
app.get('/api/idVisitatore', async (req: Request, res: Response) => {
  try {
    const nome = req.query.nome as string;
    const cognome = req.query.cognome as string;
    const azienda = req.query.azienda as string;
    const dateOfBirth = req.query.dateOfBirth as string;

    if (!nome || !cognome) {
      res.status(400).json({ message: 'Nome e Cognome sono obbligatori' });
      return;
    }

    // Partiamo dalla ricerca base
    let querySql = 'SELECT IdVisitatore, VisitaAttiva FROM visitatore WHERE Nome = ? AND Cognome = ?';
    let params: any[] = [nome, cognome];

    // Aggiungiamo Filtro Azienda solo se esiste (Ingresso)
    if (azienda && azienda !== 'undefined' && azienda.trim() !== '') {
      querySql += ' AND Azienda = ?';
      params.push(azienda);
    }

    // Aggiungiamo Filtro Data Nascita solo se esiste (Uscita)
    if (dateOfBirth && dateOfBirth !== 'undefined' && dateOfBirth.trim() !== '') {
      querySql += ' AND DataNascita = ?';
      params.push(dateOfBirth);
    }

    querySql += ' ORDER BY IdVisitatore DESC LIMIT 1';

    const [rows]: any = await pool.execute(querySql, params);

    if (rows.length > 0) {
      res.status(200).json({ 
        id: rows[0].IdVisitatore,
        visitaAttiva: rows[0].VisitaAttiva
      });
    } else {
      res.status(404).json({ message: 'Visitatore non trovato' });
    }
  } catch (error) {
    console.error("Errore ricerca ID:", error);
    res.status(500).json({ message: 'Errore server' });
  }
});

// --- RECUPERO FIRMA ---
app.get('/api/firma/:id', async (req: Request, res: Response) => {
  try {
    const idVisitatore = req.params.id;
    const [rows]: any = await pool.execute(
      'SELECT Firma FROM visitatore WHERE IdVisitatore = ?', 
      [idVisitatore]
    );

    if (rows.length > 0) {
      res.status(200).json({ firma: rows[0].Firma });
    } else {
      res.status(404).json({ message: 'Firma non trovata' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Errore recupero firma' });
  }
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

app.listen(PORT, () => console.log(`Server attivo su http://localhost:${PORT}`));