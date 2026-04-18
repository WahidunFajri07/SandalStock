const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function diagnose() {
  console.log('🔍 Starting API Error 500 Diagnosis...');

  // 1. Load env
  const envPath = path.join(process.cwd(), '.env.local');
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
    host:     env.DB_HOST,
    port:     Number(env.DB_PORT) || 3306,
    user:     env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
  };

  try {
    const pool = mysql.createPool(config);
    console.log('✅ Connection pool created.');

    // Test dashboard queries one by one
    const tests = [
      {
        name: 'Summary Stats',
        sql: `SELECT
          (SELECT COUNT(*) FROM categories) AS categories,
          (SELECT COUNT(*) FROM sandals) AS skus,
          COALESCE((SELECT SUM(quantity) FROM stock_in),   0) AS total_in,
          COALESCE((SELECT SUM(quantity) FROM stock_sold), 0) AS total_sold`
      },
      {
        name: 'Stock per Category',
        sql: `SELECT c.id, c.name,
          COALESCE(SUM(si.qty),0) - COALESCE(SUM(ss.qty),0) AS stock,
          COUNT(DISTINCT s.id) AS sku_count
        FROM categories c
        LEFT JOIN sandals s ON s.category_id = c.id
        LEFT JOIN (SELECT sandal_id, SUM(quantity) qty FROM stock_in  GROUP BY sandal_id) si ON si.sandal_id = s.id
        LEFT JOIN (SELECT sandal_id, SUM(quantity) qty FROM stock_sold GROUP BY sandal_id) ss ON ss.sandal_id = s.id
        GROUP BY c.id, c.name
        ORDER BY stock DESC`
      },
      {
        name: 'Low Stock',
        sql: `SELECT s.id, s.name, s.color, s.size, c.name AS category_name,
          COALESCE(si.total_in,0) - COALESCE(ss.total_sold,0) AS stock
        FROM sandals s
        JOIN categories c ON c.id = s.category_id
        LEFT JOIN (SELECT sandal_id, SUM(quantity) total_in   FROM stock_in  GROUP BY sandal_id) si ON si.sandal_id = s.id
        LEFT JOIN (SELECT sandal_id, SUM(quantity) total_sold FROM stock_sold GROUP BY sandal_id) ss ON ss.sandal_id = s.id
        HAVING stock < 10
        ORDER BY stock ASC
        LIMIT 20`
      }
    ];

    for (const test of tests) {
      process.stdout.write(`Testing ${test.name}... `);
      try {
        await pool.query(test.sql);
        console.log('OK');
      } catch (err) {
        console.log('FAILED');
        console.error(`❌ Error in ${test.name}:`, err.message);
      }
    }

    await pool.end();
    console.log('✨ Diagnosis complete.');
  } catch (err) {
    console.error('❌ Critical Error during diagnosis:', err.message);
  }
}

diagnose();
