export function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="page-card">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div className="placeholder-grid">
        <article>
          <h2>DataTable Ready</h2>
          <p>Wrapper AG Grid sudah disiapkan untuk dipakai modul ini.</p>
        </article>
        <article>
          <h2>API Mode</h2>
          <p>Modul ini akan menggunakan real API sesuai strategi integrasi bertahap.</p>
        </article>
      </div>
    </section>
  )
}
