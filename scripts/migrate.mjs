/* Terapkan migrasi Drizzle terhadap DATABASE_URL. Dijalankan container di startup. */
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) { console.error('DATABASE_URL kosong'); process.exit(1) }

const client = postgres(url, { max: 1 })
const db = drizzle(client)
await migrate(db, { migrationsFolder: './drizzle' })
await client.end()
console.log('[migrate] selesai')
