// db.js - ConexiÃ³n desacoplada y estable a MariaDB
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'outfitya_user',
  password: '123456',
  database: 'outfitya_db',
  port: 5234,                   // Puerto real de tu MariaDB en HeidiSQL
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('âœ… MariaDB outfitya_db conectada con Ã©xito');
    conn.release();
  } catch (e) {
    console.error('âŒ Error detallado MariaDB:', e.code || e.message || e);
  }
})();

module.exports = pool;