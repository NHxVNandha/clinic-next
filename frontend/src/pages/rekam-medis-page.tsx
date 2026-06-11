import { useEffect, useRef, useState } from 'react'
import type { ColDef } from 'ag-grid-community'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { useRekamMedisByForm, useRekamMedisForms, useRekamMedisHistory } from '../hooks/use-rekam-medis'
import { ActionAuditNote } from '../components/action-audit-note'
import { useActionAudit } from '../hooks/use-action-audit'
import { DataGrid } from '../components/data-grid'
import { FieldLabel } from '../components/field-label'
import { PageHeader } from '../components/page-header'
import { useT } from '../i18n'

function renderRecordTable(records: Record<string, unknown>[]) {
  if (!records.length) {
    return <p>Tidak ada data.</p>
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
  const { lastAction, history: auditHistory, logAction, clearHistory, exportText, exportCsv, metrics } = useActionAudit('rekam-medis')

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
      <PageHeader title={t('rekam.title')} description="Form directory, medical history, and letter data per form." eyebrow="Medical Records">
        <div className="header-insight">
          <span className="header-insight-item">Filter pasien dan registrasi untuk mempercepat pelacakan</span>
          <span className="header-insight-item">Gunakan detail form untuk validasi data klinis</span>
          <span className="header-insight-item">Riwayat aksi membantu penelusuran perubahan</span>
        </div>
      </PageHeader>

      <div className="toolbar-row">
        <FieldLabel text="Filter ID Pasien" htmlFor="rekam-medis-filter-pasien" className="toolbar-field">
          <input id="rekam-medis-filter-pasien" ref={searchInputRef} className="search-input" placeholder="Masukkan ID pasien" value={idPasien} onChange={(e) => { setIdPasien(e.target.value); logAction(`Filter pasien diubah (${new Date().toLocaleString('id-ID')}).`) }} />
        </FieldLabel>
        <FieldLabel text="Filter ID Registrasi" htmlFor="rekam-medis-filter-registrasi" className="toolbar-field">
          <input id="rekam-medis-filter-registrasi" className="search-input" placeholder="Masukkan ID registrasi" value={idRegistrasi} onChange={(e) => { setIdRegistrasi(e.target.value); logAction(`Filter registrasi diubah (${new Date().toLocaleString('id-ID')}).`) }} />
        </FieldLabel>
      </div>
      <ActionAuditNote
        message={lastAction}
        history={auditHistory}
        metrics={metrics}
        onClear={clearHistory}
        onCopy={async () => {
          await navigator.clipboard.writeText(exportText())
          toast.success('Riwayat rekam medis disalin.')
        }}
        onDownload={() => {
          const blob = new Blob([exportText()], { type: 'text/plain;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `audit-rekam-medis-${Date.now()}.txt`
          a.click()
          URL.revokeObjectURL(url)
        }}
        onDownloadCsv={() => {
          const blob = new Blob([exportCsv()], { type: 'text/csv;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `audit-rekam-medis-${Date.now()}.csv`
          a.click()
          URL.revokeObjectURL(url)
        }}
      />

      <div className="stats-grid medical-record-stats">
        <article className="stat-card"><small>Total Histori</small><strong>{historyRows.length}</strong></article>
        <article className="stat-card"><small>Kunjungan Hari Ini</small><strong>{historyRows.filter((item) => String(item.tanggal ?? '').startsWith(new Date().toISOString().slice(0, 10))).length}</strong></article>
        <article className="stat-card"><small>Form Tersedia</small><strong>{forms.data?.data?.length ?? 0}</strong></article>
        <article className="stat-card"><small>Review Data</small><strong>{selectedForm ? formRows.length : 0}</strong></article>
      </div>

      <div className="medical-record-layout">
        <aside className="medical-side-panel">
          <section>
           <h2>Form Tersedia</h2>
           {forms.isLoading ? (
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              <div className="skeleton-block" />
              <div className="skeleton-block" />
            </div>
          ) : (
            <div className="chip-wrap">
              {(forms.data?.data ?? []).map((formKey) => (
                <button key={formKey} className={`chip ${selectedForm === formKey ? 'active' : ''}`} onClick={() => { setSelectedForm(formKey); logAction(`Form ${formKey} dipilih (${new Date().toLocaleString('id-ID')}).`) }}>
                  {formKey}
                </button>
              ))}
            </div>
           )}
           {!forms.isLoading && (forms.data?.data?.length ?? 0) === 0 ? <p className="empty-note">Belum ada form rekam medis tersedia.</p> : null}
          </section>

          <section>
            <h2>Security Status</h2>
            <div className="medical-security-item"><strong>Role Based Access</strong><span>Aktif</span></div>
            <div className="medical-security-item"><strong>Session Audit</strong><span>{auditHistory.length} log</span></div>
          </section>
        </aside>

        <section className="medical-history-card">
          <div className="medical-card-head">
            <div>
              <h2>Daftar Riwayat Pasien</h2>
              <p>Filter aktif: {idPasien || 'Semua pasien'} {idRegistrasi ? `• ${idRegistrasi}` : ''}</p>
            </div>
            <span>Filter: 7 Hari Terakhir</span>
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
                    <p>Pasien: {item.idPasien || '-'} • Registrasi: {item.idRegistrasi || '-'}</p>
                  </div>
                  <span>{item.tanggal || '-'} {item.jam || ''}</span>
                </article>
              ))}
            </div>
          ) : (
            <p>Histori tidak ditemukan.</p>
          )}
        </section>

        <section className="medical-form-card">
          <div className="medical-card-head"><div><h2>Data Form {selectedForm ? `(${selectedForm})` : ''}</h2><p>Pilih form untuk menampilkan data klinis terstruktur.</p></div></div>
          {!selectedForm ? (
            <p>Pilih form untuk menampilkan data.</p>
          ) : formData.isLoading ? (
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              <div className="skeleton-block" />
              <div className="skeleton-block" />
              <div className="skeleton-block" />
            </div>
          ) : (
            renderRecordTable(formData.data?.data ?? [])
          )}
        </section>
      </div>
    </section>
  )
}
