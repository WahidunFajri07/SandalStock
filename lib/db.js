import mysql from 'mysql2/promise';

let pool;

if (process.env.DATABASE_URL) {
  // Production: Pakai DATABASE_URL dari Vercel (TiDB Cloud) dengan konfigurasi SSL wajib
  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true
    }
  });
} else {
  // Development lokal: Fallback ke konfigurasi terpisah
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kembar_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

// Ekspor pool langsung sebagai export default
export default pool;

// Query helper (opsional, jika masih ada yang import { query })
export async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}