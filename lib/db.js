import mysql from 'mysql2/promise'

// Support both local dev and cloud MySQL (PlanetScale, Aiven, Railway, TiDB)
const isCloud = process.env.DB_HOST && process.env.DB_HOST !== 'localhost'

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'kembar_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  // SSL required for cloud providers
  ...(isCloud && {
    ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
  }),
})

export default pool
