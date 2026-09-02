import { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export function RendimientoChart({ candidatos }) {
  const [filtroTiempo, setFiltroTiempo] = useState('ALL');

  const ahora = new Date();
  let fechaLimite = new Date(2000, 0, 1); // ALL
  if (filtroTiempo === '1M') fechaLimite = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
  else if (filtroTiempo === '6M') fechaLimite = new Date(ahora.getFullYear(), ahora.getMonth() - 6, ahora.getDate());
  else if (filtroTiempo === '1Y') fechaLimite = new Date(ahora.getFullYear() - 1, ahora.getMonth(), ahora.getDate());

  const candidatosFiltrados = (candidatos || []).filter(c => new Date(c.fechaRegistro) >= fechaLimite);

  const activityMap = {};
  candidatosFiltrados.forEach(c => {
    const d = new Date(c.fechaRegistro);
    let key = d.toLocaleString('default', { month: 'short' });
    if (filtroTiempo === '1M') {
       key = `${d.getDate()} ${key}`;
    }
    
    if (!activityMap[key]) activityMap[key] = { Registros: 0, Completados: 0, timestamp: d.getTime() };
    activityMap[key].Registros += 1;
    if (c.avance === 100 || (c.score && c.score.disponible)) activityMap[key].Completados += 1;
  });
  
  const areaData = Object.keys(activityMap)
    .sort((a, b) => activityMap[a].timestamp - activityMap[b].timestamp)
    .map(key => ({ date: key, Registros: activityMap[key].Registros, Completados: activityMap[key].Completados }));

  return (
    <article className="theme-card theme-panel theme-performance-panel">
      <div className="theme-panel-head">
        <div>
          <h2 className="theme-panel-title">Rendimiento</h2>
          <div className="theme-panel-sub">Vistas, clics y evolución mensual</div>
        </div>
        <div className="theme-chart-filter" role="group" aria-label="Filtrar por tiempo">
          {['ALL', '1M', '6M', '1Y'].map(f => (
            <button 
              key={f} 
              className={filtroTiempo === f ? 'active' : ''} 
              onClick={() => setFiltroTiempo(f)}
              aria-pressed={filtroTiempo === f}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', height: '340px' }}>
        {areaData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" aria-label="Gráfico de rendimiento en el tiempo">
            <ComposedChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F66B40"/>
                  <stop offset="100%" stopColor="#FEAA18"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="rgba(122,166,179,0.18)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#7AA6B3', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#7AA6B3', fontSize: 12}} />
              <RechartsTooltip />
              <Bar dataKey="Registros" fill="url(#barGrad)" radius={[8, 8, 8, 8]} barSize={22} />
              <Line type="monotone" dataKey="Completados" stroke="#00022C" strokeWidth={4} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--bluegray)' }}>
            No hay datos suficientes en este periodo
          </div>
        )}
      </div>
      <div className="theme-chart-legend" aria-hidden="true">
        <span><i className="theme-legend-dot" style={{background: 'linear-gradient(135deg,#F66B40,#FEAA18)'}}></i>Registros</span>
        <span><i className="theme-legend-dot" style={{background: '#00022C'}}></i>Completados</span>
      </div>
    </article>
  );
}
