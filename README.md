# clinic-next

Modernisasi aplikasi klinik dengan pendekatan API-first.

## Stack

- Backend: ASP.NET Core Web API `.NET 8 LTS`
- Frontend: React 19 + TypeScript + Vite + TanStack Query + React Router
- Database: pakai schema existing dari sistem lama (additive migration only)

## Struktur Folder

- `backend/ClinicNext.Api` - API utama
- `frontend` - aplikasi web SPA (menu cepat, theme light/dark, command search)
- `docs` - arsitektur, kebijakan migration, dan roadmap
- `infra` - kebutuhan deployment/devops

## Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Konfigurasi API frontend (opsional):

```bash
cp .env.example .env
```

Build frontend:

```bash
npm run build
```

## Jalankan API

```bash
cd backend/ClinicNext.Api
dotnet restore
dotnet run
```

Swagger tersedia saat development environment aktif.

## Endpoint Awal

- `GET /health` - health check
- `POST /api/v1/auth/login` - login JWT (validasi ke tabel `users`)
- `GET /api/v1/auth/me` - profil user aktif dari access token
- `POST /api/v1/auth/refresh` - refresh access token dengan refresh token
- `POST /api/v1/auth/logout` - revoke refresh token aktif
- `GET /api/v1/auth/sessions` - daftar session login user
- `POST /api/v1/auth/revoke-all` - revoke semua session user
- `GET /api/v1/master/pasien` - contoh endpoint master (butuh bearer token)
- `GET /api/v1/master/pasien/{id}` - detail pasien
- `DELETE /api/v1/master/pasien/{id}` - soft delete pasien
- `GET /api/v1/master/dokter` - contoh endpoint master (butuh bearer token)
- `POST /api/v1/master/dokter` - create/update dokter
- `DELETE /api/v1/master/dokter/{id}` - soft delete dokter
- `GET /api/v1/master/jasa` - list master jasa (pagination + search)
- `GET /api/v1/master/diagnosa` - list master diagnosa (pagination + search)
- `GET /api/v1/master/jasa/{id}` - detail jasa
- `GET /api/v1/master/diagnosa/{id}` - detail diagnosa
- `POST /api/v1/master/jasa` - create/update jasa
- `POST /api/v1/master/diagnosa` - create/update diagnosa
- `DELETE /api/v1/master/jasa/{id}` - soft delete jasa
- `DELETE /api/v1/master/diagnosa/{id}` - soft delete diagnosa
- `GET /api/v1/master/user` - list user
- `GET /api/v1/master/user/{id}` - detail user
- `GET /api/v1/master/setting` - list setting
- `POST /api/v1/master/setting` - create/update setting
- `GET /api/v1/master/kode-wilayah` - list referensi kode wilayah
- `GET /api/v1/master/kode-pos` - list referensi kode pos
- `GET /api/v1/master/standart-field-group` - list group standart field
- `GET /api/v1/master/standart-field` - list standart field (opsional filter idFieldGroup)
- `GET /api/v1/pendaftaran` - list pendaftaran (pagination + search + filter status/tanggal)
- `GET /api/v1/pendaftaran/{id}` - detail pendaftaran
- `POST /api/v1/pendaftaran` - create pendaftaran (pasien existing)
- `POST /api/v1/pendaftaran/pasien-baru` - create pasien baru + pendaftaran (transactional)
- `POST /api/v1/pendaftaran/{idRegistrasi}/void` - void pendaftaran
- `POST /api/v1/pendaftaran/{idRegistrasi}/pulang` - pulangkan pasien
- `GET /api/v1/pelayanan` - list pelayanan (default status 1/2)
- `GET /api/v1/pelayanan/{idRegistrasi}` - detail pelayanan
- `GET /api/v1/pelayanan/{idRegistrasi}/tindakan` - lihat header/detail tindakan registrasi
- `POST /api/v1/pelayanan/{idRegistrasi}/tindakan` - simpan tindakan + detail dan update status pendaftaran
- `PUT /api/v1/pelayanan/{idRegistrasi}/tindakan/{tindakanId}` - update tindakan detail + hitung ulang total
- `DELETE /api/v1/pelayanan/{idRegistrasi}/tindakan/{detailId}` - void detail tindakan dan hitung ulang total
- `GET /api/v1/pelayanan/{idRegistrasi}/resep` - lihat header/detail resep registrasi
- `POST /api/v1/pelayanan/{idRegistrasi}/resep` - simpan resep + detail obat
- `DELETE /api/v1/pelayanan/{idRegistrasi}/resep/{detailId}` - void detail resep dan hitung ulang total
- `GET /api/v1/pelayanan/{idRegistrasi}/alkes` - lihat header/detail alkes registrasi
- `POST /api/v1/pelayanan/{idRegistrasi}/alkes` - simpan alkes + detail barang
- `DELETE /api/v1/pelayanan/{idRegistrasi}/alkes/{detailId}` - void detail alkes dan hitung ulang total
- `GET /api/v1/pelayanan/{idRegistrasi}/laboratorium` - lihat header/detail laboratorium registrasi
- `POST /api/v1/pelayanan/{idRegistrasi}/laboratorium` - simpan laboratorium + detail pemeriksaan
- `DELETE /api/v1/pelayanan/{idRegistrasi}/laboratorium/{detailId}` - void detail laboratorium dan hitung ulang total
- `GET /api/v1/pelayanan/{idRegistrasi}/radiologi` - lihat header/detail radiologi registrasi
- `POST /api/v1/pelayanan/{idRegistrasi}/radiologi` - simpan radiologi + detail pemeriksaan
- `DELETE /api/v1/pelayanan/{idRegistrasi}/radiologi/{detailId}` - void detail radiologi dan hitung ulang total
- `GET /api/v1/kasir/pembayaran` - list pembayaran kasir
- `GET /api/v1/kasir/pembayaran/{id}` - detail pembayaran + item tindakan
- `GET /api/v1/kasir/pembayaran/{id}/detail-item` - list item tambahan pembayaran
- `POST /api/v1/kasir/pembayaran/{id}/detail-item` - tambah item tambahan pembayaran
- `GET /api/v1/kasir/invoice-preview/{idRegistrasi}` - preview invoice dari tindakan aktif
- `POST /api/v1/kasir/pembayaran` - create pembayaran dan update status pendaftaran/tindakan
- `POST /api/v1/kasir/pembayaran/{id}/bayar-sisa` - bayar sisa tagihan
- `POST /api/v1/kasir/pembayaran/{id}/void` - void pembayaran dan sinkron status layanan
- `GET /api/v1/kasir/pengeluaran` - list pengeluaran
- `GET /api/v1/kasir/pengeluaran/{id}` - detail pengeluaran
- `POST /api/v1/kasir/pengeluaran` - create pengeluaran + detail
- `DELETE /api/v1/kasir/pengeluaran/{id}/detail/{detailId}` - hapus detail pengeluaran dan hitung ulang grand total
- `GET /api/v1/laporan/tindakan` - laporan tindakan (search + filter status/dokter/tanggal)
- `GET /api/v1/laporan/pembayaran` - laporan pembayaran (search + filter status/dokter/tanggal)
- `GET /api/v1/laporan/pendaftaran` - laporan pendaftaran (search + filter status/dokter/tanggal)
- `GET /api/v1/rekam-medis/forms` - daftar form rekam medis/surat yang tersedia
- `GET /api/v1/rekam-medis/history` - histori rekam medis (filter idPasien/idRegistrasi)
- `GET /api/v1/rekam-medis/{formKey}` - list data per form rekam medis/surat
- `GET /api/v1/rekam-medis/{formKey}/{id}` - detail data per form rekam medis/surat

Catatan laporan: endpoint laporan mendukung filter rentang tanggal dengan `fromDate` dan `toDate` untuk format `dd-MM-yyyy` atau `yyyy-MM-dd`.

## SQL Tambahan (Fitur Baru)

Untuk fitur refresh token, jalankan script berikut di database:

- `docs/sql/20260429_create_tt_auth_refresh_token.sql`

Jika tabel refresh token sudah terlanjur dibuat versi lama, jalankan alter berikut:

- `docs/sql/20260429_alter_tt_auth_refresh_token_add_session_columns.sql`

Untuk modul alkes, jalankan script tambahan:

- `docs/sql/20260429_create_tt_alkes_tables.sql`

Untuk modul laboratorium/radiologi, jalankan script tambahan:

- `docs/sql/20260429_create_tt_laboratorium_radiologi_tables.sql`

## Swagger Authorize

1. Jalankan API.
2. Buka Swagger UI (default development): `https://localhost:<port>/swagger`.
3. Hit endpoint `POST /api/v1/auth/login` menggunakan kredensial user existing.
4. Copy `accessToken` dari response.
5. Klik tombol `Authorize` di kanan atas Swagger, lalu isi:

```text
Bearer <accessToken>
```

6. Setelah authorize, endpoint yang diberi `[Authorize]` bisa langsung dites.

## Alur Auth Singkat

1. Login via `POST /api/v1/auth/login` untuk mendapatkan `accessToken` dan `refreshToken`.
2. Gunakan `accessToken` pada header Authorization untuk endpoint protected.
3. Saat access token habis masa berlaku, gunakan `POST /api/v1/auth/refresh`.
4. Saat logout, panggil `POST /api/v1/auth/logout` dengan `refreshToken`.

## Catatan Penting

- Jangan melakukan breaking change ke schema existing selama aplikasi lama masih berjalan.
- Semua perubahan database mengikuti `docs/migration-policy.md`.
