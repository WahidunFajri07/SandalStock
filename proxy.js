import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

const authHandler = auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req
  
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute    = ["/login", "/register", "/api/register"].includes(nextUrl.pathname)

  if (isApiAuthRoute) return null
  
  if (isPublicRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/", nextUrl))
    }
    return null
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  return null
})

export const proxy = authHandler
export default authHandler

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
