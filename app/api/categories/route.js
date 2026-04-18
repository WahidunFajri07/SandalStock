import pool from '@/lib/db'
import { auth } from "@/auth"

export const GET = auth(async function GET(req) {
  if (!req.auth) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.name, c.created_at, COUNT(s.id) AS total_skus
      FROM categories c
      LEFT JOIN sandals s ON s.category_id = c.id
      GROUP BY c.id, c.name, c.created_at
      ORDER BY c.created_at DESC
    `)
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
    const { name } = await req.json()
    if (!name?.trim()) return Response.json({ error: 'Name is required' }, { status: 400 })
    const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name.trim()])
    return Response.json({ id: result.insertId, name: name.trim() }, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})
