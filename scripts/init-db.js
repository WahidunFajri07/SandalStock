const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function init() {
  console.log('🚀 Starting Database Initialization...');

  // 1. Load environment variables manually
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found! Please create it first.');
    process.exit(1);
  }

  const env = Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split('\n')
      .filter(l => l.includes('=') && !l.trim().startsWith('#'))
      .map(l => {
        const [k, ...v] = l.trim().split('=');
        return [k.trim(), v.join('=').trim()];
      })
  );

  const config = {
    host:     env.DB_HOST || 'localhost',
    port:     Number(env.DB_PORT) || 3306,
    user:     env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'kembar_db'
  };

  const ssl = (config.host !== 'localhost') 
    ? { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } 
    : null;

  try {
    // 2. Connect to server (without database name) to check connection
    console.log(`📡 Connecting to MySQL at ${config.host}:${config.port}...`);
    const serverConn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      ssl: ssl
    });

    // On cloud providers like Aiven, the database often already exists (e.g. 'defaultdb')
    // We try to create it, but ignore error if we don't have permissions and it's already there
    try {
      console.log(`💎 Checking database '${config.database}'...`);
      await serverConn.query(`CREATE DATABASE IF NOT EXISTS ${config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    } catch (dbErr) {
      console.log(`⚠️ Note: Could not run CREATE DATABASE (this is normal on some cloud providers). Continuing...`);
    }
    await serverConn.end();

    // 3. Connect to the database and run schema
    console.log(`📝 Executing schema.sql...`);
    const dbConn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      multipleStatements: true,
      ssl: ssl
    });

    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await dbConn.query(schemaSql);
    console.log('✅ Schema application successful.');

    // 4. Seed Users
    console.log('👤 Seeding default users...');
    const adminHash = await bcrypt.hash('adminpassword', 10);
    const userHash  = await bcrypt.hash('userpassword', 10);

    await dbConn.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?), (?, ?, ?)',
      ['admin', adminHash, 'admin', 'user', userHash, 'user']
    );
    console.log('✅ Users seeded successfully.');
    
    await dbConn.end();
    console.log('🎉 Database is ready!');

  } catch (err) {
    console.error('❌ Initialization failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('👉 Tip: Make sure your MySQL service is running!');
    }
    process.exit(1);
  }
}

init();
