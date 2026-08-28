import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { authConfig } from '@/lib/auth.config'

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Email + Kata Sandi',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Kata Sandi', type: 'password' },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? '').toLowerCase().trim()
        const password = String(creds?.password ?? '')
        if (!email || !password) return null
        const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1)
        if (!u) return null
        const ok = await bcrypt.compare(password, u.passwordHash)
        if (!ok) return null
        return { id: u.id, email: u.email, name: u.fullName ?? u.email, role: u.role }
      },
    }),
  ],
})
