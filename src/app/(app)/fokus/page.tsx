import { db } from '@/lib/db'
import { workstreams, tasks } from '@/db/schema'
import { WorkstreamCard } from '@/components/workstream-card'

export const dynamic = 'force-dynamic'

const W = { todo: 0, jalan: 0.5, tunggu: 0.25, risiko: 0.35, beres: 1 } as const

export default async function FokusPage() {
  const ws = await db.select().from(workstreams).orderBy(workstreams.code)
  const tk = await db.select().from(tasks)
  const totTasks = tk.length
  const done = tk.filter((t) => t.status === 'beres').length
  const avg = ws.length
    ? Math.round(
        ws.reduce((a, w) => {
          const wt = tk.filter((t) => t.workstreamId === w.id)
          if (!wt.length) return a
          return a + wt.reduce((x, t) => x + W[t.status], 0) / wt.length * 100
        }, 0) / ws.length
      )
    : 0

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-gold flex items-center gap-2 mb-2">
        <span className="w-6 h-0.5 bg-gold rounded"/>Rapat Stakeholders — Fokus C-Level
      </div>
      <h1 className="text-2xl font-extrabold text-navy mb-1">Enam Prioritas Strategis</h1>
      <p className="text-sm text-muted max-w-3xl mb-6">
        Setiap tugas yang diubah langsung menghitung ulang progres, status workstream, dan ringkasan di atas.
      </p>

      <div className="grid grid-cols-4 gap-3 mb-8">
        <Kpi k="Workstream Dipantau" v={`${ws.length} WS`} s={`${ws.filter((w) => w.priority === 'P1').length} di prioritas P1`}/>
        <Kpi k="Progres Rata-rata" v={`${avg}%`} s="Dihitung otomatis dari status tiap tugas" tone={avg >= 60 ? 'green' : ''}/>
        <Kpi k="Tugas Selesai" v={`${done} / ${totTasks}`} s={`${totTasks - done} tugas belum tuntas`}/>
        <Kpi k="Butuh Perhatian"
             v={`${tk.filter((t) => t.status === 'risiko').length} tugas`}
             s={`${tk.filter((t) => t.status === 'tunggu').length} tugas menunggu dependensi`}
             tone={tk.some((t) => t.status === 'risiko') ? 'red' : 'green'}/>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ws.map((w) => (
          <WorkstreamCard key={w.id} workstream={w} tasks={tk.filter((t) => t.workstreamId === w.id)} />
        ))}
      </div>

      {ws.length === 0 && (
        <div className="mt-8 p-6 rounded-xl border border-dashed border-line text-sm text-muted text-center">
          Belum ada data workstream. Jalankan <code>npm run db:push</code> lalu <code>npm run db:seed</code>.
        </div>
      )}
    </div>
  )
}

function Kpi({ k, v, s, tone }: { k: string; v: string; s: string; tone?: string }) {
  const c = tone === 'green' ? 'text-green' : tone === 'red' ? 'text-red' : 'text-navy'
  return (
    <div className="bg-white border border-line rounded-xl p-4">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-soft">{k}</div>
      <div className={`text-xl font-extrabold mt-2 ${c}`}>{v}</div>
      <div className="text-xs text-muted mt-1 leading-snug">{s}</div>
    </div>
  )
}
