import { useEffect, useRef, useState } from 'react'
import type { ColDef } from 'ag-grid-community'
import { useSearchParams } from 'react-router-dom'
import { useRekamMedisByForm, useRekamMedisForms, useRekamMedisHistory } from '../hooks/use-rekam-medis'
import { DataGrid } from '../components/data-grid'
import { FieldLabel } from '../components/field-label'
import { PageHeader } from '../components/page-header'
import { useT } from '../i18n'

function renderRecordTable(records: Record<string, unknown>[], emptyText: string) {
  if (!records.length) {
    return <p>{emptyText}</p>
  }

  const keys = Array.from(
    records.reduce((set, item) => {
      Object.keys(item).forEach((key) => set.add(key))
      return set
    }, new Set<string>()),
  )

  const columns: ColDef<Record<string, unknown>>[] = keys.map((key) => ({
    field: key,
    headerName: key,
    minWidth: 140,
    valueFormatter: (params) => String(params.value ?? '-'),
  }))

  return <DataGrid rows={records} columns={columns} height={300} storageKey="rekam-medis-form-data" hideUtilityActions compact rowSelection={{ mode: 'singleRow' }} />
}

export function RekamMedisPage({ canFetch }: { canFetch: boolean }) {
  const { t } = useT()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [idPasien, setIdPasien] = useState(searchParams.get('idPasien') || '')
  const [idRegistrasi, setIdRegistrasi] = useState(searchParams.get('idRegistrasi') || '')
  const [selectedForm, setSelectedForm] = useState<string | null>(searchParams.get('form') || null)

  const params = { idPasien: idPasien || undefined, idRegistrasi: idRegistrasi || undefined }
  const forms = useRekamMedisForms(canFetch)
  const history = useRekamMedisHistory(params, canFetch)
  const formData = useRekamMedisByForm(selectedForm, params, canFetch)
  const historyRows = history.data?.data ?? []
  const formRows = formData.data?.data ?? []

  useEffect(() => {
    const next = new URLSearchParams()
    if (idPasien.trim()) next.set('idPasien', idPasien.trim())
    if (idRegistrasi.trim()) next.set('idRegistrasi', idRegistrasi.trim())
    if (selectedForm) next.set('form', selectedForm)
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true })
    }
  }, [idPasien, idRegistrasi, selectedForm, searchParams, setSearchParams])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return
      event.preventDefault()
      searchInputRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <section className="page-card">
      <PageHeader title={t('rekam.title')} description={t('nav.rekamMedis.desc')} eyebrow={t('medical.eyebrow')} />

      <div className="toolbar-row">
        <FieldLabel text={t('medical.filterPatient')} htmlFor="rekam-medis-filter-pasien" className="toolbar-field">
          <input id="rekam-medis-filter-pasien" ref={searchInputRef} className="search-input" placeholder={t('medical.patientPlaceholder')} value={idPasien} onChange={(e) => setIdPasien(e.target.value)} />
        </FieldLabel>
        <FieldLabel text={t('medical.filterRegistration')} htmlFor="rekam-medis-filter-registrasi" className="toolbar-field">
          <input id="rekam-medis-filter-registrasi" className="search-input" placeholder={t('medical.registrationPlaceholder')} value={idRegistrasi} onChange={(e) => setIdRegistrasi(e.target.value)} />
        </FieldLabel>
      </div>

      <div className="stats-grid medical-record-stats">
        <article className="stat-card"><small>{t('medical.totalHistory')}</small><strong>{historyRows.length}</strong></article>
        <article className="stat-card"><small>{t('medical.todayVisits')}</small><strong>{historyRows.filter((item) => String(item.tanggal ?? '').startsWith(new Date().toISOString().slice(0, 10))).length}</strong></article>
        <article className="stat-card"><small>{t('medical.availableForms')}</small><strong>{forms.data?.data?.length ?? 0}</strong></article>
        <article className="stat-card"><small>{t('medical.reviewData')}</small><strong>{selectedForm ? formRows.length : 0}</strong></article>
      </div>

      <div className="medical-record-layout">
        <aside className="medical-side-panel">
          <section>
            <h2>{t('medical.availableForms')}</h2>
           {forms.isLoading ? (
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              <div className="skeleton-block" />
              <div className="skeleton-block" />
            </div>
          ) : (
            <div className="chip-wrap">
              {(forms.data?.data ?? []).map((formKey) => (
                <button key={formKey} className={`chip ${selectedForm === formKey ? 'active' : ''}`} onClick={() => setSelectedForm(formKey)}>
                  {formKey}
                </button>
              ))}
            </div>
           )}
            {!forms.isLoading && (forms.data?.data?.length ?? 0) === 0 ? <p className="empty-note">{t('medical.noForms')}</p> : null}
          </section>

          <section>
            <h2>{t('medical.securityStatus')}</h2>
            <div className="medical-security-item"><strong>{t('medical.roleAccess')}</strong><span>{t('medical.active')}</span></div>
            <div className="medical-security-item"><strong>{t('medical.dataAccess')}</strong><span>{t('medical.controlled')}</span></div>
          </section>
        </aside>

        <section className="medical-history-card">
          <div className="medical-card-head">
            <div>
              <h2>{t('medical.historyList')}</h2>
              <p>{t('medical.activeFilter').replace('{patient}', idPasien || t('medical.allPatients')).replace('{registration}', idRegistrasi ? `• ${idRegistrasi}` : '')}</p>
            </div>
            <span>{t('medical.lastSevenDays')}</span>
          </div>
          {history.isLoading ? (
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              <div className="skeleton-block" />
              <div className="skeleton-block" />
              <div className="skeleton-block" />
            </div>
          ) : history.data?.data?.length ? (
            <div className="medical-history-list">
              {history.data.data.map((item) => (
                <article key={item.id} className="medical-record-row">
                  <div className="medical-avatar">{String(item.idPasien || 'RM').slice(-2).toUpperCase()}</div>
                  <div>
                    <strong>{item.judulRm || item.kodeRm || `RM #${item.id}`}</strong>
                    <p>{t('medical.patient')}: {item.idPasien || '-'} • {t('medical.registration')}: {item.idRegistrasi || '-'}</p>
                  </div>
                  <span>{item.tanggal || '-'} {item.jam || ''}</span>
                </article>
              ))}
            </div>
          ) : (
            <p>{t('medical.historyEmpty')}</p>
          )}
        </section>

        <section className="medical-form-card">
          <div className="medical-card-head"><div><h2>{t('medical.formData')} {selectedForm ? `(${selectedForm})` : ''}</h2><p>{t('medical.formDesc')}</p></div></div>
          {!selectedForm ? (
            <p>{t('medical.selectForm')}</p>
          ) : formData.isLoading ? (
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              <div className="skeleton-block" />
              <div className="skeleton-block" />
              <div className="skeleton-block" />
            </div>
          ) : (
            renderRecordTable(formData.data?.data ?? [], t('medical.noData'))
          )}
        </section>
      </div>
    </section>
  )
}
