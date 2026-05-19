# Migration Policy

Dokumen ini mengatur perubahan database untuk `clinic-next` saat aplikasi lama masih aktif.

## Prinsip Utama

1. Tidak boleh ada breaking change pada tabel existing.
2. Prioritaskan perubahan additive (tambah tabel/kolom/index).
3. Semua perubahan wajib lewat migration terkontrol.
4. Setiap migration harus punya rollback plan.

## Scope

- Berlaku untuk semua migration backend `.NET 8`.
- Berlaku untuk semua tabel existing (`tm_*`, `tt_*`, `mr_*`, `users`, dll).

## Klasifikasi Perubahan

### Safe

- Tambah tabel baru.
- Tambah kolom nullable.
- Tambah kolom dengan default aman.
- Tambah index non-unik.

### Perlu Review Ketat

- Ubah tipe data kolom existing.
- Tambah unique constraint.
- Tambah foreign key ke tabel yang sibuk dipakai aplikasi lama.
- Backfill data dalam jumlah besar.

### Dilarang Selama Paralel Run

- Drop kolom existing.
- Rename kolom existing.
- Drop atau rename tabel existing.

## Konvensi Naming

- Migration: `YYYYMMDDHHMM_<domain>_<action>`
- Index: `ix_<table>_<column>`
- Foreign key: `fk_<fromtable>_<fromcol>_<totable>`

## Checklist Pull Request

- Tujuan bisnis migration jelas.
- Daftar tabel/kolom/index yang berubah.
- Dampak ke aplikasi lama ditulis eksplisit.
- Rollback plan ditulis eksplisit.
- Bukti testing di staging dilampirkan.

## Rollout Proses

1. Jalankan migration di staging terlebih dahulu.
2. Lakukan smoke test alur kritikal.
3. Jalankan di production pada low-traffic window.
4. Pantau error rate dan slow query.
5. Nonaktifkan fitur baru jika ada masalah.

## Rollback Proses

1. Matikan feature flag terkait fitur baru.
2. Rollback migration jika aman dilakukan.
3. Jika rollback schema tidak aman, lakukan hotfix forward.
4. Pastikan data lama tetap konsisten.

## Aturan Fitur Baru

- Untuk fitur baru, boleh tambah tabel/kolom sesuai domain.
- Kolom baru pada tabel existing harus nullable di fase awal.
- Ubah menjadi required hanya setelah cutover penuh.
