import mysql from 'mysql2/promise';

// Gunakan DATABASE_URL jika ada, fallback ke konfigurasi terpisah
let pool = null;

async function getPool() {
  if (!pool) {
    if (process.env.DATABASE_URL) {
      // Production: Pakai DATABASE_URL dari Vercel (TiDB Cloud)
      pool = mysql.createPool(process.env.DATABASE_URL);
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
  }
  return pool;
}

// Query helper
export async function query(sql, params) {
  const pool = await getPool();
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Untuk backward compatibility (jika ada yang import pool langsung)
export default async function getDb() {
  return getPool();
}

// Ekspor pool untuk penggunaan langsung (hati-hati dengan top-level await)
export { getPool };