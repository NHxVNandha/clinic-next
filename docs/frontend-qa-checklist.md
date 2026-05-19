# Frontend QA Checklist (Dummy + Bypass)

Use this checklist when validating `clinic-next/frontend` in temporary testing mode:

- `VITE_USE_DUMMY_API=true`
- `VITE_BYPASS_LOGIN=true`

## Global

- App opens without login page.
- Topbar shows `Dummy Mode Aktif` and `Bypass Login Aktif` badges.
- `Ctrl/Cmd+K` opens command menu and route navigation works.
- Pressing `/` focuses search input on list pages.
- Dark/light/system theme toggles correctly.
- Button sizing is consistent (compact for chips/icon actions, comfortable for form actions).
- Keyboard focus ring is visible on buttons, chips, tabs, command palette items, and form fields.
- Topbar and toolbar actions wrap cleanly on tablet/mobile without clipping.
- Global `Audit Sesi` panel supports module navigation and download (`.txt` / `.csv`).
- Create/update flows use modal forms (`FormModal`) with consistent spacing and button states.
- Destructive and submit confirmations use themed SweetAlert, while result feedback uses existing toast.
- Primary screens follow SaaS layout hierarchy: filter/search on top, datatable in center, action bar + pager below table.
- Icon-only action buttons always provide `title` and `aria-label`.

## Theme Parity

- Light and dark themes both preserve readable contrast for text, cards, and borders.
- Status badges (`Menunggu/Dilayani/Selesai/Dibatalkan`) remain readable in both themes.
- AG Grid header/rows/hover/selected states are visually aligned with app theme tokens.
- Form controls and search fields use the same focus and border treatment across modules.
- Sidebar active route has clear visual indicator and remains readable in light/dark mode.
- Modal/SweetAlert visual style is consistent with SaaS Emerald surfaces and shadows.

## SaaS Emerald

- Background, card surface, and border hierarchy look neutral-clean (no noisy decorative artifacts).
- Sidebar + topbar feel compact, consistent, and do not distract from data grid area.
- Stats cards and preview boxes share consistent radius, border, and subtle elevation.
- AG Grid pinned columns remain readable and distinct from regular cells.

## Pendaftaran

- List loads and paginates.
- `search` + `page` persist in URL query params.
- If `page` is larger than total page, it auto-normalizes.
- `Tambah Existing` opens modal, validates references, confirms with SweetAlert, then shows toast result.
- `Tambah Pasien Baru` opens modal, validates required fields, confirms with SweetAlert, then shows toast result.
- Row action icons (open pelayanan/kasir, batal, pulang) work directly from datatable action column.
- Action bar appears below datatable and pager appears before audit note.

## Pelayanan

- List loads and paginates.
- `search` + `page` persist in URL query params.
- If `page` is larger than total page, it auto-normalizes.
- Row action icons (open kasir, batalkan) use SweetAlert and update status.
- Detail tab create action opens modal (`Tambah tindakan/resep/alkes/laboratorium/radiologi`) then confirms via SweetAlert.
- Detail delete actions require SweetAlert confirmation before mutation.
- Action bar appears below datatable and pager appears before audit note.

## Kasir

- List, summary cards, and preview section render.
- `search` + `page` persist in URL query params.
- If `page` is larger than total page, it auto-normalizes.
- Create pembayaran works and new row appears.
- `Tambah Pembayaran` opens modal, confirms via SweetAlert, then shows toast result.
- `Tambah Pengeluaran` opens modal, confirms via SweetAlert, then shows toast result.
- Bayar sisa works and values update.
- Batalkan pembayaran and hapus detail pengeluaran both require SweetAlert confirmation.
- Row action icons (open pelayanan, batalkan) work directly from datatable action column.
- Action bar appears below datatable and pager appears before audit note.

## Laporan

- Tab switching (`tindakan/pembayaran/pendaftaran`) works.
- Filters render as chips and `Reset Filter` clears them.
- `Filter Lanjutan` and `Reset Filter` action buttons are located below datatable.
- Mode + filters + page persist in URL query params.
- If `page` is larger than total page, it auto-normalizes.

## Master

- Tabs (`dokter/pasien/jasa/diagnosa`) load correctly.
- `mode` + `search` + `page` persist in URL query params.
- If `page` is larger than total page (non-dokter), it auto-normalizes.
- Dokter/Jasa/Diagnosa create-update-delete flows run from modal and confirm via SweetAlert.
- Inline validation + `aria` error linkage works on jasa/diagnosa forms.
- CRUD action bar (add/edit/delete) is located below datatable and pager appears before audit note.

## Rekam Medis

- Forms list loads and can be selected.
- History list loads and updates with filters.
- `idPasien`, `idRegistrasi`, and selected `form` persist in URL query params.
