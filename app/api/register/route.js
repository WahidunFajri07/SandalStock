import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user with default role 'user'
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, 'user']
    )

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 })
  }
}
