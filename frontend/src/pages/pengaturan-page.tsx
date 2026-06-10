import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { ColDef } from 'ag-grid-community'
import { Cloud, DatabaseBackup, Hospital, RefreshCw, Save, ShieldCheck, SlidersHorizontal, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataGrid } from '../components/data-grid'
import { FieldLabel } from '../components/field-label'
import { MetricGrid } from '../components/metric-grid'
import { PageHeader } from '../components/page-header'
import { SectionCard } from '../components/section-card'
import { StatCard } from '../components/stat-card'
import { upsertMasterSetting, type MasterSetting } from '../api/master'
import { useMasterSetting, useMasterUser } from '../hooks/use-master'
import { runActionWithFeedback } from '../lib/action-feedback'

type SettingTab = 'clinic' | 'users' | 'roles' | 'backup' | 'system'

function settingValue(rows: MasterSetting[], key: string, fallback = '') {
  return rows.find((item) => item.key === key)?.value ?? fallback
}

export function PengaturanPage({ canFetch }: { canFetch: boolean }) {
  const [activeTab, setActiveTab] = useState<SettingTab>('clinic')
  const [search, setSearch] = useState('')
  const settings = useMasterSetting(1, 100, '', canFetch)
  const users = useMasterUser(1, 20, search, canFetch && activeTab === 'users')
  const rows = settings.data?.data.items ?? []
  const [form, setForm] = useState({ clinicName: '', taxId: '', phone: '', address: '' })
  const saveMutation = useMutation({ mutationFn: upsertMasterSetting })

  const formValues = {
    clinicName: form.clinicName || settingValue(rows, 'clinic.name', 'MediFlow Healthcare Center'),
    taxId: form.taxId || settingValue(rows, 'clinic.taxId', ''),
    phone: form.phone || settingValue(rows, 'clinic.phone', ''),
    address: form.address || settingValue(rows, 'clinic.address', ''),
  }

  const userColumns = useMemo<ColDef<Record<string, unknown>>[]>(() => [
    { field: 'name', headerName: 'User', minWidth: 180, cellRenderer: (params: { value?: string; data?: Record<string, unknown> }) => String(params.value ?? params.data?.nama ?? params.data?.email ?? '-') },
    { field: 'email', headerName: 'Email', minWidth: 220 },
    { field: 'role', headerName: 'Role', minWidth: 140 },
    { field: 'status', headerName: 'Status', minWidth: 120 },
  ], [])

  async function saveClinicIdentity() {
    const payload = {
      settings: [
        { key: 'clinic.name', value: formValues.clinicName, description: 'Nama klinik' },
        { key: 'clinic.taxId', value: formValues.taxId, description: 'NPWP klinik' },
        { key: 'clinic.phone', value: formValues.phone, description: 'Telepon utama klinik' },
        { key: 'clinic.address', value: formValues.address, description: 'Alamat kantor klinik' },
      ],
    }
    const result = await runActionWithFeedback(() => saveMutation.mutateAsync(payload), 'Pengaturan klinik berhasil disimpan.')
    if (result) {
      await settings.refetch()
      toast.success('Identitas klinik diperbarui.')
    }
  }

  const tabs = [
    { key: 'clinic' as const, label: 'Clinic Identity', icon: Hospital },
    { key: 'users' as const, label: 'User Management', icon: Users },
    { key: 'roles' as const, label: 'Roles & Permissions', icon: ShieldCheck },
    { key: 'backup' as const, label: 'Backup & Restore', icon: DatabaseBackup },
    { key: 'system' as const, label: 'System Preferences', icon: SlidersHorizontal },
  ]

  return (
    <section className="page-card settings-page">
      <PageHeader title="System Configuration" description="Kelola identitas klinik, akses pengguna, dan preferensi sistem." eyebrow="Pengaturan Sistem" />

      <MetricGrid>
        <StatCard icon={Hospital} label="Clinic Profile" value={formValues.clinicName} footer="Identitas utama sistem" />
        <StatCard icon={Users} label="Active Users" value={users.data?.data.total ?? 0} tone="secondary" footer="Berdasarkan endpoint user" />
        <StatCard icon={ShieldCheck} label="Security Mode" value="Role Based" tone="tertiary" footer="Akses mengikuti role aplikasi" />
        <StatCard icon={Cloud} label="Backup Status" value="Manual" tone="neutral" footer="Endpoint backup belum tersedia" />
      </MetricGrid>

      <div className="settings-layout">
        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return <button key={tab.key} className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}><Icon size={18} /><span>{tab.label}</span></button>
          })}
        </div>

        <div className="settings-panel">
          {activeTab === 'clinic' ? (
            <SectionCard title="Clinic Identity" description="Update detail organisasi untuk laporan dan dokumen klinik." actions={<button className="icon-btn btn-primary" disabled={saveMutation.isPending} onClick={saveClinicIdentity}><Save size={16} /> Simpan</button>}>
              <div className="settings-form-grid">
                <FieldLabel text="Clinic Name" htmlFor="setting-clinic-name"><input id="setting-clinic-name" value={formValues.clinicName} onChange={(event) => setForm((prev) => ({ ...prev, clinicName: event.target.value }))} /></FieldLabel>
                <FieldLabel text="Tax ID / NPWP" htmlFor="setting-tax-id"><input id="setting-tax-id" value={formValues.taxId} onChange={(event) => setForm((prev) => ({ ...prev, taxId: event.target.value }))} /></FieldLabel>
                <FieldLabel text="Primary Phone" htmlFor="setting-phone"><input id="setting-phone" value={formValues.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} /></FieldLabel>
                <FieldLabel text="Office Address" htmlFor="setting-address"><textarea id="setting-address" rows={4} value={formValues.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} /></FieldLabel>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'users' ? (
            <SectionCard title="Active Users" description="Daftar pengguna dari master user." actions={<button className="icon-btn" onClick={() => users.refetch()}><RefreshCw size={16} /> Refresh</button>}>
              <input className="search-input search-dominant" placeholder="Cari user..." value={search} onChange={(event) => setSearch(event.target.value)} />
              <div style={{ marginTop: 12 }}><DataGrid rows={(users.data?.data.items ?? []) as Record<string, unknown>[]} columns={userColumns} loading={users.isLoading || users.isFetching} compact storageKey="pengaturan-users" /></div>
            </SectionCard>
          ) : null}

          {activeTab === 'roles' ? <SectionCard title="Roles & Permissions" description="Akses saat ini dikendalikan oleh role pada route dan action permission."><div className="settings-note-grid"><span>admin / superadmin</span><span>Akses konfigurasi penuh</span><span>kasir</span><span>Kelola pembayaran dan pengeluaran</span><span>dokter / perawat</span><span>Kelola pelayanan dan rekam medis</span><span>frontoffice</span><span>Membuat pendaftaran pasien</span></div></SectionCard> : null}
          {activeTab === 'backup' ? <SectionCard title="Backup & Restore" description="Panel disiapkan mengikuti desain Stitch. Endpoint backup belum tersedia."><div className="empty-state"><p className="empty-note">Backup manual dan restore point akan aktif setelah API backup tersedia.</p><button className="icon-btn" disabled><DatabaseBackup size={16} /> Run Manual Backup</button></div></SectionCard> : null}
          {activeTab === 'system' ? <SectionCard title="System Preferences" description="Preferensi operasional aplikasi."><div className="settings-toggle-list"><div><strong>Dark Mode</strong><p>Menggunakan tombol tema pada topbar.</p></div><div><strong>Density Mode</strong><p>Menggunakan tombol kerapatan pada topbar.</p></div><div><strong>Language Preference</strong><p>Bahasa default: Bahasa Indonesia.</p></div></div></SectionCard> : null}
        </div>
      </div>
    </section>
  )
}
