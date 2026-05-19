# API-First Roadmap

Roadmap ini fokus backend dulu, frontend menyusul setelah API stabil.

## Fase 0 - Foundation

- Setup solution `.NET 8 LTS`.
- Setup auth JWT baseline.
- Setup global error handling.
- Setup health check dan Swagger.
- Setup DB connectivity ke existing schema.

## Fase 1 - Master API

- Master Pasien.
- Master Dokter.
- Master Jasa.
- Master Diagnosa.
- Master User dan Setting.

Target: parity fitur inti master di sistem lama.

## Fase 2 - Registrasi dan Pelayanan

- API Pendaftaran pasien baru/lama.
- API pembatalan dan pemulangan pasien.
- API tindakan dan resep.
- API rekam medis prioritas.

Target: alur klinik dari daftar sampai pelayanan selesai.

## Fase 3 - Kasir dan Laporan

- API invoice dan pembayaran.
- API pengeluaran.
- API laporan tindakan.

Target: alur transaksi dan pelaporan harian siap dipakai.

## Fase 4 - Stabilization

- Integration test endpoint kritikal.
- Query tuning untuk endpoint berat.
- UAT paralel dengan sistem lama.
- Freeze API v1.

## Fase 5 - Frontend React

- Mulai React TypeScript konsumsi API v1.
- Implement modul bertahap sesuai backend yang sudah stabil.

## Definition of Done API Module

- Endpoint CRUD/list/search siap.
- Validasi bisnis sesuai perilaku sistem lama.
- Response contract terdokumentasi di Swagger.
- Logging dasar tersedia.
- Tidak ada breaking change ke schema existing.
