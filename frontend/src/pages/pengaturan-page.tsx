import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Cloud, DatabaseBackup, Hospital, RefreshCw, Save, ShieldCheck, SlidersHorizontal, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { FieldLabel } from '../components/field-label'
import { MetricGrid } from '../components/metric-grid'
import { PageHeader } from '../components/page-header'
import { SectionCard } from '../components/section-card'
import { StatCard } from '../components/stat-card'
import { createMasterRole, updateMasterRole, updateMasterRolePermissions, updateMasterUserAccess, upsertMasterSetting, type MasterRole, type MasterUser } from '../api/master'
import { useMasterRoles, useMasterSetting, useMasterUser } from '../hooks/use-master'
import { parseApiError } from '../lib/api-error'
import { useT, type TranslationKey } from '../i18n'

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

const menuPermissions = [
  { key: 'menu.dashboard', labelKey: 'settings.permission.dashboard' },
  { key: 'menu.pendaftaran', labelKey: 'settings.permission.pendaftaran' },
  { key: 'menu.pelayanan', labelKey: 'settings.permission.pelayanan' },
  { key: 'menu.kasir', labelKey: 'settings.permission.kasir' },
  { key: 'menu.laporan', labelKey: 'settings.permission.laporan' },
  { key: 'menu.master', labelKey: 'settings.permission.master' },
  { key: 'menu.rekam-medis', labelKey: 'settings.permission.rekamMedis' },
  { key: 'menu.pengaturan', labelKey: 'settings.permission.pengaturan' },
] satisfies Array<{ key: string; labelKey: TranslationKey }>

export function PengaturanPage({ canFetch }: { canFetch: boolean }) {
  const { t } = useT()
  const [activeTab, setActiveTab] = useState<SettingTab>('clinic')
  const [search, setSearch] = useState('')
  const settings = useMasterSetting(1, 100, '', canFetch)
  const userSummary = useMasterUser(1, 1, '', canFetch)
  const users = useMasterUser(1, 20, search, canFetch && activeTab === 'users')
  const roles = useMasterRoles(canFetch && (activeTab === 'users' || activeTab === 'roles'))
  const rows = settings.data?.data.items ?? []
  const clinicIdentity = rows.find((item) => item.jenis === 'clinic.identity')
  const [form, setForm] = useState<Partial<ClinicIdentityForm>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof ClinicIdentityForm, boolean>>>({})
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ClinicIdentityForm, string>>>({})
  const [summary, setSummary] = useState('')
  const [userDrafts, setUserDrafts] = useState<Record<number, { roleId: number; status: number }>>({})
  const [newRoleName, setNewRoleName] = useState('')
  const [roleDrafts, setRoleDrafts] = useState<Record<number, { name: string; status: number; permissions: string[] }>>({})
  const saveMutation = useMutation({ mutationFn: upsertMasterSetting })
  const userAccessMutation = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: { roleId: number; status: number } }) => updateMasterUserAccess(id, payload) })
  const createRoleMutation = useMutation({ mutationFn: createMasterRole })
  const updateRoleMutation = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: { name: string; status: number } }) => updateMasterRole(id, payload) })
  const updateRolePermissionsMutation = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: { permissions: string[] } }) => updateMasterRolePermissions(id, payload) })

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

  const roleOptions = useMemo(() => (roles.data?.data ?? []).filter((role) => role.status === 1), [roles.data?.data])

  function userDraft(user: MasterUser) {
    return userDrafts[user.id] ?? { roleId: user.roleId ?? roleOptions[0]?.id ?? 2, status: user.status ?? 1 }
  }

  async function saveUserAccess(user: MasterUser) {
    const draft = userDraft(user)
    try {
      await userAccessMutation.mutateAsync({ id: user.id, payload: draft })
      await users.refetch()
      setUserDrafts((prev) => {
        const next = { ...prev }
        delete next[user.id]
        return next
      })
      toast.success(t('settings.toast.userAccessUpdated'))
    } catch (error: unknown) {
      const responseData = typeof error === 'object' && error && 'response' in error
        ? (error.response as { data?: unknown } | undefined)?.data
        : undefined
      toast.error(parseApiError(responseData).message)
    }
  }

  function roleDraft(role: MasterRole) {
    return roleDrafts[role.id] ?? { name: role.name, status: role.status, permissions: role.permissions ?? [] }
  }

  async function createRole() {
    const name = newRoleName.trim()
    if (!name) {
      toast.error(t('settings.toast.roleNameRequired'))
      return
    }
    try {
      await createRoleMutation.mutateAsync({ name, status: 1 })
      setNewRoleName('')
      await roles.refetch()
      toast.success(t('settings.toast.roleCreated'))
    } catch (error: unknown) {
      const responseData = typeof error === 'object' && error && 'response' in error
        ? (error.response as { data?: unknown } | undefined)?.data
        : undefined
      toast.error(parseApiError(responseData).message)
    }
  }

  async function saveRole(role: MasterRole) {
    const draft = roleDraft(role)
    try {
      await updateRoleMutation.mutateAsync({ id: role.id, payload: { name: draft.name.trim() || role.name, status: draft.status } })
      await updateRolePermissionsMutation.mutateAsync({ id: role.id, payload: { permissions: draft.permissions } })
      await roles.refetch()
      setRoleDrafts((prev) => {
        const next = { ...prev }
        delete next[role.id]
        return next
      })
      toast.success(t('settings.toast.roleUpdated'))
    } catch (error: unknown) {
      const responseData = typeof error === 'object' && error && 'response' in error
        ? (error.response as { data?: unknown } | undefined)?.data
        : undefined
      toast.error(parseApiError(responseData).message)
    }
  }

  function toggleRolePermission(role: MasterRole, permission: string, checked: boolean) {
    const draft = roleDraft(role)
    const permissions = checked
      ? Array.from(new Set([...draft.permissions, permission]))
      : draft.permissions.filter((item) => item !== permission)
    setRoleDrafts((prev) => ({ ...prev, [role.id]: { ...draft, permissions } }))
  }

  async function saveClinicIdentity() {
    const nextErrors: Partial<Record<keyof ClinicIdentityForm, string>> = {}
    const clinicName = formValues.clinicName.trim()
    const email = formValues.email.trim()

    if (!clinicName) {
      nextErrors.clinicName = t('settings.toast.clinicNameRequired')
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = t('settings.toast.invalidEmail')
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setSummary(t('settings.toast.validationSummary'))
      toast.error(t('settings.toast.validationFailed'))
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
      toast.success(t('settings.toast.clinicUpdated'))
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
    { key: 'clinic' as const, labelKey: 'settings.tab.clinic' as const, descriptionKey: 'settings.tab.clinicDesc' as const, icon: Hospital },
    { key: 'users' as const, labelKey: 'settings.tab.users' as const, descriptionKey: 'settings.tab.usersDesc' as const, icon: Users },
    { key: 'roles' as const, labelKey: 'settings.tab.roles' as const, descriptionKey: 'settings.tab.rolesDesc' as const, icon: ShieldCheck },
    { key: 'backup' as const, labelKey: 'settings.tab.backup' as const, descriptionKey: 'settings.tab.backupDesc' as const, icon: DatabaseBackup },
    { key: 'system' as const, labelKey: 'settings.tab.system' as const, descriptionKey: 'settings.tab.systemDesc' as const, icon: SlidersHorizontal },
  ]

  return (
    <section className="page-card settings-page">
      <PageHeader title={t('pengaturan.title')} description={t('nav.pengaturan.desc')} eyebrow={t('nav.pengaturan')} />

      <MetricGrid>
        <StatCard icon={Hospital} label={t('settings.metric.clinicProfile')} value={formValues.clinicName} footer={t('settings.metric.clinicProfileFooter')} />
        <StatCard icon={Users} label={t('settings.metric.activeUsers')} value={userSummary.data?.data.total ?? 0} tone="secondary" footer={t('settings.metric.activeUsersFooter')} />
        <StatCard icon={ShieldCheck} label={t('settings.metric.securityMode')} value={t('settings.metric.securityValue')} tone="tertiary" footer={t('settings.metric.securityFooter')} />
        <StatCard icon={Cloud} label={t('settings.metric.backupStatus')} value={t('settings.metric.backupValue')} tone="neutral" footer={t('settings.metric.backupFooter')} />
      </MetricGrid>

      <div className="settings-layout">
        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button key={tab.key} className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                <span className="settings-tab-icon"><Icon size={18} /></span>
                <span>
                  <strong>{t(tab.labelKey)}</strong>
                  <small>{t(tab.descriptionKey)}</small>
                </span>
              </button>
            )
          })}
        </div>

        <div className="settings-panel">
          {activeTab === 'clinic' ? (
            <SectionCard title={t('settings.clinic.title')} description={t('settings.clinic.desc')} actions={<button className="icon-btn btn-primary" disabled={saveMutation.isPending} onClick={saveClinicIdentity}><Save size={16} /> {t('settings.clinic.save')}</button>} className="settings-clinic-card">
              {summary ? <div className="error-summary">{summary}</div> : null}
              <div className="settings-clinic-grid">
                <div className="settings-form-grid">
                  <FieldLabel text={t('settings.field.clinicName')} htmlFor="setting-clinic-name"><input {...inputProps('clinicName', 'setting-clinic-name')} value={formValues.clinicName} onChange={(event) => updateField('clinicName', event.target.value)} />{fieldError('clinicName', 'setting-clinic-name')}</FieldLabel>
                  <FieldLabel text={t('settings.field.taxId')} htmlFor="setting-tax-id"><input {...inputProps('taxId', 'setting-tax-id')} value={formValues.taxId} onChange={(event) => updateField('taxId', event.target.value)} />{fieldError('taxId', 'setting-tax-id')}</FieldLabel>
                  <FieldLabel text={t('settings.field.primaryPhone')} htmlFor="setting-phone"><input {...inputProps('phone', 'setting-phone')} value={formValues.phone} onChange={(event) => updateField('phone', event.target.value)} />{fieldError('phone', 'setting-phone')}</FieldLabel>
                  <FieldLabel text={t('settings.field.mobile')} htmlFor="setting-no-hp"><input {...inputProps('noHp', 'setting-no-hp')} value={formValues.noHp} onChange={(event) => updateField('noHp', event.target.value)} />{fieldError('noHp', 'setting-no-hp')}</FieldLabel>
                  <FieldLabel text={t('settings.field.email')} htmlFor="setting-email"><input {...inputProps('email', 'setting-email')} type="email" value={formValues.email} onChange={(event) => updateField('email', event.target.value)} />{fieldError('email', 'setting-email')}</FieldLabel>
                  <FieldLabel text={t('settings.field.sidebarTitle')} htmlFor="setting-title-sidebar"><input {...inputProps('titleSidebar', 'setting-title-sidebar')} value={formValues.titleSidebar} onChange={(event) => updateField('titleSidebar', event.target.value)} />{fieldError('titleSidebar', 'setting-title-sidebar')}</FieldLabel>
                  <FieldLabel text={t('settings.field.logoUrl')} htmlFor="setting-logo"><input {...inputProps('logo', 'setting-logo')} value={formValues.logo} onChange={(event) => updateField('logo', event.target.value)} />{fieldError('logo', 'setting-logo')}</FieldLabel>
                  <FieldLabel text={t('settings.field.sidebarLogoUrl')} htmlFor="setting-logo-sidebar"><input {...inputProps('logoSidebar', 'setting-logo-sidebar')} value={formValues.logoSidebar} onChange={(event) => updateField('logoSidebar', event.target.value)} />{fieldError('logoSidebar', 'setting-logo-sidebar')}</FieldLabel>
                  <FieldLabel className="settings-form-wide" text={t('settings.field.officeAddress')} htmlFor="setting-address"><textarea {...inputProps('address', 'setting-address')} rows={4} value={formValues.address} onChange={(event) => updateField('address', event.target.value)} />{fieldError('address', 'setting-address')}</FieldLabel>
                  <FieldLabel className="settings-form-wide" text={t('settings.field.notes')} htmlFor="setting-keterangan"><textarea {...inputProps('keterangan', 'setting-keterangan')} rows={4} value={formValues.keterangan} onChange={(event) => updateField('keterangan', event.target.value)} />{fieldError('keterangan', 'setting-keterangan')}</FieldLabel>
                </div>
                <div className="settings-logo-dropzone">
                  <div className="settings-logo-mark">MF</div>
                  <strong>{t('settings.logo.title')}</strong>
                  <p>{t('settings.logo.desc')}</p>
                  <button className="icon-btn" disabled>{t('settings.logo.upload')}</button>
                </div>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'users' ? (
            <SectionCard title={t('settings.users.title')} description={t('settings.users.desc')} actions={<button className="icon-btn" onClick={() => users.refetch()}><RefreshCw size={16} /> {t('common.refresh')}</button>}>
              <input className="search-input search-dominant" placeholder={t('settings.users.search')} value={search} onChange={(event) => setSearch(event.target.value)} />
              <div className="settings-table-wrap">
                <table className="settings-access-table">
                  <thead>
                    <tr><th>{t('settings.table.user')}</th><th>{t('settings.table.email')}</th><th>{t('settings.table.role')}</th><th>{t('settings.table.status')}</th><th>{t('settings.table.actions')}</th></tr>
                  </thead>
                  <tbody>
                    {(users.data?.data.items ?? []).map((user) => {
                      const draft = userDraft(user)
                      return (
                        <tr key={user.id}>
                          <td><strong>{user.name || '-'}</strong></td>
                          <td>{user.email || '-'}</td>
                          <td>
                            <select value={draft.roleId} onChange={(event) => setUserDrafts((prev) => ({ ...prev, [user.id]: { ...draft, roleId: Number(event.target.value) } }))}>
                              {roleOptions.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                            </select>
                          </td>
                          <td>
                            <select value={draft.status} onChange={(event) => setUserDrafts((prev) => ({ ...prev, [user.id]: { ...draft, status: Number(event.target.value) } }))}>
                              <option value={1}>{t('settings.status.active')}</option>
                              <option value={0}>{t('settings.status.inactive')}</option>
                            </select>
                          </td>
                          <td><button className="icon-btn btn-primary" disabled={userAccessMutation.isPending} onClick={() => saveUserAccess(user)}>{t('common.save')}</button></td>
                        </tr>
                      )
                    })}
                    {users.isLoading || users.isFetching ? <tr><td colSpan={5}>{t('settings.users.loading')}</td></tr> : null}
                    {!users.isLoading && (users.data?.data.items ?? []).length === 0 ? <tr><td colSpan={5}>{t('settings.users.empty')}</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'roles' ? (
            <SectionCard title={t('settings.roles.title')} description={t('settings.roles.desc')}>
              <div className="settings-role-create">
                <input className="search-input" placeholder={t('settings.roles.placeholder')} value={newRoleName} onChange={(event) => setNewRoleName(event.target.value)} />
                <button className="icon-btn btn-primary" disabled={createRoleMutation.isPending} onClick={createRole}>{t('settings.roles.add')}</button>
              </div>
              <div className="settings-table-wrap settings-role-table-wrap">
                <table className="settings-access-table settings-role-table">
                  <thead>
                    <tr>
                      <th>{t('settings.table.role')}</th>
                      <th>{t('settings.table.status')}</th>
                      {menuPermissions.map((permission) => <th key={permission.key}>{t(permission.labelKey)}</th>)}
                      <th>{t('settings.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(roles.data?.data ?? []).map((role) => {
                      const draft = roleDraft(role)
                      return (
                        <tr key={role.id}>
                          <td><input value={draft.name} onChange={(event) => setRoleDrafts((prev) => ({ ...prev, [role.id]: { ...draft, name: event.target.value } }))} /></td>
                          <td>
                            <select value={draft.status} onChange={(event) => setRoleDrafts((prev) => ({ ...prev, [role.id]: { ...draft, status: Number(event.target.value) } }))}>
                              <option value={1}>{t('settings.status.active')}</option>
                              <option value={0}>{t('settings.status.inactive')}</option>
                            </select>
                          </td>
                          {menuPermissions.map((permission) => (
                            <td key={permission.key} className="settings-permission-cell">
                              <input type="checkbox" checked={draft.permissions.includes(permission.key)} onChange={(event) => toggleRolePermission(role, permission.key, event.target.checked)} aria-label={`${role.name} ${t(permission.labelKey)}`} />
                            </td>
                          ))}
                          <td><button className="icon-btn btn-primary" disabled={updateRoleMutation.isPending || updateRolePermissionsMutation.isPending} onClick={() => saveRole(role)}>{t('common.save')}</button></td>
                        </tr>
                      )
                    })}
                    {roles.isLoading || roles.isFetching ? <tr><td colSpan={menuPermissions.length + 3}>{t('settings.roles.loading')}</td></tr> : null}
                    {!roles.isLoading && (roles.data?.data ?? []).length === 0 ? <tr><td colSpan={menuPermissions.length + 3}>{t('settings.roles.empty')}</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'backup' ? (
            <SectionCard title={t('settings.backup.title')} description={t('settings.backup.desc')}>
              <div className="settings-backup-panel">
                <div>
                  <Cloud size={24} />
                  <div><strong>{t('settings.backup.autoTitle')}</strong><p>{t('settings.backup.autoDesc')}</p></div>
                </div>
                <button className="icon-btn" disabled><DatabaseBackup size={16} /> {t('settings.backup.run')}</button>
              </div>
              <div className="settings-danger-panel">
                <strong>{t('settings.backup.resetTitle')}</strong>
                <p>{t('settings.backup.resetDesc')}</p>
                <button className="icon-btn btn-critical" disabled>{t('settings.backup.clear')}</button>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'system' ? (
            <SectionCard title={t('settings.system.title')} description={t('settings.system.desc')}>
              <div className="settings-toggle-list">
                <div><strong>{t('settings.system.darkMode')}</strong><p>{t('settings.system.darkModeDesc')}</p><span>{t('settings.system.topbarControl')}</span></div>
                <div><strong>{t('settings.system.densityMode')}</strong><p>{t('settings.system.densityModeDesc')}</p><span>{t('settings.system.densityValue')}</span></div>
                <div><strong>{t('settings.system.language')}</strong><p>{t('settings.system.languageDesc')}</p><span>{t('settings.system.languageValue')}</span></div>
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </section>
  )
}
