const mysql = require('mysql2/promise');
async function run() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'goguest' });
  try {
    await pool.execute('ALTER TABLE qrGenerati MODIFY IdQr INT AUTO_INCREMENT');
    console.log('Altered table successfully');
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
run();
