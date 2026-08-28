import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'

/* Koneksi Postgres dibuat malas: baru dipanggil saat pertama kali dipakai.
   Ini penting supaya `next build` tidak error hanya karena mengimpor modul ini. */
let _db: PostgresJsDatabase<typeof schema> | null = null

function getDb(): PostgresJsDatabase<typeof schema> {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL belum diset — lihat .env.example')
  const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> }
  const client = globalForDb.pg ?? postgres(url, { max: 10, prepare: false })
  if (process.env.NODE_ENV !== 'production') globalForDb.pg = client
  _db = drizzle(client, { schema })
  return _db
}

/* Proxy tipis supaya sisa kode tetap menulis `db.select(...)` seperti biasa. */
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const d = getDb() as unknown as Record<string | symbol, unknown>
    const v = d[prop as string]
    return typeof v === 'function' ? (v as (...args: unknown[]) => unknown).bind(d) : v
  },
})
export { schema }
