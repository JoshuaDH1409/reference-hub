import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export function RiesgoChart({ candidatosValidos }) {
  const riesgoCount = { verde: 0, amarillo: 0, naranja: 0, rojo: 0 };
  
  candidatosValidos.forEach(c => {
    if (riesgoCount[c.score.semaforo] !== undefined) {
      riesgoCount[c.score.semaforo]++;
    }
  });
  
  const totalRiesgos = riesgoCount.verde + riesgoCount.amarillo + riesgoCount.naranja + riesgoCount.rojo;
  const porcentajeVerde = totalRiesgos > 0 ? ((riesgoCount.verde / totalRiesgos) * 100).toFixed(1) : 0;

  const datosRiesgo = [
    { name: 'Bajo Riesgo', value: riesgoCount.verde, color: '#4ade80' },
    { name: 'Riesgo Medio (Amarillo)', value: riesgoCount.amarillo, color: '#facc15' },
    { name: 'Riesgo Medio (Naranja)', value: riesgoCount.naranja, color: '#fb923c' },
    { name: 'Alto Riesgo', value: riesgoCount.rojo, color: '#f87171' },
  ].filter(d => d.value > 0);
  
  if (datosRiesgo.length === 0) {
    datosRiesgo.push({ name: 'Sin Datos', value: 1, color: '#e2e8f0' });
  }

  return (
    <article className="theme-card theme-panel">
      <div className="theme-panel-head">
        <div>
          <h2 className="theme-panel-title">Distribución de Riesgo</h2>
          <div className="theme-panel-sub">Proporción de candidatos por recomendación</div>
        </div>
      </div>
      <div className="theme-donut-wrap relative pb-2">
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%" aria-label="Gráfico de distribución de riesgo de candidatos">
            <PieChart>
              <Pie
                data={datosRiesgo}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {datosRiesgo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
                itemStyle={{ fontWeight: 'bold' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Center label */}
        <div className="absolute top-[110px] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none" aria-hidden="true">
            <strong className="text-3xl font-extrabold text-navy">{porcentajeVerde}%</strong>
            <span className="text-xs text-blue-gray font-semibold">Recomendable</span>
        </div>
        
        {/* Bottom tiles */}
        <div className="theme-split-values mt-2 w-full px-2" aria-live="polite">
          <div className="tile flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex" aria-hidden="true">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-orange-400 -ml-1"></div>
              </div>
              <span className="text-xs font-semibold text-blue-gray uppercase tracking-widest">Medio</span>
            </div>
            <strong className="text-2xl text-navy leading-none" aria-label={`Candidatos con riesgo medio: ${riesgoCount.amarillo + riesgoCount.naranja}`}>{riesgoCount.amarillo + riesgoCount.naranja}</strong>
          </div>
          <div className="tile flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true"></div>
              <span className="text-xs font-semibold text-blue-gray uppercase tracking-widest">Alto</span>
            </div>
            <strong className="text-2xl text-navy leading-none" aria-label={`Candidatos con riesgo alto: ${riesgoCount.rojo}`}>{riesgoCount.rojo}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}
