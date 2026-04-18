import pool from '@/lib/db'
import { auth } from "@/auth"

export const GET = auth(async function GET(request) {
  if (!request.auth) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // 1. Summary stats
    const [[statsRow]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM categories) AS categories,
        (SELECT COUNT(*) FROM sandals) AS skus,
        COALESCE((SELECT SUM(quantity) FROM stock_in),   0) AS total_in,
        COALESCE((SELECT SUM(quantity) FROM stock_sold), 0) AS total_sold
    `)

    // 2. Stock per category
    const [categoryStock] = await pool.query(`
      SELECT c.id, c.name,
        COALESCE(SUM(si.qty),0) - COALESCE(SUM(ss.qty),0) AS stock,
        COUNT(DISTINCT s.id) AS sku_count
      FROM categories c
      LEFT JOIN sandals s ON s.category_id = c.id
      LEFT JOIN (SELECT sandal_id, SUM(quantity) qty FROM stock_in  GROUP BY sandal_id) si ON si.sandal_id = s.id
      LEFT JOIN (SELECT sandal_id, SUM(quantity) qty FROM stock_sold GROUP BY sandal_id) ss ON ss.sandal_id = s.id
      GROUP BY c.id, c.name
      ORDER BY stock DESC
    `)

    // 3. Daily trend last N days
    const [trendIn] = await pool.query(`
      SELECT DATE(date) AS day, SUM(quantity) AS qty
      FROM stock_in
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(date)
      ORDER BY day ASC
    `, [days])

    const [trendSold] = await pool.query(`
      SELECT DATE(date) AS day, SUM(quantity) AS qty
      FROM stock_sold
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(date)
      ORDER BY day ASC
    `, [days])

    // 4. Low stock (< 10)
    const [lowStock] = await pool.query(`
      SELECT s.id, s.name, s.color, s.size, c.name AS category_name,
        COALESCE(si.total_in,0) - COALESCE(ss.total_sold,0) AS stock
      FROM sandals s
      JOIN categories c ON c.id = s.category_id
      LEFT JOIN (SELECT sandal_id, SUM(quantity) total_in   FROM stock_in  GROUP BY sandal_id) si ON si.sandal_id = s.id
      LEFT JOIN (SELECT sandal_id, SUM(quantity) total_sold FROM stock_sold GROUP BY sandal_id) ss ON ss.sandal_id = s.id
      HAVING stock < 10
      ORDER BY stock ASC
      LIMIT 20
    `)

    // 5. Recent activities (last 10 combined)
    const [recentIn] = await pool.query(`
      SELECT si.id, 'in' AS type, si.date, si.quantity, s.name AS sandal_name, s.color, s.size
      FROM stock_in si JOIN sandals s ON s.id = si.sandal_id
      ORDER BY si.date DESC, si.id DESC LIMIT 8
    `)
    const [recentSold] = await pool.query(`
      SELECT ss.id, 'sold' AS type, ss.date, ss.quantity, s.name AS sandal_name, s.color, s.size
      FROM stock_sold ss JOIN sandals s ON s.id = ss.sandal_id
      ORDER BY ss.date DESC, ss.id DESC LIMIT 8
    `)

    return Response.json({
      stats: {
        ...statsRow,
        current_stock: Number(statsRow.total_in) - Number(statsRow.total_sold),
      },
      categoryStock: categoryStock.map(r => ({ ...r, stock: Number(r.stock) })),
      trendIn:   trendIn.map(r   => ({ day: r.day?.toISOString?.()?.slice(0,10) ?? r.day, qty: Number(r.qty) })),
      trendSold: trendSold.map(r => ({ day: r.day?.toISOString?.()?.slice(0,10) ?? r.day, qty: Number(r.qty) })),
      lowStock:  lowStock.map(r  => ({ ...r, stock: Number(r.stock) })),
      recentIn,
      recentSold,
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})
