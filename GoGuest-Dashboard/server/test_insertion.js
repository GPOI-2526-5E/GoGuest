const mysql = require('mysql2/promise');

async function test() {
  const db = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'goguest' });
  try {
    const [result] = await db.execute(
      'INSERT INTO visitatore (Nome, Cognome, DataNascita, Email, VisitaAttiva) VALUES (?, ?, ?, ?, ?)',
      ['TestNome', 'TestCognome', null, 'test@test.com', 0]
    );
    const idVisitatore = result.insertId;
    console.log("Inserito visitatore, ID:", idVisitatore);

    const [qrResult] = await db.execute(
      'INSERT INTO qrGenerati (IdVisitatore, Nome, Cognome, Email, DataOraInizioValidita, DataOraFineValidita) VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [idVisitatore, 'TestNome', 'TestCognome', 'test@test.com']
    );
    console.log("Inserito qr, ID:", qrResult.insertId);

  } catch (err) {
    console.error("ERRORE SQL:", err);
  }
  process.exit();
}
test();
