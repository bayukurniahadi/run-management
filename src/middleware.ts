import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

export const { auth: middleware } = NextAuth(authConfig)

export default middleware((req) => {
  // callback `authorized` di authConfig sudah menangani redirect
  return
})

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
