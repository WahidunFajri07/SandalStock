import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import pool from "@/lib/db"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        try {
          const [rows] = await pool.query(
            "SELECT * FROM users WHERE username = ?",
            [credentials.username]
          )
          
          if (!rows || rows.length === 0) return null
          
          const user = rows[0]
          const isValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValid) return null

          return {
            id: user.id.toString(),
            name: user.username,
            role: user.role,
          }
        } catch (err) {
          console.error("Auth error:", err)
          return null
        }
      }
    })
  ],
})
