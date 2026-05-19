import { useEffect, useMemo, useRef, useState } from 'react'
import type { ColDef, RowClickedEvent } from 'ag-grid-community'
import { useMutation } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { DataGrid } from '../components/data-grid'
import { useMasterDiagnosa, useMasterDokter, useMasterJasa, useMasterPasien } from '../hooks/use-master'
import { FormFeedback } from '../components/form-feedback'
import { FormModal } from '../components/form-modal'
import {
  deleteMasterDiagnosa,
  deleteMasterDokter,
  deleteMasterJasa,
  type MasterDiagnosa,
  type MasterDokter,
  type MasterJasa,
  upsertMasterDiagnosa,
  upsertMasterDokter,
  upsertMasterJasa,
} from '../api/master'
import { runActionWithFeedback } from '../lib/action-feedback'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import { ActionAuditNote } from '../components/action-audit-note'
import { useActionAudit } from '../hooks/use-action-audit'
import { confirmThemedAction } from '../lib/sweet-alert'
import { FieldLabel } from '../components/field-label'

type MasterMode = 'dokter' | 'pasien' | 'jasa' | 'diagnosa'

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function MasterPage({ canFetch }: { canFetch: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialModeParam = searchParams.get('mode')
  const initialMode: MasterMode = initialModeParam === 'pasien' || initialModeParam === 'jasa' || initialModeParam === 'diagnosa' ? initialModeParam : 'dokter'
  const initialPage = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [mode, setMode] = useState<MasterMode>(initialMode)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(initialPage)
  const [selectedDokter, setSelectedDokter] = useState<MasterDokter | null>(null)
  const [selectedJasa, setSelectedJasa] = useState<MasterJasa | null>(null)
  const [selectedDiagnosa, setSelectedDiagnosa] = useState<MasterDiagnosa | null>(null)
  const [kdDokter, setKdDokter] = useState('')
  const [namaDokter, setNamaDokter] = useState('')
  const [icd9, setIcd9] = useState('')
  const [namaJasa, setNamaJasa] = useState('')
  const [keteranganJasa, setKeteranganJasa] = useState('')
  const [hargaJasa, setHargaJasa] = useState('0')
  const [statusJasa, setStatusJasa] = useState('1')
  const [kodeDiagnosa, setKodeDiagnosa] = useState('')
  const [kodeSnomed, setKodeSnomed] = useState('')
  const [namaDiagnosa, setNamaDiagnosa] = useState('')
  const [statusDiagnosa, setStatusDiagnosa] = useState('1')
  const [dokterModalOpen, setDokterModalOpen] = useState(false)
  const [jasaModalOpen, setJasaModalOpen] = useState(false)
  const [diagnosaModalOpen, setDiagnosaModalOpen] = useState(false)
  const { lastAction, history, logAction, clearHistory, exportText, exportCsv, metrics } = useActionAudit('master')
  const [jasaErrors, setJasaErrors] = useState<{ namaJasa?: string; harga?: string; status?: string }>({})
  const [diagnosaErrors, setDiagnosaErrors] = useState<{ kodeDiagnosa?: string; namaDiagnosa?: string; status?: string }>({})

  const dokter = useMasterDokter(debouncedSearch, canFetch && mode === 'dokter')
  const pasien = useMasterPasien(page, 20, debouncedSearch, canFetch && mode === 'pasien')
  const jasa = useMasterJasa(page, 20, debouncedSearch, canFetch && mode === 'jasa')
  const diagnosa = useMasterDiagnosa(page, 20, debouncedSearch, canFetch && mode === 'diagnosa')

  const upsertDokterMutation = useMutation({
    mutationFn: upsertMasterDokter,
  })

  const deleteDokterMutation = useMutation({
    mutationFn: deleteMasterDokter,
  })

  const upsertJasaMutation = useMutation({
    mutationFn: upsertMasterJasa,
  })

  const deleteJasaMutation = useMutation({
    mutationFn: deleteMasterJasa,
  })

  const upsertDiagnosaMutation = useMutation({
    mutationFn: upsertMasterDiagnosa,
  })

  const deleteDiagnosaMutation = useMutation({
    mutationFn: deleteMasterDiagnosa,
  })

  const activeData = mode === 'dokter' ? dokter.data?.data : mode === 'pasien' ? pasien.data?.data.items : mode === 'jasa' ? jasa.data?.data.items : diagnosa.data?.data.items
  const activeLoading = mode === 'dokter' ? dokter.isLoading || dokter.isFetching : mode === 'pasien' ? pasien.isLoading || pasien.isFetching : mode === 'jasa' ? jasa.isLoading || jasa.isFetching : diagnosa.isLoading || diagnosa.isFetching
  const totalItem = mode === 'pasien' ? pasien.data?.data.total ?? 0 : mode === 'jasa' ? jasa.data?.data.total ?? 0 : mode === 'diagnosa' ? diagnosa.data?.data.total ?? 0 : dokter.data?.data.length ?? 0
  const totalPage = Math.max(1, Math.ceil(totalItem / 20))
  const activeFilterCount = search.trim() ? 1 : 0

  const columns = useMemo<ColDef<Record<string, unknown>>[]>(() => {
    if (mode === 'dokter') {
      return [
        { field: 'kdDokter', headerName: 'Kode Dokter', minWidth: 140 },
        { field: 'namaDokter', headerName: 'Nama Dokter', minWidth: 220 },
      ]
    }
    if (mode === 'pasien') {
      return [
        { field: 'idPasien', headerName: 'Kode Pasien', minWidth: 130 },
        { field: 'nik', headerName: 'NIK', minWidth: 160 },
        { field: 'nama', headerName: 'Nama', minWidth: 220 },
        { field: 'noHp', headerName: 'No HP', minWidth: 140 },
      ]
    }
    if (mode === 'jasa') {
      return [
        { field: 'icd9', headerName: 'ICD9', minWidth: 120 },
        { field: 'namaJasa', headerName: 'Nama Jasa', minWidth: 220 },
        { field: 'harga', headerName: 'Harga', minWidth: 140 },
        { field: 'status', headerName: 'Status', minWidth: 100 },
      ]
    }
    return [
      { field: 'kodeDiagnosa', headerName: 'Kode Diagnosa', minWidth: 160 },
      { field: 'namaDiagnosa', headerName: 'Nama Diagnosa', minWidth: 260 },
      { field: 'status', headerName: 'Status', minWidth: 100 },
    ]
  }, [mode])

  const onRowClicked = (event: RowClickedEvent<Record<string, unknown>>) => {
    if (!event.data) return
    if (mode === 'dokter') {
      const data = event.data as unknown as MasterDokter
      setSelectedDokter(data)
      setKdDokter(data.kdDokter ?? '')
      setNamaDokter(data.namaDokter ?? '')
      return
    }
    if (mode === 'jasa') {
      const data = event.data as unknown as MasterJasa
      setSelectedJasa(data)
      setIcd9(data.icd9 ?? '')
      setNamaJasa(data.namaJasa ?? '')
      setKeteranganJasa('')
      setHargaJasa(String(data.harga ?? 0))
      setStatusJasa(String(data.status ?? 1))
      return
    }
    if (mode === 'diagnosa') {
      const data = event.data as unknown as MasterDiagnosa
      setSelectedDiagnosa(data)
      setKodeDiagnosa(data.kodeDiagnosa ?? '')
      setKodeSnomed('')
      setNamaDiagnosa(data.namaDiagnosa ?? '')
      setStatusDiagnosa(String(data.status ?? 1))
    }
  }

  function resetDokterForm() {
    setSelectedDokter(null)
    setKdDokter('')
    setNamaDokter('')
  }

  function resetJasaForm() {
    setSelectedJasa(null)
    setIcd9('')
    setNamaJasa('')
    setKeteranganJasa('')
    setHargaJasa('0')
    setStatusJasa('1')
  }

  function resetDiagnosaForm() {
    setSelectedDiagnosa(null)
    setKodeDiagnosa('')
    setKodeSnomed('')
    setNamaDiagnosa('')
    setStatusDiagnosa('1')
  }

  function openCreateModal() {
    if (mode === 'dokter') {
      resetDokterForm()
      setDokterModalOpen(true)
      return
    }
    if (mode === 'jasa') {
      resetJasaForm()
      setJasaErrors({})
      setJasaModalOpen(true)
      return
    }
    if (mode === 'diagnosa') {
      resetDiagnosaForm()
      setDiagnosaErrors({})
      setDiagnosaModalOpen(true)
    }
  }

  function openEditModal() {
    if (mode === 'dokter' && selectedDokter) {
      setDokterModalOpen(true)
      return
    }
    if (mode === 'jasa' && selectedJasa) {
      setJasaErrors({})
      setJasaModalOpen(true)
      return
    }
    if (mode === 'diagnosa' && selectedDiagnosa) {
      setDiagnosaErrors({})
      setDiagnosaModalOpen(true)
      return
    }
    toast.error('Pilih data terlebih dahulu untuk diubah.')
  }

  async function saveDokter() {
    if (mode !== 'dokter') return
    if (!kdDokter.trim() || !namaDokter.trim()) {
      toast.error('Kode dan nama dokter wajib diisi.')
      return
    }

    const confirmed = await confirmThemedAction({
      title: selectedDokter ? 'Konfirmasi update dokter' : 'Konfirmasi tambah dokter',
      text: selectedDokter ? `Perbarui data dokter ${namaDokter.trim()}?` : `Tambah dokter ${namaDokter.trim()}?`,
      confirmText: selectedDokter ? 'Ya, Update' : 'Ya, Tambah',
    })
    if (!confirmed) return

    const result = await runActionWithFeedback(
      () =>
        upsertDokterMutation.mutateAsync({
          id: selectedDokter?.id,
          kdDokter: kdDokter.trim(),
          namaDokter: namaDokter.trim(),
        }),
      'Data dokter berhasil disimpan.',
    )

    if (result) {
      setDokterModalOpen(false)
      resetDokterForm()
      await dokter.refetch()
      logAction(`Data dokter disimpan (${new Date().toLocaleString('id-ID')}).`)
    }
  }

  async function saveJasa() {
    if (mode !== 'jasa') return
    const nextErrors: { namaJasa?: string; harga?: string; status?: string } = {}
    if (!namaJasa.trim()) {
      nextErrors.namaJasa = 'Nama jasa wajib diisi.'
    }

    const harga = toNumber(hargaJasa, -1)
    const status = toNumber(statusJasa, -1)
    if (harga < 0) {
      nextErrors.harga = 'Harga jasa tidak boleh negatif.'
    }
    if (status !== 0 && status !== 1) {
      nextErrors.status = 'Status jasa hanya boleh 0 atau 1.'
    }

    setJasaErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Form jasa masih belum valid.')
      return
    }

    const confirmed = await confirmThemedAction({
      title: selectedJasa ? 'Konfirmasi update jasa' : 'Konfirmasi tambah jasa',
      text: selectedJasa ? `Perbarui data jasa ${namaJasa.trim()}?` : `Tambah jasa ${namaJasa.trim()}?`,
      confirmText: selectedJasa ? 'Ya, Update' : 'Ya, Tambah',
    })
    if (!confirmed) return

    const result = await runActionWithFeedback(
      () =>
        upsertJasaMutation.mutateAsync({
          id: selectedJasa?.id,
          icd9: icd9.trim() || undefined,
          namaJasa: namaJasa.trim(),
          keterangan: keteranganJasa.trim() || undefined,
          harga,
          status,
        }),
      'Data jasa berhasil disimpan.',
    )

    if (result) {
      setJasaModalOpen(false)
      resetJasaForm()
      await jasa.refetch()
      logAction(`Data jasa disimpan (${new Date().toLocaleString('id-ID')}).`)
    }
  }

  async function saveDiagnosa() {
    if (mode !== 'diagnosa') return
    const nextErrors: { kodeDiagnosa?: string; namaDiagnosa?: string; status?: string } = {}
    if (!kodeDiagnosa.trim()) {
      nextErrors.kodeDiagnosa = 'Kode diagnosa wajib diisi.'
    }
    if (!namaDiagnosa.trim()) {
      nextErrors.namaDiagnosa = 'Nama diagnosa wajib diisi.'
    }

    const status = toNumber(statusDiagnosa, -1)
    if (status !== 0 && status !== 1) {
      nextErrors.status = 'Status diagnosa hanya boleh 0 atau 1.'
    }

    setDiagnosaErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Form diagnosa masih belum valid.')
      return
    }

    const confirmed = await confirmThemedAction({
      title: selectedDiagnosa ? 'Konfirmasi update diagnosa' : 'Konfirmasi tambah diagnosa',
      text: selectedDiagnosa ? `Perbarui data diagnosa ${namaDiagnosa.trim()}?` : `Tambah diagnosa ${namaDiagnosa.trim()}?`,
      confirmText: selectedDiagnosa ? 'Ya, Update' : 'Ya, Tambah',
    })
    if (!confirmed) return

    const result = await runActionWithFeedback(
      () =>
        upsertDiagnosaMutation.mutateAsync({
          id: selectedDiagnosa?.id,
          kodeDiagnosa: kodeDiagnosa.trim(),
          kodeSnomed: kodeSnomed.trim() || undefined,
          namaDiagnosa: namaDiagnosa.trim(),
          status,
        }),
      'Data diagnosa berhasil disimpan.',
    )

    if (result) {
      setDiagnosaModalOpen(false)
      resetDiagnosaForm()
      await diagnosa.refetch()
      logAction(`Data diagnosa disimpan (${new Date().toLocaleString('id-ID')}).`)
    }
  }

  async function deleteSelectedData() {
    if (mode === 'dokter') {
      if (!selectedDokter) {
        toast.error('Pilih dokter yang ingin dihapus.')
        return
      }
      const confirmed = await confirmThemedAction({
        title: 'Konfirmasi hapus dokter',
        text: `Anda yakin ingin menghapus dokter ${selectedDokter.namaDokter}?`,
        confirmText: 'Ya, Hapus',
        danger: true,
      })
      if (!confirmed) return
      const result = await runActionWithFeedback(() => deleteDokterMutation.mutateAsync(selectedDokter.id), 'Data dokter berhasil dihapus.')
      if (result) {
        setDokterModalOpen(false)
        resetDokterForm()
        await dokter.refetch()
        logAction(`Data dokter dihapus (${new Date().toLocaleString('id-ID')}).`)
      }
      return
    }

    if (mode === 'jasa') {
      if (!selectedJasa) {
        toast.error('Pilih jasa yang ingin dihapus.')
        return
      }
      const confirmed = await confirmThemedAction({
        title: 'Konfirmasi hapus jasa',
        text: `Anda yakin ingin menghapus jasa ${selectedJasa.namaJasa}?`,
        confirmText: 'Ya, Hapus',
        danger: true,
      })
      if (!confirmed) return
      const result = await runActionWithFeedback(() => deleteJasaMutation.mutateAsync(selectedJasa.id), 'Data jasa berhasil dihapus.')
      if (result) {
        setJasaModalOpen(false)
        resetJasaForm()
        await jasa.refetch()
        logAction(`Data jasa dihapus (${new Date().toLocaleString('id-ID')}).`)
      }
      return
    }

    if (!selectedDiagnosa) {
      toast.error('Pilih diagnosa yang ingin dihapus.')
      return
    }
    const confirmed = await confirmThemedAction({
      title: 'Konfirmasi hapus diagnosa',
      text: `Anda yakin ingin menghapus diagnosa ${selectedDiagnosa.namaDiagnosa}?`,
      confirmText: 'Ya, Hapus',
      danger: true,
    })
    if (!confirmed) return
    const result = await runActionWithFeedback(() => deleteDiagnosaMutation.mutateAsync(selectedDiagnosa.id), 'Data diagnosa berhasil dihapus.')
    if (result) {
      setDiagnosaModalOpen(false)
      resetDiagnosaForm()
      await diagnosa.refetch()
      logAction(`Data diagnosa dihapus (${new Date().toLocaleString('id-ID')}).`)
    }
  }

  useEffect(() => {
    const next = new URLSearchParams()
    next.set('mode', mode)
    next.set('page', String(page))
    if (search.trim()) next.set('search', search.trim())
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true })
    }
  }, [mode, page, search, searchParams, setSearchParams])

  useEffect(() => {
    if (mode !== 'dokter' && !activeLoading && page > totalPage) {
      setPage(totalPage)
    }
  }, [mode, activeLoading, page, totalPage])

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
      <h1>Master</h1>
      <p>Data referensi utama klinik.</p>
      <div className="header-insight">
        <span className="header-insight-item">Pastikan data master valid sebelum transaksi</span>
        <span className="header-insight-item">Tab aktif menentukan sumber data tabel</span>
        <span className="header-insight-item">Perubahan tersimpan langsung ke API</span>
      </div>

      <div className="toolbar-row">
        <div className="tab-switch">
          <button className={`tab-btn ${mode === 'dokter' ? 'active' : ''}`} onClick={() => setMode('dokter')}>Dokter</button>
          <button className={`tab-btn ${mode === 'pasien' ? 'active' : ''}`} onClick={() => setMode('pasien')}>Pasien</button>
          <button className={`tab-btn ${mode === 'jasa' ? 'active' : ''}`} onClick={() => setMode('jasa')}>Jasa</button>
          <button className={`tab-btn ${mode === 'diagnosa' ? 'active' : ''}`} onClick={() => setMode('diagnosa')}>Diagnosa</button>
        </div>
        <input
          ref={searchInputRef}
          className="search-input"
          placeholder="Cari data master..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <DataGrid
        storageKey={`master-${mode}`}
        rows={(activeData ?? []) as Record<string, unknown>[]}
        columns={columns}
        loading={activeLoading}
        onRowClicked={onRowClicked}
      />
      {mode !== 'pasien' ? (
        <div className="top-actions" style={{ marginTop: 10 }}>
          <button className="icon-btn icon-only btn-primary-soft" title="Tambah data" aria-label="Tambah data" onClick={openCreateModal}><Plus size={14} /></button>
          <button className="icon-btn icon-only" title="Edit data terpilih" aria-label="Edit data terpilih" onClick={openEditModal} disabled={mode === 'dokter' ? !selectedDokter : mode === 'jasa' ? !selectedJasa : !selectedDiagnosa}><Pencil size={14} /></button>
          <button className="icon-btn icon-only btn-critical" title="Hapus data terpilih" aria-label="Hapus data terpilih" onClick={deleteSelectedData} disabled={mode === 'dokter' ? !selectedDokter || deleteDokterMutation.isPending : mode === 'jasa' ? !selectedJasa || deleteJasaMutation.isPending : !selectedDiagnosa || deleteDiagnosaMutation.isPending}><Trash2 size={14} /></button>
        </div>
      ) : null}
      <div className="stats-grid">
        <article className="stat-card">
          <small>Total Data</small>
          <strong>{totalItem}</strong>
        </article>
        <article className="stat-card">
          <small>Halaman Aktif</small>
          <strong>{mode === 'dokter' ? '1 / 1' : `${page} / ${totalPage}`}</strong>
        </article>
        <article className="stat-card">
          <small>Filter Aktif</small>
          <strong>{activeFilterCount}</strong>
        </article>
      </div>
      {!activeLoading && ((activeData ?? []) as Record<string, unknown>[]).length === 0 ? <p className="empty-note">Tidak ada data pada tab ini. Coba ubah kata kunci pencarian atau halaman.</p> : null}

      {mode !== 'dokter' ? (
        <div className="pager-row">
          <button className="icon-btn icon-only" title="Halaman sebelumnya" aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
            <ChevronLeft size={14} />
          </button>
          <span>
            Halaman {page} / {totalPage}
          </span>
          <button className="icon-btn icon-only" title="Halaman berikutnya" aria-label="Halaman berikutnya" disabled={page >= totalPage} onClick={() => setPage((prev) => prev + 1)}>
            <ChevronRight size={14} />
          </button>
        </div>
      ) : null}

      <ActionAuditNote
        message={lastAction}
        history={history}
        metrics={metrics}
        onClear={clearHistory}
        onCopy={async () => {
          await navigator.clipboard.writeText(exportText())
          toast.success('Riwayat master disalin.')
        }}
        onDownload={() => {
          const blob = new Blob([exportText()], { type: 'text/plain;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `audit-master-${Date.now()}.txt`
          a.click()
          URL.revokeObjectURL(url)
        }}
        onDownloadCsv={() => {
          const blob = new Blob([exportCsv()], { type: 'text/csv;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `audit-master-${Date.now()}.csv`
          a.click()
          URL.revokeObjectURL(url)
        }}
      />

      <FormModal
        open={dokterModalOpen}
        title={selectedDokter ? 'Edit Dokter' : 'Tambah Dokter'}
        description="Lengkapi data dokter lalu simpan perubahan."
        onClose={() => setDokterModalOpen(false)}
      >
        <div className="form-grid" style={{ marginTop: 12 }}>
          <FieldLabel text="Kode Dokter" htmlFor="master-dokter-kode">
            <input id="master-dokter-kode" className="search-input" placeholder="Contoh: DKT-001" value={kdDokter} onChange={(event) => setKdDokter(event.target.value)} />
          </FieldLabel>
          <FieldLabel text="Nama Dokter" htmlFor="master-dokter-nama">
            <input id="master-dokter-nama" className="search-input" placeholder="Nama lengkap dokter" value={namaDokter} onChange={(event) => setNamaDokter(event.target.value)} />
          </FieldLabel>
        </div>
        <div className="confirm-actions">
          <button className="btn-muted" disabled={upsertDokterMutation.isPending} onClick={resetDokterForm}>Reset</button>
          <button className="btn-primary" disabled={upsertDokterMutation.isPending} onClick={saveDokter}>
            {upsertDokterMutation.isPending ? 'Menyimpan...' : selectedDokter ? 'Update Dokter' : 'Simpan Dokter'}
          </button>
        </div>
      </FormModal>

      <FormModal
        open={jasaModalOpen}
        title={selectedJasa ? 'Edit Jasa' : 'Tambah Jasa'}
        description="Pastikan harga dan status jasa valid sebelum menyimpan."
        onClose={() => setJasaModalOpen(false)}
      >
        <div className="form-grid" style={{ marginTop: 12 }}>
          <FieldLabel text="ICD9" htmlFor="master-jasa-icd9">
            <input id="master-jasa-icd9" className="search-input" placeholder="Kode ICD9 (opsional)" value={icd9} onChange={(event) => setIcd9(event.target.value)} />
          </FieldLabel>
          <FieldLabel text="Nama Jasa" htmlFor="master-jasa-nama">
            <input
              id="master-jasa-nama"
              className="search-input"
              placeholder="Nama jasa"
              value={namaJasa}
              onChange={(event) => setNamaJasa(event.target.value)}
              aria-invalid={Boolean(jasaErrors.namaJasa)}
              aria-describedby={jasaErrors.namaJasa ? 'master-jasa-nama-error' : undefined}
            />
          </FieldLabel>
          <FieldLabel text="Harga" htmlFor="master-jasa-harga">
            <input
              id="master-jasa-harga"
              className="search-input"
              type="number"
              min={0}
              placeholder="Nominal harga"
              value={hargaJasa}
              onChange={(event) => setHargaJasa(event.target.value)}
              aria-invalid={Boolean(jasaErrors.harga)}
              aria-describedby={jasaErrors.harga ? 'master-jasa-harga-error' : undefined}
            />
          </FieldLabel>
          <FieldLabel text="Status" htmlFor="master-jasa-status">
            <select
              id="master-jasa-status"
              className="search-input"
              value={statusJasa}
              onChange={(event) => setStatusJasa(event.target.value)}
              aria-invalid={Boolean(jasaErrors.status)}
              aria-describedby={jasaErrors.status ? 'master-jasa-status-error' : undefined}
            >
              <option value="1">Aktif (1)</option>
              <option value="0">Nonaktif (0)</option>
            </select>
          </FieldLabel>
          <FieldLabel text="Keterangan" htmlFor="master-jasa-keterangan">
            <input id="master-jasa-keterangan" className="search-input" placeholder="Keterangan singkat (opsional)" value={keteranganJasa} onChange={(event) => setKeteranganJasa(event.target.value)} />
          </FieldLabel>
        </div>
        {jasaErrors.namaJasa ? <p id="master-jasa-nama-error" className="field-error">{jasaErrors.namaJasa}</p> : null}
        {jasaErrors.harga ? <p id="master-jasa-harga-error" className="field-error">{jasaErrors.harga}</p> : null}
        {jasaErrors.status ? <p id="master-jasa-status-error" className="field-error">{jasaErrors.status}</p> : null}
        <FormFeedback errors={[]} helperText="Harga wajib angka 0 atau lebih. Status dipakai untuk aktif/nonaktif jasa." />
        <div className="confirm-actions">
          <button className="btn-muted" disabled={upsertJasaMutation.isPending} onClick={resetJasaForm}>Reset</button>
          <button className="btn-primary" disabled={upsertJasaMutation.isPending} onClick={saveJasa}>
            {upsertJasaMutation.isPending ? 'Menyimpan...' : selectedJasa ? 'Update Jasa' : 'Simpan Jasa'}
          </button>
        </div>
      </FormModal>

      <FormModal
        open={diagnosaModalOpen}
        title={selectedDiagnosa ? 'Edit Diagnosa' : 'Tambah Diagnosa'}
        description="Kode dan nama diagnosa wajib diisi."
        onClose={() => setDiagnosaModalOpen(false)}
      >
        <div className="form-grid" style={{ marginTop: 12 }}>
          <FieldLabel text="Kode Diagnosa" htmlFor="master-diagnosa-kode">
            <input
              id="master-diagnosa-kode"
              className="search-input"
              placeholder="Kode diagnosa"
              value={kodeDiagnosa}
              onChange={(event) => setKodeDiagnosa(event.target.value)}
              aria-invalid={Boolean(diagnosaErrors.kodeDiagnosa)}
              aria-describedby={diagnosaErrors.kodeDiagnosa ? 'master-diagnosa-kode-error' : undefined}
            />
          </FieldLabel>
          <FieldLabel text="Nama Diagnosa" htmlFor="master-diagnosa-nama">
            <input
              id="master-diagnosa-nama"
              className="search-input"
              placeholder="Nama diagnosa"
              value={namaDiagnosa}
              onChange={(event) => setNamaDiagnosa(event.target.value)}
              aria-invalid={Boolean(diagnosaErrors.namaDiagnosa)}
              aria-describedby={diagnosaErrors.namaDiagnosa ? 'master-diagnosa-nama-error' : undefined}
            />
          </FieldLabel>
          <FieldLabel text="Kode SNOMED" htmlFor="master-diagnosa-snomed">
            <input id="master-diagnosa-snomed" className="search-input" placeholder="Kode SNOMED (opsional)" value={kodeSnomed} onChange={(event) => setKodeSnomed(event.target.value)} />
          </FieldLabel>
          <FieldLabel text="Status" htmlFor="master-diagnosa-status">
            <select
              id="master-diagnosa-status"
              className="search-input"
              value={statusDiagnosa}
              onChange={(event) => setStatusDiagnosa(event.target.value)}
              aria-invalid={Boolean(diagnosaErrors.status)}
              aria-describedby={diagnosaErrors.status ? 'master-diagnosa-status-error' : undefined}
            >
              <option value="1">Aktif (1)</option>
              <option value="0">Nonaktif (0)</option>
            </select>
          </FieldLabel>
        </div>
        {diagnosaErrors.kodeDiagnosa ? <p id="master-diagnosa-kode-error" className="field-error">{diagnosaErrors.kodeDiagnosa}</p> : null}
        {diagnosaErrors.namaDiagnosa ? <p id="master-diagnosa-nama-error" className="field-error">{diagnosaErrors.namaDiagnosa}</p> : null}
        {diagnosaErrors.status ? <p id="master-diagnosa-status-error" className="field-error">{diagnosaErrors.status}</p> : null}
        <FormFeedback errors={[]} helperText="Status dipakai untuk aktif/nonaktif diagnosa." />
        <div className="confirm-actions">
          <button className="btn-muted" disabled={upsertDiagnosaMutation.isPending} onClick={resetDiagnosaForm}>Reset</button>
          <button className="btn-primary" disabled={upsertDiagnosaMutation.isPending} onClick={saveDiagnosa}>
            {upsertDiagnosaMutation.isPending ? 'Menyimpan...' : selectedDiagnosa ? 'Update Diagnosa' : 'Simpan Diagnosa'}
          </button>
        </div>
      </FormModal>
    </section>
  )
}
