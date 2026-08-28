/* Seed data awal (6 workstream + tugas WS2). Idempotent: aman diulang. */
import 'dotenv/config'
import { db } from '../lib/db'
import { workstreams, tasks } from './schema'
import { eq, sql } from 'drizzle-orm'

const WS = [
  { code: 'WS1', name: 'Fundamental HPP → Margin', block: 'bertahan' as const, priority: 'P1' as const,
    pic: 'Ilham (BisDev) + As\'ad, Dhika, Bayu',
    output: 'Dasar HPP bersih + margin minimum per kategori', due: 'Awal September',
    context: 'HPP dipakai sebagai alat uji: apakah omzet benar-benar menghasilkan margin dan cash yang cukup, bukan sekadar angka tutup buku.',
    nextAction: 'Finance + Operasional + BisDev: finalisasi dasar HPP dan margin minimum. Progres di-update Jumat.' },
  { code: 'WS2', name: 'Penyelesaian Kredit Ads', block: 'bertahan' as const, priority: 'P1' as const,
    pic: 'As\'ad + Dodi',
    output: 'Utang Rp 1.170.000.000 lunas atau terjadwal', due: '1 September 2026',
    context: 'Dua tahap overdue berjalan bersamaan. Konsekuensi jika terlewat: akses kredit ads tertutup dan reputasi akun terdampak.',
    nextAction: 'As\'ad + Dodi + Finance: finalisasi opsi penyelesaian dan simulasi kemampuan bayar dari cashflow aktual.' },
  { code: 'WS3', name: 'Pengalihan Traffic Brand Internal', block: 'stabilkan' as const, priority: 'P2' as const,
    pic: 'Bayu + Dwi',
    output: 'Brand prioritas penerima + forecast performa', due: 'Akhir Agustus 2026',
    context: 'Performa Naturagrow turun, tetapi kapasitas iklan, tim kreatif, dan jam tayang live tetap berjalan.',
    nextAction: 'Bayu + Dwi: tetapkan brand prioritas penerima traffic dan forecast performa vs biaya.' },
  { code: 'WS4', name: 'Revenue Stream HAN', block: 'bertumbuh' as const, priority: 'P3' as const,
    pic: 'Dhika + Bayu',
    output: 'Pipeline klien eksternal berjalan', due: 'September–November',
    context: '100% pendapatan HAN masih berasal dari brand internal — ~Rp 100.000.000 / bulan.',
    nextAction: 'Aziz + HAN: perjelas revenue stream eksternal, rate card, knowledge layanan, dan pipeline project.' },
  { code: 'WS5', name: 'Legalitas MBN & LBP', block: 'bertahan' as const, priority: 'P1' as const,
    pic: 'As\'ad + Tim + Dhika, Bayu',
    output: 'Entitas legal-ready', due: '1 September 2026',
    context: 'Legalitas jadi syarat kontrak klien eksternal, memindahkan beban biaya antar-entitas, dan membuka opsi pendanaan.',
    nextAction: 'As\'ad + Tim: selesaikan mapping legalitas MBN, LBP, dan struktur pilar bisnis.' },
  { code: 'WS6', name: 'Perombakan Manajemen HAN', block: 'stabilkan' as const, priority: 'P2' as const,
    pic: 'Manajemen HAN + Dhika, Bayu, As\'ad',
    output: 'Struktur baru + fix cost berpindah', due: 'September–November',
    context: 'Tiga perubahan yang saling menopang: siapa yang memimpin, siapa yang menanggung biaya, siapa yang mengeksekusi.',
    nextAction: 'Manajemen HAN: peta eksekutor dan pembebanan biayanya.' },
]

const WS2_TASKS = [
  ['Putuskan sumber dana pelunasan Rp 1.170.000.000', 'As\'ad + Dodi + Finance', 'Minggu ini', 'jalan'],
  ['Negosiasi ulang tenor sebelum 1 September', 'C-Level', 'Sebelum 1 Sep', 'jalan'],
  ['Kepastian jadwal pengembalian Rp 136.000.000', 'As\'ad + Dodi', 'Minggu ini', 'todo'],
  ['Jajaki BRI & Bank Jateng, simulasi tenor 1–5 tahun', 'Finance', 'Agustus', 'jalan'],
  ['Simulasi kemampuan bayar dari cashflow aktual', 'Finance', 'Sebelum keputusan', 'todo'],
] as const

async function main() {
  for (const w of WS) {
    const [existing] = await db.select().from(workstreams).where(eq(workstreams.code, w.code)).limit(1)
    if (existing) continue
    await db.insert(workstreams).values(w)
  }

  const [ws2] = await db.select().from(workstreams).where(eq(workstreams.code, 'WS2')).limit(1)
  if (ws2) {
    const existing = await db.select().from(tasks).where(eq(tasks.workstreamId, ws2.id))
    if (existing.length === 0) {
      await db.insert(tasks).values(
        WS2_TASKS.map(([title, pic, due, status], i) => ({
          workstreamId: ws2.id, title, pic, due, status: status as 'todo'|'jalan', ord: i + 1,
        }))
      )
    }
  }
  console.log('seed selesai:', WS.length, 'workstream siap.')
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
