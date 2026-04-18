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

    // Validate: cannot reduce stock below sold quantity
    const [rows] = await pool.query(
      `SELECT COALESCE(si_other.total_in, 0) AS total_in_others,
              COALESCE(ss.total_sold, 0) AS total_sold
       FROM sandals s
       LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_in FROM stock_in WHERE id != ? GROUP BY sandal_id) si_other ON si_other.sandal_id = s.id
       LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_sold FROM stock_sold GROUP BY sandal_id) ss ON ss.sandal_id = s.id
       WHERE s.id = ?`,
      [id, sandal_id]
    )
    const stockRow = rows[0]
    const newTotalIn = (stockRow?.total_in_others || 0) + Number(quantity)
    if (newTotalIn < (stockRow?.total_sold || 0)) {
      return Response.json({ error: `Cannot reduce quantity. Total sold (${stockRow.total_sold}) would exceed total in (${newTotalIn}).` }, { status: 422 })
    }

    await pool.query(
      'UPDATE stock_in SET sandal_id=?, quantity=?, date=?, note=? WHERE id=?',
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
    
    // Validate: cannot delete if it makes stock negative
    const [rows] = await pool.query(
      `SELECT si.sandal_id, si.quantity AS this_qty,
              COALESCE(all_si.total_in, 0) AS total_in,
              COALESCE(all_ss.total_sold, 0) AS total_sold
       FROM stock_in si
       LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_in FROM stock_in GROUP BY sandal_id) all_si ON all_si.sandal_id = si.sandal_id
       LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_sold FROM stock_sold GROUP BY sandal_id) all_ss ON all_ss.sandal_id = si.sandal_id
       WHERE si.id = ?`,
      [id]
    )
    const stockRow = rows[0]
    
    if (stockRow && (stockRow.total_in - stockRow.this_qty) < stockRow.total_sold) {
      return Response.json({ error: `Cannot delete record. Sold items (${stockRow.total_sold}) exceed remaining stock in (${stockRow.total_in - stockRow.this_qty}).` }, { status: 422 })
    }

    await pool.query('DELETE FROM stock_in WHERE id = ?', [id])
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})
