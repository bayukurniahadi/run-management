import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth, signOut } from '@/lib/auth'

const NAV = [
  { grup: 'Ringkasan', items: [{ href: '/summary', num: '0.0', label: 'Summary' }] },
  { grup: 'Fokus C-Level', items: [{ href: '/fokus', num: '6.0', label: 'Papan Prioritas' }] },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-[#0e2240] text-white flex flex-col sticky top-0 h-screen">
        <div className="p-4 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold"
               style={{ background: 'linear-gradient(135deg,#c79a3a,#e0c068)', color: '#0e2240' }}>RUN</div>
          <div>
            <div className="font-extrabold text-sm">RUN Holding</div>
            <div className="text-[10px] text-white/60">Manajemen</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map((g) => (
            <div key={g.grup}>
              <div className="px-4 pt-4 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-white/40">{g.grup}</div>
              {g.items.map((it) => (
                <Link key={it.href} href={it.href}
                      className="flex items-center gap-3 px-4 py-1.5 text-[13px] text-white/80 hover:bg-white/5 hover:text-gold-l">
                  <span className="text-[10px] font-extrabold text-gold w-6">{it.num}</span>
                  <span>{it.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-4 text-[10px] text-white/40 border-t border-white/5 space-y-1">
          <div>Masuk sebagai <span className="text-white/70">{session.user.email}</span></div>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }) }}>
            <button type="submit" className="underline text-white/70 hover:text-gold-l">Keluar</button>
          </form>
        </div>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
