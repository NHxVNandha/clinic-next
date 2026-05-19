# Form ID Guideline

Panduan ini dipakai untuk standarisasi `id` input dan `htmlFor` label agar aksesibilitas, konsistensi UI, dan selector e2e lebih stabil.

## Format Penamaan

Gunakan format berikut:

`<halaman>-<konteks>-<field>`

Contoh:

- `pendaftaran-existing-idpasien`
- `pendaftaran-baru-kddokter`
- `pelayanan-modal-tindakan-qty`
- `kasir-create-jumlahbayar`
- `master-jasa-harga`
- `laporan-filter-from`
- `rekam-medis-filter-registrasi`

## Aturan Utama

- Semua input form yang penting wajib punya `id` unik.
- Semua label wajib terhubung via `htmlFor` ke `id` input.
- Komponen master combobox wajib menerima dan meneruskan `inputId` ke elemen input internal.
- Hindari nama `id` generik seperti `input-1`, `field`, `value`, `data`.
- Gunakan lowercase dan pemisah `-` (kebab-case).

## Prefix Halaman

- `pendaftaran` untuk halaman pendaftaran
- `pelayanan` untuk halaman pelayanan
- `kasir` untuk halaman kasir
- `master` untuk halaman master
- `laporan` untuk halaman laporan
- `rekam-medis` untuk halaman rekam medis

## Konteks Form

- `modal` untuk field di modal
- `inline` untuk field form di dalam card utama
- `filter` untuk field filter toolbar
- `create` untuk form pembuatan data
- `existing` / `baru` untuk variasi form pendaftaran

## Saran Nama Field

- Gunakan nama domain yang sudah umum di aplikasi:
  - `idpasien`, `kddokter`, `idregistrasi`
  - `nama`, `nama-obat`, `dosis`, `qty`, `harga`
  - `tanggal`, `from`, `to`, `status`
  - `keterangan`, `nominal`, `diskon`, `jumlahbayar`

## Checklist PR

- [ ] Input baru punya `id` unik
- [ ] Label terhubung `htmlFor`
- [ ] Placeholder hanya sebagai contoh format, bukan pengganti label
- [ ] Naming `id` mengikuti format `<halaman>-<konteks>-<field>`
- [ ] Build lolos tanpa error TypeScript
