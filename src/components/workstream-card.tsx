'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Workstream, Task } from '@/db/schema'

const ST = {
  todo:   { lbl: 'Belum mulai',    c: '#8493a8', bg: '#eef1f6' },
  jalan:  { lbl: 'Berjalan',       c: '#2e5a8f', bg: '#e9f0fa' },
  tunggu: { lbl: 'Menunggu',       c: '#b8860b', bg: '#fdf3dc' },
  risiko: { lbl: 'Perlu perhatian',c: '#c0504d', bg: '#f8e7e6' },
  beres:  { lbl: 'Selesai',        c: '#3f8f6a', bg: '#e5f2ec' },
} as const
type St = keyof typeof ST
const NEXT_ST: Record<St, St> = { todo: 'jalan', jalan: 'tunggu', tunggu: 'risiko', risiko: 'beres', beres: 'todo' }
const W = { todo: 0, jalan: 0.5, tunggu: 0.25, risiko: 0.35, beres: 1 } as const
const PRC = { P1: '#c0504d', P2: '#b8860b', P3: '#2e5a8f' } as const

function progres(t: Task[]) {
  if (!t.length) return 0
  return Math.round(t.reduce((a, x) => a + W[x.status], 0) / t.length * 100)
}

export function WorkstreamCard({ workstream: w, tasks: initial }: { workstream: Workstream; tasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initial)
  const [pending, start] = useTransition()
  const router = useRouter()
  const pr = progres(tasks)
  const done = tasks.filter((t) => t.status === 'beres').length

  function putarStatus(t: Task) {
    const nx = NEXT_ST[t.status]
    setTasks((cur) => cur.map((x) => (x.id === t.id ? { ...x, status: nx } : x)))
    start(async () => {
      const res = await fetch(`/api/tasks/${t.id}/status`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: nx }),
      })
      if (!res.ok) {
        // rollback optimistik + refresh
        setTasks((cur) => cur.map((x) => (x.id === t.id ? { ...x, status: t.status } : x)))
        router.refresh()
      }
    })
  }

  return (
    <div className="bg-white border border-line rounded-xl p-4 relative">
      <span className="absolute top-3 right-3 text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full"
            style={{ background: PRC[w.priority] }}>{w.priority}</span>
      <div className="text-[10px] font-extrabold tracking-wider text-gold uppercase">{w.code} · {w.block}</div>
      <h4 className="mt-1 text-sm font-extrabold text-navy leading-snug">{w.name}</h4>
      <div className="text-[11px] text-muted mt-2 space-y-0.5">
        <div><b className="text-navy">PIC</b> {w.pic}</div>
        <div><b className="text-navy">Output</b> {w.output}</div>
        <div><b className="text-navy">Tenggat</b> {w.due}</div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-navy to-navy-2" style={{ width: `${pr}%` }}/>
        </div>
        <b className="text-xs text-navy tabular-nums w-9 text-right">{pr}%</b>
      </div>
      <div className="text-[10px] text-soft mt-2">{done}/{tasks.length} tugas selesai · klik status untuk memutar</div>
      <ul className="mt-2 space-y-1">
        {tasks.map((t) => {
          const st = ST[t.status]
          return (
            <li key={t.id} className="flex items-start gap-2">
              <button onClick={() => putarStatus(t)} disabled={pending}
                className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ color: st.c, background: st.bg }}>{st.lbl}</button>
              <span className="text-[11px] text-ink leading-snug">{t.title}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
