import mysql from 'mysql2/promise';
async function test() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'goguest' });
  try {
     const [result]: any = await pool.execute(
      'INSERT INTO qrGenerati (Nome, Cognome, Email, Referente, DataOraIngresso) VALUES (?, ?, ?, ?, NOW())',
      ['Test', 'Test', 'test@test.com', 'Ref']
    );
    console.log("Success", result);
  } catch (err) {
    console.error("DB Error:", err);
  }
  process.exit();
}
test();
