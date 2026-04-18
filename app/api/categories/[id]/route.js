import pool from '@/lib/db'
import { auth } from "@/auth"

export const GET = auth(async function GET(req, { params }) {
  if (!req.auth) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  try {
    const { id } = await params
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id])
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
    const { name } = await req.json()
    if (!name?.trim()) return Response.json({ error: 'Name is required' }, { status: 400 })
    await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name.trim(), id])
    return Response.json({ id: Number(id), name: name.trim() })
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
    await pool.query('DELETE FROM categories WHERE id = ?', [id])
    return Response.json({ success: true })
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return Response.json({ error: 'Cannot delete category because it contains sandals. Delete the sandals first.' }, { status: 409 })
    }
    return Response.json({ error: err.message }, { status: 500 })
  }
})
