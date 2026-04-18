import pool from '@/lib/db'
import { auth } from "@/auth"

export const PUT = auth(async function PUT(req, { params }) {
  if (req.auth?.user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  try {
    const { id } = await params
    const { sandal_id, quantity, date, note } = await req.json()
    if (!sandal_id || !quantity || !date) {
      return Response.json({ error: 'sandal_id, quantity and date are required' }, { status: 400 })
    }

    // 1. Get current record to compare
    const [oldRows] = await pool.query('SELECT * FROM stock_sold WHERE id = ?', [id])
    const oldRecord = oldRows[0]
    if (!oldRecord) return Response.json({ error: 'Entry not found' }, { status: 404 })

    // 2. Fetch current stock for the target sandal
    const [stockRows] = await pool.query(
      `SELECT COALESCE(si.total_in,0) - COALESCE(ss.total_sold,0) AS current_stock
       FROM sandals s
       LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_in   FROM stock_in   GROUP BY sandal_id) si ON si.sandal_id = s.id
       LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_sold FROM stock_sold GROUP BY sandal_id) ss ON ss.sandal_id = s.id
       WHERE s.id = ?`,
      [sandal_id]
    )
    const stockRow = stockRows[0]
    
    if (!stockRow) return Response.json({ error: 'Sandal not found' }, { status: 404 })

    // 3. Calculate actual limit (current stock + what was already sold in this record if it's the same sandal)
    let availableLimit = stockRow.current_stock
    if (String(oldRecord.sandal_id) === String(sandal_id)) {
      availableLimit += Number(oldRecord.quantity)
    }

    if (Number(quantity) > availableLimit) {
      return Response.json(
        { error: `Insufficient stock. Maximum possible: ${availableLimit}` },
        { status: 422 }
      )
    }

    await pool.query(
      'UPDATE stock_sold SET sandal_id=?, quantity=?, date=?, note=? WHERE id=?',
      [sandal_id, quantity, date, note || null, id]
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
    await pool.query('DELETE FROM stock_sold WHERE id = ?', [id])
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})
