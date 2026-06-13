import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { ColDef } from 'ag-grid-community'
import { Cloud, DatabaseBackup, Hospital, RefreshCw, Save, ShieldCheck, SlidersHorizontal, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataGrid } from '../components/data-grid'
import { GridEntityCell } from '../components/grid-entity-cell'
import { FieldLabel } from '../components/field-label'
import { MetricGrid } from '../components/metric-grid'
import { PageHeader } from '../components/page-header'
import { SectionCard } from '../components/section-card'
import { StatCard } from '../components/stat-card'
import { upsertMasterSetting } from '../api/master'
import { useMasterSetting, useMasterUser } from '../hooks/use-master'
import { parseApiError } from '../lib/api-error'
import { useT } from '../i18n'

type SettingTab = 'clinic' | 'users' | 'roles' | 'backup' | 'system'

type ClinicIdentityForm = {
  clinicName: string
  taxId: string
  phone: string
  noHp: string
  email: string
  address: string
  logo: string
  logoSidebar: string
  titleSidebar: string
  keterangan: string
}

const defaultClinicIdentity: ClinicIdentityForm = {
  clinicName: 'MediFlow Healthcare Center',
  taxId: '',
  phone: '',
  noHp: '',
  email: '',
  address: '',
  logo: '',
  logoSidebar: '',
  titleSidebar: '',
  keterangan: '',
}

export function PengaturanPage({ canFetch }: { canFetch: boolean }) {
  const { t } = useT()
  const [activeTab, setActiveTab] = useState<SettingTab>('clinic')
  const [search, setSearch] = useState('')
  const settings = useMasterSetting(1, 100, '', canFetch)
  const userSummary = useMasterUser(1, 1, '', canFetch)
  const users = useMasterUser(1, 20, search, canFetch && activeTab === 'users')
  const rows = settings.data?.data.items ?? []
  const clinicIdentity = rows.find((item) => item.jenis === 'clinic.identity')
  const [form, setForm] = useState<Partial<ClinicIdentityForm>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof ClinicIdentityForm, boolean>>>({})
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ClinicIdentityForm, string>>>({})
  const [summary, setSummary] = useState('')
  const saveMutation = useMutation({ mutationFn: upsertMasterSetting })

  function fieldValue(field: keyof ClinicIdentityForm, savedValue: string | undefined, fallback = '') {
    return touched[field] ? form[field] ?? '' : savedValue ?? fallback
  }

  function updateField(field: keyof ClinicIdentityForm, value: string) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    setSummary('')
    setTouched((prev) => ({ ...prev, [field]: true }))
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function cleanOptional(value: string) {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  function inputProps(field: keyof ClinicIdentityForm, id: string) {
    return {
      id,
      'aria-invalid': Boolean(fieldErrors[field]),
      'aria-describedby': fieldErrors[field] ? `${id}-error` : undefined,
    }
  }

  function fieldError(field: keyof ClinicIdentityForm, id: string) {
    return fieldErrors[field] ? <small id={`${id}-error`} className="field-error">{fieldErrors[field]}</small> : null
  }

  const formValues = {
    clinicName: fieldValue('clinicName', clinicIdentity?.nama, defaultClinicIdentity.clinicName),
    taxId: fieldValue('taxId', clinicIdentity?.taxId),
    phone: fieldValue('phone', clinicIdentity?.phone),
    noHp: fieldValue('noHp', clinicIdentity?.noHp),
    email: fieldValue('email', clinicIdentity?.email),
    address: fieldValue('address', clinicIdentity?.alamat),
    logo: fieldValue('logo', clinicIdentity?.logo),
    logoSidebar: fieldValue('logoSidebar', clinicIdentity?.logoSidebar),
    titleSidebar: fieldValue('titleSidebar', clinicIdentity?.titleSidebar),
    keterangan: fieldValue('keterangan', clinicIdentity?.keterangan),
  }

  const userColumns = useMemo<ColDef<Record<string, unknown>>[]>(() => [
    { field: 'name', headerName: 'User', minWidth: 220, cellRenderer: (params: { value?: string; data?: Record<string, unknown> }) => <GridEntityCell primary={String(params.value ?? params.data?.nama ?? params.data?.email ?? '-')} secondary={String(params.data?.email ?? '').trim() || undefined} kind="user" /> },
    { field: 'email', headerName: 'Email', minWidth: 220 },
    { field: 'role', headerName: 'Role', minWidth: 140 },
    { field: 'status', headerName: 'Status', minWidth: 120 },
  ], [])

  async function saveClinicIdentity() {
    const nextErrors: Partial<Record<keyof ClinicIdentityForm, string>> = {}
    const clinicName = formValues.clinicName.trim()
    const email = formValues.email.trim()

    if (!clinicName) {
      nextErrors.clinicName = 'Nama klinik wajib diisi.'
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Format email tidak valid.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setSummary('Periksa kembali data yang wajib atau belum valid.')
      toast.error('Validasi gagal. Periksa field yang ditandai.')
      return
    }

    const payload = {
      id: clinicIdentity?.id,
      jenis: 'clinic.identity',
      nama: clinicName,
      taxId: cleanOptional(formValues.taxId),
      phone: cleanOptional(formValues.phone),
      noHp: cleanOptional(formValues.noHp),
      email: cleanOptional(formValues.email),
      alamat: cleanOptional(formValues.address),
      logo: cleanOptional(formValues.logo),
      logoSidebar: cleanOptional(formValues.logoSidebar),
      titleSidebar: cleanOptional(formValues.titleSidebar),
      keterangan: cleanOptional(formValues.keterangan),
    }

    try {
      await saveMutation.mutateAsync(payload)
      await settings.refetch()
      setForm({})
      setTouched({})
      setFieldErrors({})
      setSummary('')
      toast.success('Identitas klinik diperbarui.')
    } catch (error: unknown) {
      const responseData = typeof error === 'object' && error && 'response' in error
        ? (error.response as { data?: unknown } | undefined)?.data
        : undefined
      const parsed = parseApiError(responseData)
      const apiErrors: Partial<Record<keyof ClinicIdentityForm, string>> = {}
      if (parsed.fieldErrors.Nama?.[0]) apiErrors.clinicName = parsed.fieldErrors.Nama[0]
      if (parsed.fieldErrors.Email?.[0]) apiErrors.email = parsed.fieldErrors.Email[0]
      if (parsed.fieldErrors.TaxId?.[0]) apiErrors.taxId = parsed.fieldErrors.TaxId[0]
      if (parsed.fieldErrors.Phone?.[0]) apiErrors.phone = parsed.fieldErrors.Phone[0]
      if (parsed.fieldErrors.NoHp?.[0]) apiErrors.noHp = parsed.fieldErrors.NoHp[0]
      if (parsed.fieldErrors.Alamat?.[0]) apiErrors.address = parsed.fieldErrors.Alamat[0]
      if (parsed.fieldErrors.Logo?.[0]) apiErrors.logo = parsed.fieldErrors.Logo[0]
      if (parsed.fieldErrors.LogoSidebar?.[0]) apiErrors.logoSidebar = parsed.fieldErrors.LogoSidebar[0]
      if (parsed.fieldErrors.TitleSidebar?.[0]) apiErrors.titleSidebar = parsed.fieldErrors.TitleSidebar[0]
      if (parsed.fieldErrors.Keterangan?.[0]) apiErrors.keterangan = parsed.fieldErrors.Keterangan[0]
      setFieldErrors(apiErrors)
      setSummary(parsed.message)
      toast.error(parsed.message)
    }
  }

  const tabs = [
    { key: 'clinic' as const, label: 'Clinic Identity', description: 'Profile, address, and logo', icon: Hospital },
    { key: 'users' as const, label: 'User Management', description: 'Operator directory', icon: Users },
    { key: 'roles' as const, label: 'Roles & Permissions', description: 'Access policy overview', icon: ShieldCheck },
    { key: 'backup' as const, label: 'Backup & Restore', description: 'Data continuity controls', icon: DatabaseBackup },
    { key: 'system' as const, label: 'System Preferences', description: 'Theme, density, language', icon: SlidersHorizontal },
  ]

  return (
    <section className="page-card settings-page">
      <PageHeader title={t('pengaturan.title')} description={t('nav.pengaturan.desc')} eyebrow={t('nav.pengaturan')} />

      <MetricGrid>
        <StatCard icon={Hospital} label="Clinic Profile" value={formValues.clinicName} footer="Identitas utama sistem" />
        <StatCard icon={Users} label="Active Users" value={userSummary.data?.data.total ?? 0} tone="secondary" footer="Berdasarkan endpoint user" />
        <StatCard icon={ShieldCheck} label="Security Mode" value="Role Based" tone="tertiary" footer="Akses mengikuti role aplikasi" />
        <StatCard icon={Cloud} label="Backup Status" value="Manual" tone="neutral" footer="Endpoint backup belum tersedia" />
      </MetricGrid>

      <div className="settings-layout">
        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button key={tab.key} className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                <span className="settings-tab-icon"><Icon size={18} /></span>
                <span>
                  <strong>{tab.label}</strong>
                  <small>{tab.description}</small>
                </span>
              </button>
            )
          })}
        </div>

        <div className="settings-panel">
          {activeTab === 'clinic' ? (
            <SectionCard title="Clinic Identity" description="Update your clinical organization details for reports and letterheads." actions={<button className="icon-btn btn-primary" disabled={saveMutation.isPending} onClick={saveClinicIdentity}><Save size={16} /> Save Changes</button>} className="settings-clinic-card">
              {summary ? <div className="error-summary">{summary}</div> : null}
              <div className="settings-clinic-grid">
                <div className="settings-form-grid">
                  <FieldLabel text="Clinic Name" htmlFor="setting-clinic-name"><input {...inputProps('clinicName', 'setting-clinic-name')} value={formValues.clinicName} onChange={(event) => updateField('clinicName', event.target.value)} />{fieldError('clinicName', 'setting-clinic-name')}</FieldLabel>
                  <FieldLabel text="Tax ID / NPWP" htmlFor="setting-tax-id"><input {...inputProps('taxId', 'setting-tax-id')} value={formValues.taxId} onChange={(event) => updateField('taxId', event.target.value)} />{fieldError('taxId', 'setting-tax-id')}</FieldLabel>
                  <FieldLabel text="Primary Phone" htmlFor="setting-phone"><input {...inputProps('phone', 'setting-phone')} value={formValues.phone} onChange={(event) => updateField('phone', event.target.value)} />{fieldError('phone', 'setting-phone')}</FieldLabel>
                  <FieldLabel text="Mobile / WhatsApp" htmlFor="setting-no-hp"><input {...inputProps('noHp', 'setting-no-hp')} value={formValues.noHp} onChange={(event) => updateField('noHp', event.target.value)} />{fieldError('noHp', 'setting-no-hp')}</FieldLabel>
                  <FieldLabel text="Email" htmlFor="setting-email"><input {...inputProps('email', 'setting-email')} type="email" value={formValues.email} onChange={(event) => updateField('email', event.target.value)} />{fieldError('email', 'setting-email')}</FieldLabel>
                  <FieldLabel text="Title Sidebar" htmlFor="setting-title-sidebar"><input {...inputProps('titleSidebar', 'setting-title-sidebar')} value={formValues.titleSidebar} onChange={(event) => updateField('titleSidebar', event.target.value)} />{fieldError('titleSidebar', 'setting-title-sidebar')}</FieldLabel>
                  <FieldLabel text="Logo URL" htmlFor="setting-logo"><input {...inputProps('logo', 'setting-logo')} value={formValues.logo} onChange={(event) => updateField('logo', event.target.value)} />{fieldError('logo', 'setting-logo')}</FieldLabel>
                  <FieldLabel text="Logo Sidebar URL" htmlFor="setting-logo-sidebar"><input {...inputProps('logoSidebar', 'setting-logo-sidebar')} value={formValues.logoSidebar} onChange={(event) => updateField('logoSidebar', event.target.value)} />{fieldError('logoSidebar', 'setting-logo-sidebar')}</FieldLabel>
                  <FieldLabel className="settings-form-wide" text="Office Address" htmlFor="setting-address"><textarea {...inputProps('address', 'setting-address')} rows={4} value={formValues.address} onChange={(event) => updateField('address', event.target.value)} />{fieldError('address', 'setting-address')}</FieldLabel>
                  <FieldLabel className="settings-form-wide" text="Keterangan" htmlFor="setting-keterangan"><textarea {...inputProps('keterangan', 'setting-keterangan')} rows={4} value={formValues.keterangan} onChange={(event) => updateField('keterangan', event.target.value)} />{fieldError('keterangan', 'setting-keterangan')}</FieldLabel>
                </div>
                <div className="settings-logo-dropzone">
                  <div className="settings-logo-mark">MF</div>
                  <strong>Clinic Brand Logo</strong>
                  <p>SVG, PNG, or JPG. Max 2MB. Recommended 512x512px.</p>
                  <button className="icon-btn" disabled>Upload Logo</button>
                </div>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'users' ? (
            <SectionCard title="Active Users" description="User list from master user endpoint." actions={<button className="icon-btn" onClick={() => users.refetch()}><RefreshCw size={16} /> {t('common.refresh')}</button>}>
              <input className="search-input search-dominant" placeholder="Cari user..." value={search} onChange={(event) => setSearch(event.target.value)} />
              <div className="settings-grid-wrap"><DataGrid rows={(users.data?.data.items ?? []) as Record<string, unknown>[]} columns={userColumns} loading={users.isLoading || users.isFetching} compact storageKey="pengaturan-users" /></div>
            </SectionCard>
          ) : null}

          {activeTab === 'roles' ? (
            <SectionCard title="Roles & Permissions" description="Akses saat ini dikendalikan oleh role pada route dan action permission.">
              <div className="settings-note-grid">
                <span>admin / superadmin</span><span>Akses konfigurasi penuh</span>
                <span>kasir</span><span>Kelola pembayaran dan pengeluaran</span>
                <span>dokter / perawat</span><span>Kelola pelayanan dan rekam medis</span>
                <span>frontoffice</span><span>Membuat pendaftaran pasien</span>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'backup' ? (
            <SectionCard title="Backup & Restore" description="Secure your patient data with automated backups after API support is available.">
              <div className="settings-backup-panel">
                <div>
                  <Cloud size={24} />
                  <div><strong>Automatic Backups: Pending API</strong><p>Last successful backup will appear here once backend support is enabled.</p></div>
                </div>
                <button className="icon-btn" disabled><DatabaseBackup size={16} /> Run Manual Backup</button>
              </div>
              <div className="settings-danger-panel">
                <strong>Emergency Factory Reset</strong>
                <p>Action disabled until destructive backend endpoint is explicitly available.</p>
                <button className="icon-btn btn-critical" disabled>Clear System Database</button>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'system' ? (
            <SectionCard title="System Preferences" description="Preferensi operasional aplikasi.">
              <div className="settings-toggle-list">
                <div><strong>Dark Mode</strong><p>Menggunakan tombol tema pada topbar.</p><span>Topbar Control</span></div>
                <div><strong>Density Mode</strong><p>Menggunakan tombol kerapatan pada topbar.</p><span>Compact / Comfortable</span></div>
                <div><strong>Language Preference</strong><p>Default system language for generated medical documents.</p><span>Bahasa Indonesia</span></div>
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </section>
  )
}
