import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios'

type ApiEnvelope<T> = { success: boolean; message: string; traceId: string; data: T }

type User = { id: number; name: string; email: string; roleId: number; role: string }
type Paged<T> = { items: T[]; page: number; pageSize: number; total: number }

const adminUser: User = {
  id: 1,
  name: 'Administrator',
  email: 'admin@clinicnext.local',
  roleId: 1,
  role: 'admin',
}

const state = {
  dokter: [
    { id: 1, kdDokter: 'D001', namaDokter: 'dr. Nabila' },
    { id: 2, kdDokter: 'D002', namaDokter: 'dr. Farhan' },
    { id: 3, kdDokter: 'D003', namaDokter: 'dr. Rizky' },
    { id: 4, kdDokter: 'D004', namaDokter: 'dr. Laras' },
    { id: 5, kdDokter: 'D005', namaDokter: 'dr. Kevin' },
    { id: 6, kdDokter: 'D006', namaDokter: 'dr. Maya' },
  ],
  pasien: [
    { id: 1, idPasien: 'P0001', nik: '3174001', nama: 'Andi Saputra', noHp: '0812000001', email: 'andi@test.local' },
    { id: 2, idPasien: 'P0002', nik: '3174002', nama: 'Siti Aminah', noHp: '0812000002', email: 'siti@test.local' },
    { id: 3, idPasien: 'P0003', nik: '3174003', nama: 'Dewi Lestari', noHp: '0812000003', email: 'dewi@test.local' },
    { id: 4, idPasien: 'P0004', nik: '3174004', nama: 'Budi Santoso', noHp: '0812000004', email: 'budi@test.local' },
    { id: 5, idPasien: 'P0005', nik: '3174005', nama: 'Rina Pratiwi', noHp: '0812000005', email: 'rina@test.local' },
    { id: 6, idPasien: 'P0006', nik: '3174006', nama: 'Yusuf Hidayat', noHp: '0812000006', email: 'yusuf@test.local' },
  ],
  jasa: [
    { id: 1, icd9: '99.04', namaJasa: 'Nebulizer', harga: 120000, status: 1 },
    { id: 2, icd9: '89.52', namaJasa: 'Pemeriksaan TTV', harga: 50000, status: 1 },
    { id: 3, icd9: '93.08', namaJasa: 'Injeksi', harga: 75000, status: 1 },
    { id: 4, icd9: '89.29', namaJasa: 'Konsultasi Umum', harga: 100000, status: 1 },
    { id: 5, icd9: '90.59', namaJasa: 'Rapid Test', harga: 85000, status: 1 },
    { id: 6, icd9: '99.15', namaJasa: 'Infus', harga: 110000, status: 1 },
  ],
  diagnosa: [
    { id: 1, kodeDiagnosa: 'J06.9', namaDiagnosa: 'ISPA', status: 1 },
    { id: 2, kodeDiagnosa: 'I10', namaDiagnosa: 'Hipertensi', status: 1 },
    { id: 3, kodeDiagnosa: 'E11.9', namaDiagnosa: 'Diabetes Mellitus Tipe 2', status: 1 },
    { id: 4, kodeDiagnosa: 'K29.7', namaDiagnosa: 'Gastritis', status: 1 },
    { id: 5, kodeDiagnosa: 'A09', namaDiagnosa: 'Diare Akut', status: 1 },
    { id: 6, kodeDiagnosa: 'M54.5', namaDiagnosa: 'Nyeri Pinggang', status: 1 },
  ],
  pendaftaran: [
    { id: 1, idRegistrasi: 'RG24001', tanggal: '2026-04-29', status: '1', kdDokter: 'D001', pasienId: 1, idPasien: 'P0001', nik: '3174001', namaPasien: 'Andi Saputra', dokterNama: 'dr. Nabila' },
    { id: 2, idRegistrasi: 'RG24002', tanggal: '2026-04-29', status: '2', kdDokter: 'D002', pasienId: 2, idPasien: 'P0002', nik: '3174002', namaPasien: 'Siti Aminah', dokterNama: 'dr. Farhan' },
    { id: 3, idRegistrasi: 'RG24003', tanggal: '2026-04-30', status: '3', kdDokter: 'D003', pasienId: 3, idPasien: 'P0003', nik: '3174003', namaPasien: 'Dewi Lestari', dokterNama: 'dr. Rizky' },
    { id: 4, idRegistrasi: 'RG24004', tanggal: '2026-04-30', status: '4', kdDokter: 'D004', pasienId: 4, idPasien: 'P0004', nik: '3174004', namaPasien: 'Budi Santoso', dokterNama: 'dr. Laras' },
    { id: 5, idRegistrasi: 'RG24005', tanggal: '2026-05-01', status: '1', kdDokter: 'D005', pasienId: 5, idPasien: 'P0005', nik: '3174005', namaPasien: 'Rina Pratiwi', dokterNama: 'dr. Kevin' },
    { id: 6, idRegistrasi: 'RG24006', tanggal: '2026-05-01', status: '2', kdDokter: 'D006', pasienId: 6, idPasien: 'P0006', nik: '3174006', namaPasien: 'Yusuf Hidayat', dokterNama: 'dr. Maya' },
  ],
  pelayanan: [
    { id: 1, idRegistrasi: 'RG24001', tanggal: '2026-04-29', status: '2', kdDokter: 'D001', idPasien: 'P0001', nik: '3174001', namaPasien: 'Andi Saputra', dokterNama: 'dr. Nabila' },
    { id: 2, idRegistrasi: 'RG24002', tanggal: '2026-04-29', status: '3', kdDokter: 'D002', idPasien: 'P0002', nik: '3174002', namaPasien: 'Siti Aminah', dokterNama: 'dr. Farhan' },
    { id: 3, idRegistrasi: 'RG24003', tanggal: '2026-04-30', status: '1', kdDokter: 'D003', idPasien: 'P0003', nik: '3174003', namaPasien: 'Dewi Lestari', dokterNama: 'dr. Rizky' },
    { id: 4, idRegistrasi: 'RG24004', tanggal: '2026-04-30', status: '4', kdDokter: 'D004', idPasien: 'P0004', nik: '3174004', namaPasien: 'Budi Santoso', dokterNama: 'dr. Laras' },
    { id: 5, idRegistrasi: 'RG24005', tanggal: '2026-05-01', status: '2', kdDokter: 'D005', idPasien: 'P0005', nik: '3174005', namaPasien: 'Rina Pratiwi', dokterNama: 'dr. Kevin' },
    { id: 6, idRegistrasi: 'RG24006', tanggal: '2026-05-01', status: '1', kdDokter: 'D006', idPasien: 'P0006', nik: '3174006', namaPasien: 'Yusuf Hidayat', dokterNama: 'dr. Maya' },
  ],
  pembayaran: [
    { id: 1, noInvoice: 'INV-24001', idRegistrasi: 'RG24001', idPasien: 'P0001', namaPasien: 'Andi Saputra', kdDokter: 'D001', namaDokter: 'dr. Nabila', total: 200000, grandtotal: 200000, jumlahBayar: 150000, sisa: 50000, status: '1', tglBayar: '2026-04-29' },
    { id: 2, noInvoice: 'INV-24002', idRegistrasi: 'RG24002', idPasien: 'P0002', namaPasien: 'Siti Aminah', kdDokter: 'D002', namaDokter: 'dr. Farhan', total: 250000, grandtotal: 260000, jumlahBayar: 260000, sisa: 0, status: '3', tglBayar: '2026-04-29' },
    { id: 3, noInvoice: 'INV-24003', idRegistrasi: 'RG24003', idPasien: 'P0003', namaPasien: 'Dewi Lestari', kdDokter: 'D003', namaDokter: 'dr. Rizky', total: 175000, grandtotal: 180000, jumlahBayar: 100000, sisa: 80000, status: '2', tglBayar: '2026-04-30' },
    { id: 4, noInvoice: 'INV-24004', idRegistrasi: 'RG24004', idPasien: 'P0004', namaPasien: 'Budi Santoso', kdDokter: 'D004', namaDokter: 'dr. Laras', total: 300000, grandtotal: 305000, jumlahBayar: 50000, sisa: 255000, status: '1', tglBayar: '2026-05-01' },
    { id: 5, noInvoice: 'INV-24005', idRegistrasi: 'RG24005', idPasien: 'P0005', namaPasien: 'Rina Pratiwi', kdDokter: 'D005', namaDokter: 'dr. Kevin', total: 220000, grandtotal: 220000, jumlahBayar: 220000, sisa: 0, status: '3', tglBayar: '2026-05-01' },
    { id: 6, noInvoice: 'INV-24006', idRegistrasi: 'RG24006', idPasien: 'P0006', namaPasien: 'Yusuf Hidayat', kdDokter: 'D006', namaDokter: 'dr. Maya', total: 140000, grandtotal: 145000, jumlahBayar: 100000, sisa: 45000, status: '2', tglBayar: '2026-05-01' },
  ],
  pengeluaran: [
    { id: 1, tanggal: '2026-05-01', keterangan: 'Pembelian ATK', total: 250000, detail: [{ detailId: 1, nama: 'Kertas A4', nominal: 150000 }, { detailId: 2, nama: 'Tinta Printer', nominal: 100000 }] },
    { id: 2, tanggal: '2026-05-02', keterangan: 'Listrik Klinik', total: 400000, detail: [{ detailId: 1, nama: 'Tagihan listrik', nominal: 400000 }] },
  ],
}

const pelayananDetailStore: Record<string, Record<string, unknown>> = {
  RG24001: { idRegistrasi: 'RG24001', anamnesa: 'Batuk 3 hari', tensi: '120/80', suhu: '36.8', catatan: 'Observasi umum' },
  RG24002: { idRegistrasi: 'RG24002', anamnesa: 'Pusing berulang', tensi: '130/90', suhu: '36.7', catatan: 'Perlu kontrol 1 minggu' },
}

const tindakanStore: Record<string, Array<Record<string, unknown>>> = {
  RG24001: [{ detailId: 1, nama: 'Konsultasi', qty: 1, harga: 100000 }],
  RG24002: [{ detailId: 1, nama: 'Nebulizer', qty: 1, harga: 120000 }],
}

const resepStore: Record<string, Array<Record<string, unknown>>> = {
  RG24001: [{ detailId: 1, namaObat: 'Paracetamol', dosis: '3x1', qty: 10 }],
  RG24002: [{ detailId: 1, namaObat: 'Amoxicillin', dosis: '3x1', qty: 15 }],
}

for (let i = 7; i <= 30; i += 1) {
  const dokterId = ((i - 1) % 6) + 1
  const pasienCode = `P${String(i).padStart(4, '0')}`
  const regCode = `RG24${String(i).padStart(3, '0')}`
  const invoiceCode = `INV-24${String(i).padStart(3, '0')}`
  const tanggal = `2026-05-${String(((i - 1) % 28) + 1).padStart(2, '0')}`
  const status = String(((i - 1) % 4) + 1)
  const total = 120000 + i * 7000
  const grandtotal = total + 5000
  const jumlahBayar = i % 3 === 0 ? grandtotal : Math.floor(grandtotal * 0.6)
  const sisa = Math.max(grandtotal - jumlahBayar, 0)

  state.dokter.push({ id: i, kdDokter: `D${String(i).padStart(3, '0')}`, namaDokter: `dr. Dummy ${i}` })
  state.pasien.push({ id: i, idPasien: pasienCode, nik: `3174${String(1000 + i)}`, nama: `Pasien Dummy ${i}`, noHp: `08120000${String(i).padStart(2, '0')}`, email: `pasien${i}@test.local` })
  state.jasa.push({ id: i, icd9: `9${i}.0${i % 10}`, namaJasa: `Jasa Dummy ${i}`, harga: 45000 + i * 2500, status: i % 5 === 0 ? 0 : 1 })
  state.diagnosa.push({ id: i, kodeDiagnosa: `X${i}.0`, namaDiagnosa: `Diagnosa Dummy ${i}`, status: i % 5 === 0 ? 0 : 1 })

  state.pendaftaran.push({
    id: i,
    idRegistrasi: regCode,
    tanggal,
    status,
    kdDokter: `D${String(dokterId).padStart(3, '0')}`,
    pasienId: i,
    idPasien: pasienCode,
    nik: `3174${String(1000 + i)}`,
    namaPasien: `Pasien Dummy ${i}`,
    dokterNama: `dr. Dummy ${dokterId}`,
  })

  state.pelayanan.push({
    id: i,
    idRegistrasi: regCode,
    tanggal,
    status,
    kdDokter: `D${String(dokterId).padStart(3, '0')}`,
    idPasien: pasienCode,
    nik: `3174${String(1000 + i)}`,
    namaPasien: `Pasien Dummy ${i}`,
    dokterNama: `dr. Dummy ${dokterId}`,
  })

  state.pembayaran.push({
    id: i,
    noInvoice: invoiceCode,
    idRegistrasi: regCode,
    idPasien: pasienCode,
    namaPasien: `Pasien Dummy ${i}`,
    kdDokter: `D${String(dokterId).padStart(3, '0')}`,
    namaDokter: `dr. Dummy ${dokterId}`,
    total,
    grandtotal,
    jumlahBayar,
    sisa,
    status,
    tglBayar: tanggal,
  })
}

function ok<T>(data: T, message = 'OK'): ApiEnvelope<T> {
  return { success: true, message, traceId: 'mock-trace-id', data }
}

function paged<T>(items: T[], page = 1, pageSize = 20): Paged<T> {
  const start = (page - 1) * pageSize
  return { items: items.slice(start, start + pageSize), page, pageSize, total: items.length }
}

function withFilter<T extends Record<string, unknown>>(rows: T[], search?: string): T[] {
  if (!search?.trim()) return rows
  const q = search.toLowerCase()
  return rows.filter((row) => Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q)))
}

function response(config: AxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { data, status, statusText: 'OK', headers: {}, config: config as any }
}

export const mockApiAdapter: AxiosAdapter = async (config) => {
  const url = config.url ?? ''
  const method = (config.method ?? 'get').toLowerCase()
  const params = (config.params ?? {}) as Record<string, string>
  const body = (config.data ? JSON.parse(config.data as string) : {}) as Record<string, unknown>

  if (url === '/auth/login' && method === 'post') {
    const email = String(body.email ?? '')
    const password = String(body.password ?? '')
    if (email === 'admin@clinicnext.local' && password === 'Password123!') {
      return response(config, ok({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', expiresAtUtc: new Date(Date.now() + 3600_000).toISOString(), tokenType: 'Bearer', user: adminUser }, 'Login berhasil.'))
    }
    return response(config, { success: false, message: 'Email atau password tidak valid.', traceId: 'mock-trace-id', data: null }, 401)
  }
  if (url === '/auth/me' && method === 'get') return response(config, ok(adminUser, 'Profil user berhasil diambil.'))

  if (url === '/master/dokter' && method === 'get') return response(config, ok(withFilter(state.dokter, params.search), 'Data dokter berhasil diambil.'))
  if (url === '/master/pasien' && method === 'get') return response(config, ok(paged(withFilter(state.pasien, params.search), Number(params.page || 1), Number(params.pageSize || 20))))
  if (url === '/master/jasa' && method === 'get') return response(config, ok(paged(withFilter(state.jasa, params.search), Number(params.page || 1), Number(params.pageSize || 20))))
  if (url === '/master/diagnosa' && method === 'get') return response(config, ok(paged(withFilter(state.diagnosa, params.search), Number(params.page || 1), Number(params.pageSize || 20))))

  if (url === '/master/dokter' && method === 'post') {
    const id = Number(body.id || 0)
    if (id) {
      state.dokter = state.dokter.map((x) => (x.id === id ? { ...x, kdDokter: String(body.kdDokter ?? x.kdDokter), namaDokter: String(body.namaDokter ?? x.namaDokter) } : x))
      return response(config, ok({ id }, 'Data dokter berhasil disimpan.'))
    }
    const newId = Math.max(...state.dokter.map((x) => x.id), 0) + 1
    state.dokter.push({ id: newId, kdDokter: String(body.kdDokter ?? ''), namaDokter: String(body.namaDokter ?? '') })
    return response(config, ok({ id: newId }, 'Data dokter berhasil disimpan.'))
  }

  if (url === '/master/jasa' && method === 'post') {
    const id = Number(body.id || 0)
    if (id) {
      state.jasa = state.jasa.map((x) => (x.id === id ? { ...x, ...body, id } : x))
      return response(config, ok({ id }, 'Data jasa berhasil disimpan.'))
    }
    const newId = Math.max(...state.jasa.map((x) => x.id), 0) + 1
    state.jasa.push({ id: newId, icd9: String(body.icd9 ?? ''), namaJasa: String(body.namaJasa ?? ''), harga: Number(body.harga ?? 0), status: Number(body.status ?? 1) })
    return response(config, ok({ id: newId }, 'Data jasa berhasil disimpan.'))
  }

  if (url === '/master/diagnosa' && method === 'post') {
    const id = Number(body.id || 0)
    if (id) {
      state.diagnosa = state.diagnosa.map((x) => (x.id === id ? { ...x, ...body, id } : x))
      return response(config, ok({ id }, 'Data diagnosa berhasil disimpan.'))
    }
    const newId = Math.max(...state.diagnosa.map((x) => x.id), 0) + 1
    state.diagnosa.push({ id: newId, kodeDiagnosa: String(body.kodeDiagnosa ?? ''), namaDiagnosa: String(body.namaDiagnosa ?? ''), status: Number(body.status ?? 1) })
    return response(config, ok({ id: newId }, 'Data diagnosa berhasil disimpan.'))
  }

  if (url.startsWith('/master/dokter/') && method === 'delete') {
    const id = Number(url.split('/').pop() || '0')
    state.dokter = state.dokter.filter((x) => x.id !== id)
    return response(config, ok({ id }, 'Data dokter berhasil dihapus.'))
  }
  if (url.startsWith('/master/jasa/') && method === 'delete') {
    const id = Number(url.split('/').pop() || '0')
    state.jasa = state.jasa.filter((x) => x.id !== id)
    return response(config, ok({ id }, 'Data jasa berhasil dihapus.'))
  }
  if (url.startsWith('/master/diagnosa/') && method === 'delete') {
    const id = Number(url.split('/').pop() || '0')
    state.diagnosa = state.diagnosa.filter((x) => x.id !== id)
    return response(config, ok({ id }, 'Data diagnosa berhasil dihapus.'))
  }

  if (url === '/pendaftaran' && method === 'get') return response(config, ok(paged(withFilter(state.pendaftaran, params.search), Number(params.page || 1), Number(params.pageSize || 20))))
  if (url.startsWith('/pendaftaran/') && method === 'get') {
    const parts = url.split('/')
    const maybeId = Number(parts[2] || '0')
    if (Number.isFinite(maybeId) && maybeId > 0 && !parts[3]) {
      const row = state.pendaftaran.find((x) => x.id === maybeId)
      return response(config, ok({ ...(row ?? {}), alamat: 'Jl. Dummy No. 1', keluhan: 'Keluhan contoh', penjamin: 'Umum' }))
    }
  }
  if (url === '/pendaftaran' && method === 'post') {
    const newId = Math.max(...state.pendaftaran.map((x) => x.id), 0) + 1
    const idRegistrasi = `RG24${String(100 + newId).padStart(3, '0')}`
    const row = {
      id: newId,
      idRegistrasi,
      tanggal: String(body.tanggal ?? new Date().toISOString().slice(0, 10)),
      status: '1',
      kdDokter: String(body.kdDokter ?? 'D001'),
      pasienId: newId,
      idPasien: String(body.idPasien ?? `P${String(newId).padStart(4, '0')}`),
      nik: `3174${String(5000 + newId)}`,
      namaPasien: `Pasien ${String(body.idPasien ?? 'Dummy')}`,
      dokterNama: 'dr. Dummy',
    }
    state.pendaftaran.unshift(row)
    return response(config, ok({ id: row.id, idRegistrasi: row.idRegistrasi }, 'Pendaftaran berhasil dibuat.'))
  }
  if (url === '/pendaftaran/pasien-baru' && method === 'post') {
    const newId = Math.max(...state.pendaftaran.map((x) => x.id), 0) + 1
    const idRegistrasi = `RG24${String(200 + newId).padStart(3, '0')}`
    const idPasien = `P${String(200 + newId).padStart(4, '0')}`
    const nama = String(body.nama ?? 'Pasien Baru')
    const row = {
      id: newId,
      idRegistrasi,
      tanggal: new Date().toISOString().slice(0, 10),
      status: '1',
      kdDokter: String(body.kdDokter ?? 'D001'),
      pasienId: newId,
      idPasien,
      nik: String(body.nik ?? `3174${String(7000 + newId)}`),
      namaPasien: nama,
      dokterNama: 'dr. Dummy',
    }
    state.pendaftaran.unshift(row)
    state.pasien.unshift({ id: newId, idPasien, nik: row.nik, nama, noHp: String(body.noHp ?? ''), email: String(body.email ?? '') })
    return response(config, ok({ id: row.id, idRegistrasi: row.idRegistrasi, idPasien }, 'Pendaftaran pasien baru berhasil dibuat.'))
  }
  if (url.startsWith('/pendaftaran/') && url.endsWith('/void') && method === 'post') {
    const idRegistrasi = url.split('/')[2]
    state.pendaftaran = state.pendaftaran.map((x) => (x.idRegistrasi === idRegistrasi ? { ...x, status: '4' } : x))
    return response(config, ok({ idRegistrasi }, 'Data pendaftaran berhasil dibatalkan.'))
  }
  if (url.startsWith('/pendaftaran/') && url.endsWith('/pulang') && method === 'post') {
    const idRegistrasi = url.split('/')[2]
    state.pendaftaran = state.pendaftaran.map((x) => (x.idRegistrasi === idRegistrasi ? { ...x, status: '3' } : x))
    return response(config, ok({ idRegistrasi }, 'Pasien berhasil dipulangkan.'))
  }

  if (url === '/pelayanan' && method === 'get') return response(config, ok(paged(withFilter(state.pelayanan, params.search), Number(params.page || 1), Number(params.pageSize || 20))))
  if (url.startsWith('/pelayanan/') && method === 'get') {
    const parts = url.split('/')
    const idRegistrasi = parts[2]
    const sub = parts[3]
    if (!sub) {
      const row = state.pelayanan.find((x) => x.idRegistrasi === idRegistrasi)
      return response(config, ok({ ...(pelayananDetailStore[idRegistrasi] ?? {}), ...(row ?? { idRegistrasi }) }))
    }
    if (sub === 'tindakan') {
      return response(config, ok(tindakanStore[idRegistrasi] ?? []))
    }
    if (sub === 'resep') {
      return response(config, ok(resepStore[idRegistrasi] ?? []))
    }
    if (sub === 'alkes' || sub === 'laboratorium' || sub === 'radiologi') {
      return response(config, ok([]))
    }
  }

  if (url.startsWith('/pelayanan/') && method === 'post') {
    const parts = url.split('/')
    const idRegistrasi = parts[2]
    const sub = parts[3]
    if (sub === 'tindakan') {
      const list = tindakanStore[idRegistrasi] ?? []
      const detailId = (Math.max(0, ...list.map((x) => Number(x.detailId ?? 0))) || 0) + 1
      const row = { detailId, nama: String(body.nama ?? 'Tindakan Baru'), qty: Number(body.qty ?? 1), harga: Number(body.harga ?? 0) }
      tindakanStore[idRegistrasi] = [row, ...list]
      return response(config, ok(row, 'Tindakan berhasil ditambahkan.'))
    }
    if (sub === 'resep') {
      const list = resepStore[idRegistrasi] ?? []
      const detailId = (Math.max(0, ...list.map((x) => Number(x.detailId ?? 0))) || 0) + 1
      const row = { detailId, namaObat: String(body.namaObat ?? 'Obat Baru'), dosis: String(body.dosis ?? '1x1'), qty: Number(body.qty ?? 1) }
      resepStore[idRegistrasi] = [row, ...list]
      return response(config, ok(row, 'Resep berhasil ditambahkan.'))
    }
    if (sub === 'alkes' || sub === 'laboratorium' || sub === 'radiologi') {
      return response(config, ok({ idRegistrasi, jenis: sub }, `${sub} berhasil disimpan.`))
    }
  }

  if (url.startsWith('/pelayanan/') && method === 'delete') {
    const parts = url.split('/')
    const idRegistrasi = parts[2]
    const sub = parts[3]
    const detailId = Number(parts[4] || '0')
    if (sub === 'tindakan') {
      tindakanStore[idRegistrasi] = (tindakanStore[idRegistrasi] ?? []).filter((x) => Number(x.detailId ?? 0) !== detailId)
      return response(config, ok({ detailId }, 'Tindakan berhasil dihapus.'))
    }
    if (sub === 'resep') {
      resepStore[idRegistrasi] = (resepStore[idRegistrasi] ?? []).filter((x) => Number(x.detailId ?? 0) !== detailId)
      return response(config, ok({ detailId }, 'Resep berhasil dihapus.'))
    }
    if (sub === 'alkes' || sub === 'laboratorium' || sub === 'radiologi') {
      return response(config, ok({ detailId }, `${sub} berhasil dihapus.`))
    }
  }

  if (url.startsWith('/pelayanan/') && method === 'put') {
    const parts = url.split('/')
    const idRegistrasi = parts[2]
    const sub = parts[3]
    const tindakanId = Number(parts[4] || '0')
    if (sub === 'tindakan') {
      tindakanStore[idRegistrasi] = (tindakanStore[idRegistrasi] ?? []).map((x) =>
        Number(x.detailId ?? 0) === tindakanId ? { ...x, ...body } : x,
      )
      return response(config, ok({ tindakanId }, 'Tindakan berhasil diperbarui.'))
    }
  }

  if (url === '/kasir/pembayaran' && method === 'get') return response(config, ok(paged(withFilter(state.pembayaran, params.search), Number(params.page || 1), Number(params.pageSize || 20))))
  if (url === '/kasir/pembayaran' && method === 'post') {
    const newId = Math.max(...state.pembayaran.map((x) => x.id), 0) + 1
    const total = Number(body.total ?? 0)
    const bAdmin = Number(body.bAdmin ?? 0)
    const bTambahan = Number(body.bTambahan ?? 0)
    const bOngkir = Number(body.bOngkir ?? 0)
    const diskon = Number(body.diskon ?? 0)
    const jumlahBayar = Number(body.jumlahBayar ?? 0)
    const grandtotal = total + bAdmin + bTambahan + bOngkir - diskon
    const row = {
      id: newId,
      noInvoice: `INV-${24000 + newId}`,
      idRegistrasi: String(body.idRegistrasi ?? `RG${24000 + newId}`),
      idPasien: String(body.idPasien ?? 'P0001'),
      namaPasien: 'Pasien Dummy',
      kdDokter: String(body.kdDokter ?? 'D001'),
      namaDokter: 'dr. Dummy',
      total,
      grandtotal,
      jumlahBayar,
      sisa: Math.max(grandtotal - jumlahBayar, 0),
      status: '1',
      tglBayar: new Date().toISOString().slice(0, 10),
    }
    state.pembayaran.unshift(row)
    return response(config, ok({ id: row.id, noInvoice: row.noInvoice }, 'Pembayaran berhasil dibuat.'))
  }
  if (url.startsWith('/kasir/pembayaran/') && url.endsWith('/bayar-sisa') && method === 'post') {
    const id = Number(url.split('/')[3])
    const bayar = Number(body.bayar ?? 0)
    state.pembayaran = state.pembayaran.map((x) => (x.id === id ? { ...x, jumlahBayar: (x.jumlahBayar ?? 0) + bayar, sisa: Math.max((x.sisa ?? 0) - bayar, 0) } : x))
    return response(config, ok({ id }, 'Pembayaran sisa berhasil diproses.'))
  }
  if (url.startsWith('/kasir/pembayaran/') && url.endsWith('/void') && method === 'post') {
    const id = Number(url.split('/')[3])
    state.pembayaran = state.pembayaran.map((x) => (x.id === id ? { ...x, status: '4' } : x))
    return response(config, ok({ id }, 'Pembayaran berhasil dibatalkan.'))
  }
  if (url.startsWith('/kasir/invoice-preview/') && method === 'get') {
    const idRegistrasi = url.split('/').pop() || ''
    const inv = state.pembayaran.find((x) => x.idRegistrasi === idRegistrasi)
    return response(config, ok({ invoice: inv?.noInvoice, registrasi: idRegistrasi, pasien: inv?.namaPasien, dokter: inv?.namaDokter, grandTotal: inv?.grandtotal, jumlahBayar: inv?.jumlahBayar, sisa: inv?.sisa, detail: [{ item: 'Tindakan Konsultasi', qty: 1, harga: 150000 }, { item: 'Obat', qty: 1, harga: 50000 }] }))
  }

  if (url === '/kasir/pengeluaran' && method === 'get') {
    return response(config, ok(paged(withFilter(state.pengeluaran as Record<string, unknown>[], params.search), Number(params.page || 1), Number(params.pageSize || 20))))
  }

  if (url === '/kasir/pengeluaran' && method === 'post') {
    const newId = Math.max(...state.pengeluaran.map((x) => Number(x.id || 0)), 0) + 1
    const detail = Array.isArray(body.detail) ? (body.detail as Array<Record<string, unknown>>).map((x, idx) => ({ detailId: idx + 1, nama: String(x.nama ?? '-'), nominal: Number(x.nominal ?? 0) })) : []
    const total = detail.reduce((sum, d) => sum + Number(d.nominal || 0), 0)
    const row = { id: newId, tanggal: String(body.tanggal ?? new Date().toISOString().slice(0, 10)), keterangan: String(body.keterangan ?? 'Pengeluaran baru'), total, detail }
    state.pengeluaran.unshift(row)
    return response(config, ok({ id: newId }, 'Pengeluaran berhasil dibuat.'))
  }

  if (url.startsWith('/kasir/pengeluaran/') && method === 'get') {
    const id = Number(url.split('/')[3] || '0')
    const row = state.pengeluaran.find((x) => Number(x.id || 0) === id)
    return response(config, ok(row ?? {}))
  }

  if (url.startsWith('/kasir/pengeluaran/') && method === 'delete') {
    const parts = url.split('/')
    const id = Number(parts[3] || '0')
    const detailId = Number(parts[5] || '0')
    state.pengeluaran = state.pengeluaran.map((row) => {
      if (Number(row.id || 0) !== id) return row
      const detail = (Array.isArray(row.detail) ? row.detail : []).filter((d: any) => Number(d.detailId || 0) !== detailId)
      const total = detail.reduce((sum: number, d: any) => sum + Number(d.nominal || 0), 0)
      return { ...row, detail, total }
    })
    return response(config, ok({ id, detailId }, 'Detail pengeluaran berhasil dihapus.'))
  }

  if (url === '/laporan/tindakan' && method === 'get') return response(config, ok(paged(withFilter(state.pelayanan.map((x, idx) => ({ idTransaksi: `TRX-${idx + 1}`, idRegistrasi: x.idRegistrasi, namaPasien: x.namaPasien, namaDokter: x.dokterNama, tanggal: x.tanggal, total: 150000 + idx * 25000, status: x.status })), params.search), Number(params.page || 1), Number(params.pageSize || 20))))
  if (url === '/laporan/pembayaran' && method === 'get') return response(config, ok(paged(withFilter(state.pembayaran, params.search), Number(params.page || 1), Number(params.pageSize || 20))))
  if (url === '/laporan/pendaftaran' && method === 'get') return response(config, ok(paged(withFilter(state.pendaftaran, params.search), Number(params.page || 1), Number(params.pageSize || 20))))

  if (url === '/rekam-medis/forms' && method === 'get') return response(config, ok(['surat-sehat', 'surat-sakit', 'resume-medis', 'cppt', 'asesmen-awal']))
  if (url === '/rekam-medis/history' && method === 'get') {
    const idPasien = params.idPasien || 'P0001'
    const idRegistrasi = params.idRegistrasi || 'RG24001'
    return response(config, ok([
      { id: 1, idRm: 1, kodeRm: 'RM-001', idPasien, idRegistrasi, judulRm: 'Kontrol ISPA', tanggal: '2026-04-29', jam: '09:00' },
      { id: 2, idRm: 2, kodeRm: 'RM-002', idPasien, idRegistrasi, judulRm: 'Evaluasi Tekanan Darah', tanggal: '2026-04-30', jam: '11:20' },
    ]))
  }
  if (url.startsWith('/rekam-medis/') && method === 'get') {
    const formKey = url.split('/').pop() || 'unknown'
    return response(config, ok([
      { id: 1, form: formKey, idPasien: params.idPasien || 'P0001', idRegistrasi: params.idRegistrasi || 'RG24001', catatan: 'Dummy data untuk pengecekan UI', dokter: 'dr. Nabila', keluhanUtama: 'Batuk pilek' },
      { id: 2, form: formKey, idPasien: params.idPasien || 'P0002', idRegistrasi: params.idRegistrasi || 'RG24002', catatan: 'Kontrol lanjutan', dokter: 'dr. Farhan', keluhanUtama: 'Pusing' },
    ]))
  }

  return response(config, ok({}, `Mock endpoint belum diatur untuk ${method.toUpperCase()} ${url}`))
}
