import pool from '@/lib/db'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'

export const PUT = auth(async function PUT(request) {
  if (!request.auth) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }
  try {
    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return Response.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return Response.json({ error: 'Kata sandi minimal 6 karakter' }, { status: 400 })
    }

    const userId = request.auth.user.id
    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [userId])
    if (!user) return Response.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) return Response.json({ error: 'Kata sandi lama tidak sesuai' }, { status: 400 })

    const hashed = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId])

    return Response.json({ message: 'Kata sandi berhasil diperbarui' })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
})
