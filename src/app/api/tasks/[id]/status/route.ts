import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tasks, auditLog } from '@/db/schema'

const Body = z.object({ status: z.enum(['todo', 'jalan', 'tunggu', 'risiko', 'beres']) })

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Belum login' }, { status: 401 })
  const role = (session.user as { role?: string }).role ?? 'viewer'
  if (role === 'viewer') return NextResponse.json({ error: 'Peran Anda tidak boleh mengubah' }, { status: 403 })

  const { id } = await ctx.params
  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })

  const uid = (session.user as { id?: string }).id
  const [row] = await db.update(tasks)
    .set({ status: parsed.data.status, updatedAt: new Date(), updatedBy: uid })
    .where(eq(tasks.id, id))
    .returning()

  if (!row) return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 })

  await db.insert(auditLog).values({
    actor: uid, entity: 'task', entityId: id, action: 'status',
    patch: JSON.stringify({ status: parsed.data.status }),
  })

  return NextResponse.json({ ok: true, task: row })
}
