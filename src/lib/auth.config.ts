/* Konfigurasi ringan untuk middleware Edge runtime — tanpa driver Postgres.
   Provider penuh + akses DB ada di src/lib/auth.ts. */
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname
      const publik = ['/login', '/api/auth', '/api/health']
      if (publik.some((p) => path === p || path.startsWith(p + '/') || path.startsWith(p))) return true
      return !!auth
    },
    jwt({ token, user }) {
      if (user) { token.role = (user as { role?: string }).role; token.uid = user.id }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = String(token.uid ?? '')
        ;(session.user as { role?: string }).role = String(token.role ?? 'viewer')
      }
      return session
    },
  },
} satisfies NextAuthConfig
