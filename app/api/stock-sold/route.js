import pool from '@/lib/db'
import { auth } from "@/auth"

export const GET = auth(async function GET(request) {
  if (!request.auth) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const sandalId  = searchParams.get('sandalId')
    const startDate = searchParams.get('startDate')
    const endDate   = searchParams.get('endDate')

    let query = `
      SELECT ss.*, s.name AS sandal_name, s.color, s.size, c.name AS category_name
      FROM stock_sold ss
      JOIN sandals s ON s.id = ss.sandal_id
      JOIN categories c ON c.id = s.category_id
      WHERE 1=1
    `
    const values = []
    if (sandalId)  { query += ' AND ss.sandal_id = ?'; values.push(sandalId) }
    if (startDate) { query += ' AND ss.date >= ?';     values.push(startDate) }
    if (endDate)   { query += ' AND ss.date <= ?';     values.push(endDate) }
    query += ' ORDER BY ss.date DESC, ss.created_at DESC'

    const [rows] = await pool.query(query, values)
    return Response.json(rows)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})

export const POST = auth(async function POST(req) {
  if (req.auth?.user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  try {
    const { sandal_id, quantity, date, note } = await req.json()
    if (!sandal_id || !quantity || !date) {
      return Response.json({ error: 'sandal_id, quantity and date are required' }, { status: 400 })
    }

    // Validate: cannot sell more than current stock
    const [rows] = await pool.query(
      `SELECT COALESCE(si.total_in,0) - COALESCE(ss.total_sold,0) AS current_stock
       FROM sandals s
       LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_in   FROM stock_in   GROUP BY sandal_id) si ON si.sandal_id = s.id
       LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_sold FROM stock_sold GROUP BY sandal_id) ss ON ss.sandal_id = s.id
       WHERE s.id = ?`,
      [sandal_id]
    )
    const stockRow = rows[0];
    if (!stockRow) return Response.json({ error: 'Sandal not found' }, { status: 404 })
    if (quantity > stockRow.current_stock) {
      return Response.json(
        { error: `Insufficient stock. Available: ${stockRow.current_stock}` },
        { status: 422 }
      )
    }

    const [result] = await pool.query(
      'INSERT INTO stock_sold (sandal_id, quantity, date, note) VALUES (?, ?, ?, ?)',
      [sandal_id, quantity, date, note || null]
    )
    return Response.json({ id: result.insertId }, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})
