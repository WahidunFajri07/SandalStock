import pool from '@/lib/db'
import { auth } from "@/auth"

async function getReportData(startDate, endDate, categoryId) {
  let siWhere = '1=1', ssWhere = '1=1'
  const siVals = [], ssVals = []
  if (startDate) { siWhere += ' AND date >= ?'; siVals.push(startDate); ssWhere += ' AND date >= ?'; ssVals.push(startDate) }
  if (endDate)   { siWhere += ' AND date <= ?'; siVals.push(endDate);   ssWhere += ' AND date <= ?'; ssVals.push(endDate) }

  let query = `
    SELECT s.code, s.name, s.color, s.size,
           c.name AS category_name,
           COALESCE(sip.total_in, 0)   AS stock_in,
           COALESCE(ssp.total_sold, 0) AS stock_sold,
           (COALESCE(sit.all_in, 0) - COALESCE(sst.all_sold, 0)) AS current_stock
    FROM sandals s
    LEFT JOIN categories c ON c.id = s.category_id
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
  
  // Calculate Sell Through for each row
  return rows.map(r => {
    const available = Number(r.stock_sold) + Number(r.current_stock)
    const st = available > 0 ? Math.round((Number(r.stock_sold) / available) * 100) : 0
    return { ...r, sell_through: st }
  })
}

export const GET = auth(async function GET(request) {
  if (!request.auth) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const format     = searchParams.get('format') || 'csv'
    const startDate  = searchParams.get('startDate')
    const endDate    = searchParams.get('endDate')
    const categoryId = searchParams.get('categoryId')

    const rows = await getReportData(startDate, endDate, categoryId)

    // ── CSV ──────────────────────────────────────────────────────────────────
    if (format === 'csv') {
      const header = 'No,Code,Sandal Name,Category,Color,Size,Stock In,Stock Sold,Current Stock,Sell Through (%)'
      const lines = rows.map((r, i) =>
        [i + 1, `"${r.code || ''}"`, `"${r.name}"`, `"${r.category_name || 'Uncategorized'}"`, r.color, r.size, r.stock_in, r.stock_sold, r.current_stock, `${r.sell_through}%`].join(',')
      )
      // Add BOM and use CRLF for Excel compatibility
      const csv = '\uFEFF' + [header, ...lines].join('\r\n')
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Length': Buffer.byteLength(csv).toString(),
          'Content-Disposition': 'attachment; filename="sandal-report.csv"',
        },
      })
    }

    // ── Excel ─────────────────────────────────────────────────────────────────
    if (format === 'excel') {
      const ExcelJS = (await import('exceljs')).default
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Report')

      // Define columns
      worksheet.columns = [
        { header: 'No',              key: 'no',           width: 5 },
        { header: 'Code',            key: 'code',         width: 15 },
        { header: 'Sandal Name',     key: 'name',         width: 25 },
        { header: 'Category',        key: 'category',     width: 15 },
        { header: 'Color',           key: 'color',        width: 12 },
        { header: 'Size',            key: 'size',         width: 8 },
        { header: 'Stock In',        key: 'stock_in',     width: 10 },
        { header: 'Stock Sold',      key: 'stock_sold',   width: 10 },
        { header: 'Current Stock',   key: 'current_stock', width: 12 },
        { header: 'Sell Through (%)', key: 'sell_through', width: 15 },
      ]

      // Style header row
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } } // blue-600
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

      // Add data
      rows.forEach((r, i) => {
        worksheet.addRow({
          no: i + 1,
          code: r.code || '-',
          name: r.name,
          category: r.category_name || 'Uncategorized',
          color: r.color,
          size: r.size,
          stock_in: Number(r.stock_in),
          stock_sold: Number(r.stock_sold),
          current_stock: Number(r.current_stock),
          sell_through: `${r.sell_through}%`,
        })
      })

      // Finalize buffer
      const buf = await workbook.xlsx.writeBuffer()
      
      return new Response(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Length': buf.length.toString(),
          'Content-Disposition': 'attachment; filename="sandal-report.xlsx"',
        },
      })
    }

    // ── PDF ───────────────────────────────────────────────────────────────────
    if (format === 'pdf') {
      const { jsPDF } = await import('jspdf')
      const autoTable  = (await import('jspdf-autotable')).default
      const doc = new jsPDF({ orientation: 'landscape' })
      doc.setFontSize(14)
      doc.text('Sandal Stock Report', 14, 15)
      autoTable(doc, {
        startY: 22,
        head: [['No', 'Code', 'Sandal Name', 'Category', 'Color', 'Size', 'In', 'Sold', 'Stock', 'ST (%)']],
        body: rows.map((r, i) => [i + 1, r.code, r.name, r.category_name || 'Uncategorized', r.color, r.size, r.stock_in, r.stock_sold, r.current_stock, `${r.sell_through}%`]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
      })
      
      const pdfBuf = Buffer.from(doc.output('arraybuffer'))
      return new Response(pdfBuf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': pdfBuf.length.toString(),
          'Content-Disposition': 'attachment; filename="sandal-report.pdf"',
        },
      })
    }

    return Response.json({ error: 'Invalid format. Use csv, excel or pdf' }, { status: 400 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})
