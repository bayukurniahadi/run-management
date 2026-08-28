import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL belum diset — lihat .env.example')

// Pooling: postgres-js sudah punya pool internal. `max: 10` cukup untuk instance kecil.
const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> }
const client = globalForDb.pg ?? postgres(url, { max: 10, prepare: false })
if (process.env.NODE_ENV !== 'production') globalForDb.pg = client

export const db = drizzle(client, { schema })
export { schema }
