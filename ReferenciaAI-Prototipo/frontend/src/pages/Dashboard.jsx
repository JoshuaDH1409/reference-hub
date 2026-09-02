import { useNavigate } from 'react-router-dom';
import { RiesgoChart } from '../components/dashboard/RiesgoChart';
import { RendimientoChart } from '../components/dashboard/RendimientoChart';
import { MapChart } from '../components/dashboard/MapChart';
import { useDashboardData } from '../hooks/useQueries';

function SemaforoRiesgo({ score }) {
  if (!score || !score.disponible) {
    return (
      <div className="semaforo-container">
        <div className="semaforo-luz gris"></div>
        <span className="score-badge">N/A</span>
      </div>
    );
  }

  let colorClase = 'gris';
  if (score.semaforo === 'rojo') colorClase = 'alto';
  else if (score.semaforo === 'amarillo' || score.semaforo === 'naranja') colorClase = 'medio';
  else if (score.semaforo === 'verde') colorClase = 'bajo';

  return (
    <div className="semaforo-container">
      <div className={`semaforo-luz ${colorClase}`}></div>
      <span className="score-badge">{score.general.toFixed(1)}/10</span>
    </div>
  );
}

export default function Dashboard() {
  const navegar = useNavigate();
  const { data: datos, isLoading, isError, error } = useDashboardData();

  if (isError) return <div className="error-msg">No se pudo conectar con la API: {error?.message}. Verifica que el backend esté corriendo.</div>;
  if (isLoading || !datos) return (
    <div className="flex justify-center items-center h-64">
       <div className="animate-pulse flex flex-col items-center">
         <div className="w-12 h-12 bg-blue-gray-20 rounded-full mb-4"></div>
         <p className="bold-text" style={{ color: 'var(--blue-gray)' }}>Cargando dashboard…</p>
       </div>
    </div>
  );

  const candidatosValidos = datos.candidatos.filter(c => c.score && c.score.disponible);
  const avgScore = candidatosValidos.length > 0 
    ? (candidatosValidos.reduce((acc, c) => acc + c.score.general, 0) / candidatosValidos.length).toFixed(1)
    : 0;

  return (
    <section className="theme-content">
      <div className="theme-page-head">
        <div>
          <div className="theme-eyebrow">Dashboards › Analytics</div>
          <h1>Analítica de referencias y talento</h1>
          <div className="theme-subtitle">Panel analítico actualizado basado en el diseño premium con la identidad visual de EstrategIA Tecnológica. Se reflejan métricas y KPIs reales.</div>
        </div>
        <button className="theme-cta" onClick={() => navegar('/reportes')}>
          <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></svg>
          Generar reporte general
        </button>
      </div>

      <section className="theme-stats-grid">
        <article className="theme-card theme-stat-card">
          <div className="theme-stat-icon orange">
            <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div className="theme-stat-meta">
            <div className="theme-stat-label">Candidatos Registrados</div>
            <div className="theme-stat-value">{datos.totalCandidatos}</div>
            <div className="theme-stat-note">Total histórico</div>
          </div>
        </article>

        <article className="theme-card theme-stat-card">
          <div className="theme-stat-icon blue">
            <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>
          </div>
          <div className="theme-stat-meta">
            <div className="theme-stat-label">Procesos en Curso</div>
            <div className="theme-stat-value">{datos.procesosEnCurso}</div>
            <div className="theme-stat-note">Activos actualmente</div>
          </div>
        </article>

        <article className="theme-card theme-stat-card">
          <div className="theme-stat-icon gold">
            <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17 9 11l4 4 8-8"/></svg>
          </div>
          <div className="theme-stat-meta">
            <div className="theme-stat-label">Procesos Concluidos</div>
            <div className="theme-stat-value">{datos.procesosConcluidos}</div>
            <div className="theme-stat-note">Con score disponible</div>
          </div>
        </article>

        <article className="theme-card theme-stat-card">
          <div className="theme-stat-icon navy">
            <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
          </div>
          <div className="theme-stat-meta">
            <div className="theme-stat-label">Referencias Pendientes</div>
            <div className="theme-stat-value">{datos.referenciasPendientes}</div>
            <div className="theme-stat-note">Faltan por responder</div>
          </div>
        </article>
      </section>

      <section className="theme-analytics-grid">
        <article className="theme-card theme-panel">
          <div className="theme-panel-head">
            <div>
              <h2 className="theme-panel-title">Métricas rápidas</h2>
              <div className="theme-panel-sub">Resumen operativo</div>
            </div>
          </div>
          <div className="theme-mini-stat-list">
            <div className="theme-mini-stat">
              <div className="theme-stat-icon orange" style={{width:'46px',height:'46px',borderRadius:'14px'}}>
                <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
              </div>
              <div><div className="theme-stat-label">Promedio General</div><strong>{avgScore} / 10</strong></div>
            </div>
            <div className="theme-mini-stat">
              <div className="theme-stat-icon blue" style={{width:'46px',height:'46px',borderRadius:'14px'}}>
                <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>
              </div>
              <div><div className="theme-stat-label">Referencias Enviadas</div><strong>{datos.referenciasEnviadas}</strong></div>
            </div>
            <div className="theme-mini-stat">
              <div className="theme-stat-icon gold" style={{width:'46px',height:'46px',borderRadius:'14px'}}>
                <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16"/><path d="M12 4v16"/></svg>
              </div>
              <div><div className="theme-stat-label">Tiempo Promedio</div><strong>{datos.tiempoPromedioDias} días</strong></div>
            </div>
            <div className="theme-mini-stat">
              <div className="theme-stat-icon navy" style={{width:'46px',height:'46px',borderRadius:'14px'}}>
                <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m7 13 4-4 3 3 5-5"/></svg>
              </div>
              <div><div className="theme-stat-label">Candidatos Registrados</div><strong>{datos.totalCandidatos}</strong></div>
            </div>
          </div>
        </article>

        {/* Componentes Modularizados */}
        <RiesgoChart candidatosValidos={candidatosValidos} />
        <RendimientoChart candidatos={datos.candidatos} />
      </section>

      <section className="theme-bottom-grid">
        <article className="theme-card theme-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-orange opacity-[0.04] rounded-full blur-[80px] pointer-events-none"></div>
          <div className="theme-panel-head relative z-10">
            <div>
              <h2 className="theme-panel-title flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-orange">public</span>
                Distribución Geográfica
              </h2>
              <div className="theme-panel-sub">Origen de las sesiones registradas</div>
            </div>
            <button onClick={() => navegar('/reportes')} className="flex items-center gap-2 text-sm font-semibold text-navy bg-white border border-gray-200 px-4 py-2 rounded-xl hover:border-accent-orange hover:text-accent-orange transition-all duration-300 shadow-sm">
               Ver reporte
               <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mt-6">
            <div className="bg-navy rounded-3xl relative overflow-hidden min-h-[350px] flex items-center justify-center shadow-lg">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#7AA6B3 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
               <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/80 pointer-events-none"></div>
               <MapChart />
            </div>
            <div className="flex flex-col justify-center gap-7 px-2">
              <div className="group cursor-pointer">
                <div className="flex justify-between items-end mb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm">🇲🇽</span>
                    <div>
                      <h4 className="text-navy font-bold text-base leading-tight group-hover:text-accent-orange transition-colors">México</h4>
                      <span className="text-[11px] text-blue-gray font-bold tracking-widest uppercase">1.2M Sesiones</span>
                    </div>
                  </div>
                  <span className="text-navy font-extrabold text-xl">92%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-accent-orange to-[#FEAA18] h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div className="group cursor-pointer">
                <div className="flex justify-between items-end mb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm">🇺🇸</span>
                    <div>
                      <h4 className="text-navy font-bold text-base leading-tight group-hover:text-blue-500 transition-colors">Estados Unidos</h4>
                      <span className="text-[11px] text-blue-gray font-bold tracking-widest uppercase">65k Sesiones</span>
                    </div>
                  </div>
                  <span className="text-navy font-extrabold text-xl">5%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                  <div className="bg-blue-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '5%' }}></div>
                </div>
              </div>

              <div className="group cursor-pointer">
                <div className="flex justify-between items-end mb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm">🌎</span>
                    <div>
                      <h4 className="text-navy font-bold text-base leading-tight group-hover:text-emerald-500 transition-colors">Sudamérica</h4>
                      <span className="text-[11px] text-blue-gray font-bold tracking-widest uppercase">39k Sesiones</span>
                    </div>
                  </div>
                  <span className="text-navy font-extrabold text-xl">3%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '3%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="theme-card theme-panel">
          <div className="theme-panel-head">
            <div>
              <h2 className="theme-panel-title">Expedientes Recientes</h2>
              <div className="theme-panel-sub">Últimos candidatos registrados</div>
            </div>
          </div>
          <div className="theme-activity-list">
            {datos.candidatos.slice(0, 4).map((c, i) => (
              <div key={c.id} className="theme-activity-item" style={{ cursor: 'pointer' }} onClick={() => navegar(`/candidatos/${c.id}`)}>
                <div className="theme-activity-mark" style={i % 2 === 0 ? { background:'rgba(122,166,179,0.18)', color:'var(--bluegray)' } : {}}>
                  <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
                </div>
                <div>
                  <strong>{c.nombre}</strong>
                  <span>{c.puesto} - {c.avance}% Completado ({c.respondidas}/{c.totalReferencias} ref.)</span>
                  <div style={{ marginTop: '4px' }}>
                    <SemaforoRiesgo score={c.score} />
                  </div>
                </div>
              </div>
            ))}
            {datos.candidatos.length === 0 && (
              <p style={{ color: 'var(--muted)' }}>No hay candidatos recientes.</p>
            )}
          </div>
        </article>
      </section>
    </section>
  );
}
