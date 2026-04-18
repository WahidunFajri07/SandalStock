import pool from '@/lib/db'
import { auth } from "@/auth"

export const GET = auth(async function GET(request) {
  if (!request.auth) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const startDate  = searchParams.get('startDate')
    const endDate    = searchParams.get('endDate')
    const categoryId = searchParams.get('categoryId')

    let siWhere = '1=1', ssWhere = '1=1'
    const siVals = [], ssVals = []
    if (startDate) { siWhere += ' AND date >= ?'; siVals.push(startDate); ssWhere += ' AND date >= ?'; ssVals.push(startDate) }
    if (endDate)   { siWhere += ' AND date <= ?'; siVals.push(endDate);   ssWhere += ' AND date <= ?'; ssVals.push(endDate) }

    let query = `
      SELECT s.id, s.code, s.name, s.color, s.size,
             c.name AS category_name,
             COALESCE(sip.total_in, 0)   AS stock_in,
             COALESCE(ssp.total_sold, 0) AS stock_sold,
             (COALESCE(sit.all_in, 0) - COALESCE(sst.all_sold, 0)) AS current_stock
      FROM sandals s
      JOIN categories c ON c.id = s.category_id
      LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_in   FROM stock_in   WHERE ${siWhere} GROUP BY sandal_id) sip ON sip.sandal_id = s.id
      LEFT JOIN (SELECT sandal_id, SUM(quantity) AS total_sold FROM stock_sold WHERE ${ssWhere} GROUP BY sandal_id) ssp ON ssp.sandal_id = s.id
      LEFT JOIN (SELECT sandal_id, SUM(quantity) AS all_in    FROM stock_in    GROUP BY sandal_id) sit ON sit.sandal_id = s.id
      LEFT JOIN (SELECT sandal_id, SUM(quantity) AS all_sold  FROM stock_sold  GROUP BY sandal_id) sst ON sst.sandal_id = s.id
      WHERE 1=1
    `
    const values = [...siVals, ...ssVals]
    if (categoryId) { query += ' AND s.category_id = ?'; values.push(categoryId) }
    query += ' ORDER BY c.name, s.name'

    const [rows] = await pool.query(query, values)
    return Response.json(rows)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})
