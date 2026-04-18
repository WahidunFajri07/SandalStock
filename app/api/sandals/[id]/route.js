import pool from '@/lib/db'
import { auth } from "@/auth"

export const GET = auth(async function GET(req, { params }) {
  if (!req.auth) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  try {
    const { id } = await params
    const [rows] = await pool.query(
      `SELECT s.id, s.category_id, s.code, s.name, s.color, s.size, s.created_at,
              c.name AS category_name,
              COALESCE(si.total_in,0) - COALESCE(ss.total_sold,0) AS stock
       FROM sandals s
       JOIN categories c ON c.id = s.category_id
       LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_in FROM stock_in GROUP BY sandal_id) si ON si.sandal_id = s.id
       LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_sold FROM stock_sold GROUP BY sandal_id) ss ON ss.sandal_id = s.id
       WHERE s.id = ?`,
      [id]
    )
    if (!rows.length) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(rows[0])
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})

export const PUT = auth(async function PUT(req, { params }) {
  if (req.auth?.user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  try {
    const { id } = await params
    const { category_id, code, name, color, size } = await req.json()
    if (!category_id || !code?.trim() || !name?.trim() || !color?.trim() || !size?.trim()) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }
    await pool.query(
      'UPDATE sandals SET category_id=?, code=?, name=?, color=?, size=? WHERE id=?',
      [category_id, code.trim(), name.trim(), color.trim(), size.trim(), id]
    )
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})

export const DELETE = auth(async function DELETE(req, { params }) {
  if (req.auth?.user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  try {
    const { id } = await params
    await pool.query('DELETE FROM sandals WHERE id = ?', [id])
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})
