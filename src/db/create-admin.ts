/* Buat admin pertama secara interaktif.
   Jalankan sekali di server: `npm run db:create-admin` */
import 'dotenv/config'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from './schema'

async function main() {
  const rl = readline.createInterface({ input, output })
  const email = (await rl.question('Email admin: ')).trim().toLowerCase()
  const pw = await rl.question('Kata sandi (min 8 karakter): ')
  const nama = (await rl.question('Nama lengkap: ')).trim()
  rl.close()
  if (!email || pw.length < 8) throw new Error('email + kata sandi (min 8) wajib')

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const hash = await bcrypt.hash(pw, 10)
  if (existing) {
    await db.update(users).set({ passwordHash: hash, role: 'admin', fullName: nama || existing.fullName }).where(eq(users.id, existing.id))
    console.log('admin di-update:', email)
  } else {
    await db.insert(users).values({ email, passwordHash: hash, role: 'admin', fullName: nama || null })
    console.log('admin dibuat:', email)
  }
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
