import pool from '@/lib/db'
import { auth } from "@/auth"

export const GET = auth(async function GET(request) {
  if (!request.auth) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const color = searchParams.get('color')
    const size = searchParams.get('size')

    let query = `
      SELECT s.id, s.category_id, s.code, s.name, s.color, s.size, s.created_at,
             c.name AS category_name,
             COALESCE(si.total_in, 0) - COALESCE(ss.total_sold, 0) AS stock
      FROM sandals s
      JOIN categories c ON c.id = s.category_id
      LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_in FROM stock_in GROUP BY sandal_id) si ON si.sandal_id = s.id
      LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_sold FROM stock_sold GROUP BY sandal_id) ss ON ss.sandal_id = s.id
      WHERE 1=1
    `
    const values = []
    if (categoryId) { query += ' AND s.category_id = ?'; values.push(categoryId) }
    if (color)      { query += ' AND s.color = ?';       values.push(color) }
    if (size)       { query += ' AND s.size = ?';        values.push(size) }
    query += ' ORDER BY s.created_at DESC'

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
    const { category_id, code, name, color, size } = await req.json()
    if (!category_id || !code?.trim() || !name?.trim() || !color?.trim() || !size?.trim()) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }
    const [result] = await pool.query(
      'INSERT INTO sandals (category_id, code, name, color, size) VALUES (?, ?, ?, ?, ?)',
      [category_id, code.trim(), name.trim(), color.trim(), size.trim()]
    )
    return Response.json({ id: result.insertId }, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})
