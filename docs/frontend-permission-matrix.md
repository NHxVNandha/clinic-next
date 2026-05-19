# Frontend Permission Matrix

Role names follow lowercase values from auth user profile (`user.role`).

## Route Access

| Route | Allowed Roles |
|---|---|
| `/dashboard` | all authenticated roles |
| `/pendaftaran` | `admin`, `superadmin`, `frontoffice` |
| `/pelayanan` | `admin`, `superadmin`, `dokter`, `perawat` |
| `/kasir` | `admin`, `superadmin`, `kasir` |
| `/laporan` | all authenticated roles |
| `/master` | `admin`, `superadmin` |
| `/rekam-medis` | `admin`, `superadmin`, `dokter`, `perawat` |

## Action Access

| Action Key | Allowed Roles | Scope |
|---|---|---|
| `pendaftaranCreate` | `admin`, `superadmin`, `frontoffice` | Create pendaftaran existing/new patient |
| `destructiveActions` | `admin`, `superadmin`, `kasir` | Generic cancel/delete-like actions |
| `pelayananDetailsManage` | `admin`, `superadmin`, `dokter`, `perawat` | Add/delete tindakan/resep/alkes/lab/rad |
| `kasirPaymentsManage` | `admin`, `superadmin`, `kasir` | Create payment, bayar sisa, cancel payment |
| `kasirPengeluaranManage` | `admin`, `superadmin`, `kasir` | Create/delete pengeluaran details |

## UX Rules

- Unauthorized route access redirects to `/unauthorized?from=<path>`.
- Hidden menu and command-palette entries follow route permission.
- Read-only mode badge appears on pages where write actions are disabled by role.
- Disabled action buttons show a permission reason tooltip.
