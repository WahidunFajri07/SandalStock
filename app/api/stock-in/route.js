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
      SELECT si.*, s.name AS sandal_name, s.color, s.size, c.name AS category_name
      FROM stock_in si
      JOIN sandals s ON s.id = si.sandal_id
      JOIN categories c ON c.id = s.category_id
      WHERE 1=1
    `
    const values = []
    if (sandalId)  { query += ' AND si.sandal_id = ?'; values.push(sandalId) }
    if (startDate) { query += ' AND si.date >= ?';     values.push(startDate) }
    if (endDate)   { query += ' AND si.date <= ?';     values.push(endDate) }
    query += ' ORDER BY si.date DESC, si.created_at DESC'

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
    const [result] = await pool.query(
      'INSERT INTO stock_in (sandal_id, quantity, date, note) VALUES (?, ?, ?, ?)',
      [sandal_id, quantity, date, note || null]
    )
    return Response.json({ id: result.insertId }, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})
