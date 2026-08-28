/* Seed idempotent versi ESM untuk runtime container. */
import postgres from 'postgres'
const url = process.env.DATABASE_URL
if (!url) process.exit(0)
const sql = postgres(url, { max: 1 })

const WS = [
  ['WS1','Fundamental HPP → Margin','bertahan','P1',"Ilham (BisDev) + As'ad, Dhika, Bayu",'Dasar HPP bersih + margin minimum per kategori','Awal September',
    'HPP dipakai sebagai alat uji: apakah omzet benar-benar menghasilkan margin dan cash yang cukup, bukan sekadar angka tutup buku.',
    'Finance + Operasional + BisDev: finalisasi dasar HPP dan margin minimum. Progres di-update Jumat.'],
  ['WS2','Penyelesaian Kredit Ads','bertahan','P1',"As'ad + Dodi",'Utang Rp 1.170.000.000 lunas atau terjadwal','1 September 2026',
    'Dua tahap overdue berjalan bersamaan. Konsekuensi jika terlewat: akses kredit ads tertutup dan reputasi akun terdampak.',
    "As'ad + Dodi + Finance: finalisasi opsi penyelesaian dan simulasi kemampuan bayar dari cashflow aktual."],
  ['WS3','Pengalihan Traffic Brand Internal','stabilkan','P2','Bayu + Dwi','Brand prioritas penerima + forecast performa','Akhir Agustus 2026',
    'Performa Naturagrow turun, tetapi kapasitas iklan, tim kreatif, dan jam tayang live tetap berjalan.',
    'Bayu + Dwi: tetapkan brand prioritas penerima traffic dan forecast performa vs biaya.'],
  ['WS4','Revenue Stream HAN','bertumbuh','P3','Dhika + Bayu','Pipeline klien eksternal berjalan','September–November',
    '100% pendapatan HAN masih berasal dari brand internal — ~Rp 100.000.000 / bulan.',
    'Aziz + HAN: perjelas revenue stream eksternal, rate card, knowledge layanan, dan pipeline project.'],
  ['WS5','Legalitas MBN & LBP','bertahan','P1',"As'ad + Tim + Dhika, Bayu",'Entitas legal-ready','1 September 2026',
    'Legalitas jadi syarat kontrak klien eksternal, memindahkan beban biaya antar-entitas, dan membuka opsi pendanaan.',
    "As'ad + Tim: selesaikan mapping legalitas MBN, LBP, dan struktur pilar bisnis."],
  ['WS6','Perombakan Manajemen HAN','stabilkan','P2',"Manajemen HAN + Dhika, Bayu, As'ad",'Struktur baru + fix cost berpindah','September–November',
    'Tiga perubahan yang saling menopang: siapa yang memimpin, siapa yang menanggung biaya, siapa yang mengeksekusi.',
    'Manajemen HAN: peta eksekutor dan pembebanan biayanya.'],
]

for (const [code,name,block,priority,pic,output,due,context,nextAction] of WS) {
  await sql`insert into workstreams (code,name,block,priority,pic,output,due,context,next_action)
    values (${code},${name},${block},${priority},${pic},${output},${due},${context},${nextAction})
    on conflict (code) do nothing`
}

const [ws2] = await sql`select id from workstreams where code='WS2' limit 1`
if (ws2) {
  const [{ n }] = await sql`select count(*)::int as n from tasks where workstream_id=${ws2.id}`
  if (n === 0) {
    const TASKS = [
      ['Putuskan sumber dana pelunasan Rp 1.170.000.000',"As'ad + Dodi + Finance",'Minggu ini','jalan',1],
      ['Negosiasi ulang tenor sebelum 1 September','C-Level','Sebelum 1 Sep','jalan',2],
      ['Kepastian jadwal pengembalian Rp 136.000.000',"As'ad + Dodi",'Minggu ini','todo',3],
      ['Jajaki BRI & Bank Jateng, simulasi tenor 1–5 tahun','Finance','Agustus','jalan',4],
      ['Simulasi kemampuan bayar dari cashflow aktual','Finance','Sebelum keputusan','todo',5],
    ]
    for (const [title,pic,due,status,ord] of TASKS) {
      await sql`insert into tasks (workstream_id,title,pic,due,status,ord)
        values (${ws2.id},${title},${pic},${due},${status},${ord})`
    }
  }
}

await sql.end()
console.log('[seed] selesai')
