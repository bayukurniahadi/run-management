import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RUN Holding — Manajemen',
  description: 'Dashboard restrukturisasi & pantauan C-Level RUN Holding',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id"><body>{children}</body></html>
  )
}
