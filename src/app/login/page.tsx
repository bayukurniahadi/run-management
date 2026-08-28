'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setLoading(true)
    const res = await signIn('credentials', {
      email, password,
      redirect: false,
    })
    setLoading(false)
    if (!res?.ok) { setErr('Email atau kata sandi salah'); return }
    router.replace(params.get('next') || '/fokus')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6"
          style={{ background: 'linear-gradient(150deg,#0b1c34,#14315c 60%,#1b3a68)' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl p-7 shadow-2xl">
        <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center font-extrabold text-lg"
             style={{ background: 'linear-gradient(135deg,#c79a3a,#e0c068)', color: '#0e2240' }}>RUN</div>
        <h1 className="text-base font-extrabold text-navy">RUN Holding — Manajemen</h1>
        <p className="text-xs text-muted mt-1 mb-5">Masuk untuk mengakses dashboard.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-soft">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoFocus
                   className="w-full mt-1 px-3 py-2 border border-line rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-soft">Kata Sandi</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
                   className="w-full mt-1 px-3 py-2 border border-line rounded-lg text-sm" />
          </div>
          {err && <div className="text-xs text-red font-semibold">{err}</div>}
          <button disabled={loading} className="w-full py-2.5 rounded-lg bg-navy text-white text-sm font-bold disabled:opacity-50">
            {loading ? 'Memeriksa…' : 'Masuk'}
          </button>
        </form>
        <p className="text-[10px] text-soft mt-4 leading-relaxed">
          Akun dibuat oleh admin. Kalau belum punya akses, hubungi admin: <code>npm run db:create-admin</code>
        </p>
      </div>
    </main>
  )
}
