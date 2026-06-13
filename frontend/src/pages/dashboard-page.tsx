import { Activity, ArrowUpRight, CalendarClock, CreditCard, FileText, Stethoscope, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricGrid } from '../components/metric-grid'
import { PageHeader } from '../components/page-header'
import { SectionCard } from '../components/section-card'
import { StatCard } from '../components/stat-card'
import { usePendaftaran } from '../hooks/use-pendaftaran'
import { usePelayanan } from '../hooks/use-pelayanan'
import { usePembayaran } from '../hooks/use-kasir'
import type { PembayaranItem } from '../api/kasir'
import { useT, type TranslationKey } from '../i18n'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'PX'
}

function statusLabel(value: unknown) {
  const status = String(value ?? '')
  if (status === '1') return 'Menunggu'
  if (status === '2') return 'Dilayani'
  if (status === '3') return 'Selesai'
  if (status === '4') return 'Dibatalkan'
  return status || 'Aktif'
}

export function DashboardPage({ canFetch }: { canFetch: boolean }) {
  const { t } = useT()
  const msg = (key: TranslationKey, values: Record<string, string | number> = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), t(key))
  const pendaftaran = usePendaftaran({ page: 1, pageSize: 8 }, canFetch)
  const pelayanan = usePelayanan({ page: 1, pageSize: 8 }, canFetch)
  const kasir = usePembayaran({ page: 1, pageSize: 8 }, canFetch)

  const pendaftaranRows = pendaftaran.data?.data.items ?? []
  const pelayananRows = pelayanan.data?.data.items ?? []
  const kasirRows = kasir.data?.data.items ?? []
  const waitingCount = pelayananRows.filter((item) => String(item.status ?? '') === '1').length
  const dailyRevenue = kasirRows.reduce((sum: number, item: PembayaranItem) => sum + Number((item as Record<string, unknown>).grandtotal ?? (item as Record<string, unknown>).total ?? 0), 0)
  const completedCount = pelayananRows.filter((item) => String(item.status ?? '') === '3').length
  const activeRegistrations = pendaftaran.data?.data.total ?? 0
  const chartValues = [42, 58, 47, 74, 88, 63, 52]
  const monthlyChartValues = [46, 64, 52, 78, 70, 86]
  const monthlyChartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun']
  const departmentTraffic = [
    { label: 'Poli Umum', value: Math.max(34, Math.min(72, pelayananRows.length * 8 || 42)), tone: 'primary' },
    { label: 'Tindakan', value: Math.max(18, Math.min(52, completedCount * 12 || 28)), tone: 'secondary' },
    { label: 'Kasir', value: Math.max(12, Math.min(48, kasirRows.length * 8 || 24)), tone: 'tertiary' },
  ]

  return (
    <section className="page-card dashboard-page">
      <PageHeader
        title={t('dashboard.title')}
        description={t('nav.dashboard.desc')}
        eyebrow="MediFlow Admin"
        actions={<Link className="icon-btn btn-primary" to="/pendaftaran">{t('dashboard.newRegistration')}</Link>}
      />

      <MetricGrid>
        <StatCard icon={Users} label={t('dashboard.patientsToday')} value={activeRegistrations} trend="Live" footer={t('nav.pendaftaran.desc')} />
        <StatCard icon={CalendarClock} label={t('dashboard.waitingList')} value={waitingCount} tone="danger" trend="Priority" footer={t('nav.pelayanan.desc')} />
        <StatCard icon={Stethoscope} label={t('dashboard.activeService')} value={pelayanan.data?.data.total ?? 0} tone="secondary" trend="On duty" footer={t('nav.pelayanan.desc')} />
        <StatCard icon={CreditCard} label={t('dashboard.revenue')} value={formatCurrency(dailyRevenue)} tone="tertiary" trend={<TrendingUp size={14} />} footer={t('nav.kasir.desc')} />
      </MetricGrid>

      <div className="dashboard-bento-grid">
        <SectionCard title={t('dashboard.visits')} description={t('dashboard.chartDesc')} className="dashboard-chart-card">
          <div className="dashboard-chart-summary">
            <div>
              <span className="dashboard-kicker">{t('dashboard.totalVisits')}</span>
              <strong>{activeRegistrations + pelayananRows.length}</strong>
            </div>
            <span className="dashboard-trend"><TrendingUp size={15} /> +12%</span>
          </div>
          <div className="chart-bars" aria-label="Grafik kunjungan mingguan">
            {chartValues.map((height, index) => (
              <div className="chart-bar-item" key={index} title={`${height} kunjungan`}>
                <div className="chart-bar" style={{ height: `${height}%` }} />
                <span>{['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][index]}</span>
              </div>
            ))}
          </div>
          <div className="dashboard-monthly-chart" aria-label="Grafik kunjungan bulanan">
            <div className="dashboard-monthly-head">
              <div>
                <span className="dashboard-kicker">{t('dashboard.monthlyTrend')}</span>
                <strong>{t('dashboard.lastSixMonths')}</strong>
              </div>
              <span>{t('dashboard.stableRising')}</span>
            </div>
            <div className="monthly-bars">
              {monthlyChartValues.map((height, index) => (
                <div className="monthly-bar-item" key={monthlyChartLabels[index]} title={`${height}% kapasitas`}>
                  <span className="monthly-bar-track"><span className="monthly-bar-fill" style={{ height: `${height}%` }} /></span>
                  <small>{monthlyChartLabels[index]}</small>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title={t('dashboard.traffic')} description={t('dashboard.trafficDesc')} className="dashboard-traffic-card">
          <div className="traffic-list">
            {departmentTraffic.map((item) => (
              <div className="traffic-item" key={item.label}>
                <div className="traffic-row"><span>{item.label}</span><strong>{item.value}%</strong></div>
                <div className="traffic-track"><span className={`traffic-fill traffic-${item.tone}`} style={{ width: `${item.value}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="traffic-total">
            <strong>{pelayanan.data?.data.total ?? 0}</strong>
            <span>{t('dashboard.totalConsults')}</span>
          </div>
        </SectionCard>

        <SectionCard title={t('dashboard.activity')} description={t('dashboard.activityDesc')} className="dashboard-activity-card">
          <div className="activity-list">
            {pendaftaranRows.length > 0 ? pendaftaranRows.slice(0, 5).map((item) => (
              <div className="activity-item" key={item.idRegistrasi ?? item.id}>
                <span className="activity-dot"><FileText size={13} /></span>
                <div>
                  <strong>{item.idRegistrasi ?? '-'}</strong>
                  <p>{msg('dashboard.registeredForService', { name: String((item as Record<string, unknown>).namaPasien ?? item.idPasien ?? t('dashboard.col.patient')) })}</p>
                </div>
              </div>
            )) : <p className="empty-note">{t('grid.empty')}</p>}
          </div>
        </SectionCard>
      </div>

      <SectionCard title={t('dashboard.appointments')} description={t('dashboard.appointmentsDesc')} actions={<Link className="icon-btn" to="/pelayanan">{t('nav.pelayanan')} <ArrowUpRight size={14} /></Link>}>
        <div className="stitch-table-wrap">
          <table className="stitch-table dashboard-appointment-table">
            <thead>
              <tr>
                <th>{t('dashboard.col.registration')}</th>
                <th>{t('dashboard.col.patient')}</th>
                <th>{t('dashboard.col.doctor')}</th>
                <th>{t('dashboard.col.service')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {pelayananRows.slice(0, 6).map((item) => (
                <tr key={item.idRegistrasi ?? item.id}>
                  <td><strong className="text-primary">{item.idRegistrasi ?? '-'}</strong></td>
                  <td>
                    <div className="patient-cell">
                      <span>{initials(String((item as Record<string, unknown>).namaPasien ?? item.idPasien ?? '-'))}</span>
                      <div>
                        <strong>{String((item as Record<string, unknown>).namaPasien ?? item.idPasien ?? '-')}</strong>
                        <small>{String(item.idPasien ?? '-')}</small>
                      </div>
                    </div>
                  </td>
                  <td>{String((item as Record<string, unknown>).dokterNama ?? (item as Record<string, unknown>).namaDokter ?? '-')}</td>
                  <td><span className="dashboard-service-chip"><Activity size={13} /> {t('dashboard.service.consultation')}</span></td>
                  <td><span className="status-pill status-dilayani">{statusLabel(item.status)}</span></td>
                  <td><Link className="table-link" to={`/pelayanan?search=${encodeURIComponent(String(item.idRegistrasi ?? ''))}`}>{t('dashboard.detail')}</Link></td>
                </tr>
              ))}
              {pelayananRows.length === 0 ? <tr><td colSpan={6}>{t('dashboard.emptyServices')}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </section>
  )
}
