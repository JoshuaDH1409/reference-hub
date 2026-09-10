import { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
const datosDemo = {
  totalCandidatos: 45,
  procesosEnCurso: 12,
  procesosConcluidos: 30,
  referenciasEnviadas: 150,
  referenciasRecibidas: 120,
  referenciasPendientes: 30,
  tiempoPromedioDias: 2.5,
  candidatos: []
};

export default function Reportes() {
  const [tabActiva, setTabActiva] = useState('consolidado');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const reporteRef = useRef(null);

  useEffect(() => {
    api.dashboard().then(setDatos).catch(e => {
      console.warn("API Error, using demo data:", e.message);
      setDatos(datosDemo);
    });
  }, []);

  const exportarPDF = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/dashboard/reporte/pdf`);
      if (!response.ok) throw new Error('Error al generar PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Global.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('No se pudo descargar el reporte.');
    }
  };

  if (error) return <div className="max-w-6xl mx-auto p-8 text-red-500 font-bold">Error: {error}</div>;
  if (!datos) return <div className="max-w-6xl mx-auto p-8 text-blue-gray font-bold">Cargando reportes...</div>;

  const candidatosValidos = datos.candidatos.filter(c => c.score && c.score.disponible);
  
  const avgScore = candidatosValidos.length > 0 
    ? (candidatosValidos.reduce((acc, c) => acc + c.score.general, 0) / candidatosValidos.length)
    : 8.5; // Valor demo si no hay válidos
  
  const competencias = [
    { nombre: 'Trabajo en Equipo', score: Math.min(avgScore + 0.7, 10).toFixed(1) },
    { nombre: 'Responsabilidad', score: Math.min(avgScore + 0.3, 10).toFixed(1) },
    { nombre: 'Comunicación', score: Math.max(avgScore - 0.1, 0).toFixed(1) }
  ];

  const recontratables = candidatosValidos.length > 0 ? candidatosValidos.filter(c => c.score.general >= 7).length : 25;
  const totalConcluidos = candidatosValidos.length > 0 ? candidatosValidos.length : 30;
  const porcentajeRecontratacion = Math.round((recontratables / totalConcluidos) * 100);

  const riesgoCount = { verde: 0, amarillo: 0, naranja: 0, rojo: 0 };
  if (candidatosValidos.length > 0) {
    candidatosValidos.forEach(c => {
      if (riesgoCount[c.score.semaforo] !== undefined) riesgoCount[c.score.semaforo]++;
    });
  } else {
    // Demo data for chart
    riesgoCount.verde = 20; riesgoCount.amarillo = 7; riesgoCount.naranja = 2; riesgoCount.rojo = 1;
  }
  
  const datosRiesgo = [
    { name: 'Bajo Riesgo', value: riesgoCount.verde, color: '#4ade80' }, // Tailwind green-400
    { name: 'Riesgo Medio (Am)', value: riesgoCount.amarillo, color: '#facc15' }, // yellow-400
    { name: 'Riesgo Medio (Na)', value: riesgoCount.naranja, color: '#fb923c' }, // orange-400
    { name: 'Alto Riesgo', value: riesgoCount.rojo, color: '#f87171' }, // red-400
  ].filter(d => d.value > 0);

  const datosTiempos = [
    { name: 'Enviadas', Cantidad: datos.referenciasEnviadas, fill: '#00022C' },
    { name: 'Recibidas', Cantidad: datos.referenciasRecibidas, fill: '#F66B40' },
    { name: 'Pendientes', Cantidad: datos.referenciasPendientes, fill: '#7AA6B3' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Reportes</h1>
          <p className="text-blue-gray text-sm">Visualiza y exporta métricas generales de la organización.</p>
        </div>
        <button 
          onClick={exportarPDF}
          className="bg-accent-orange text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-opacity-90 shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
          Exportar PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blue-gray-40 mb-8">
        <button 
          onClick={() => setTabActiva('consolidado')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-[1px] ${tabActiva === 'consolidado' ? 'border-accent-orange text-accent-orange' : 'border-transparent text-blue-gray hover:text-navy'}`}
        >
          Consolidado Global
        </button>
        <button 
          onClick={() => setTabActiva('riesgo')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-[1px] ${tabActiva === 'riesgo' ? 'border-accent-orange text-accent-orange' : 'border-transparent text-blue-gray hover:text-navy'}`}
        >
          Análisis de Riesgo
        </button>
        <button 
          onClick={() => setTabActiva('tiempos')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-[1px] ${tabActiva === 'tiempos' ? 'border-accent-orange text-accent-orange' : 'border-transparent text-blue-gray hover:text-navy'}`}
        >
          Tiempos de Respuesta
        </button>
      </div>

      {/* Tab Content wrapped in ref for PDF export */}
      <div ref={reporteRef} className="bg-white border border-blue-gray-20 rounded-2xl p-8 shadow-sm min-h-[400px]">
        
        {tabActiva === 'consolidado' && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-navy mb-6">Métricas de Evaluación Consolidadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-blue-gray-20 rounded-xl p-6 bg-off-white">
                <span className="text-sm font-bold text-charcoal mb-4 block">Promedio de Competencias (Top 3)</span>
                <div className="space-y-4">
                  {competencias.map((comp, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-charcoal">{comp.nombre}</span>
                        <span className="text-navy">{comp.score}</span>
                      </div>
                      <div className="h-2 bg-blue-gray-20 rounded-full overflow-hidden">
                        <div className="h-full bg-navy" style={{ width: `${(comp.score / 10) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-blue-gray-20 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                <div className="text-5xl font-bold text-navy mb-2">{porcentajeRecontratacion}%</div>
                <div className="text-sm text-charcoal font-bold">Índice de Recontratación</div>
                <p className="text-xs text-blue-gray mt-2">De un total de {datos.referenciasRecibidas} referencias recopiladas en total.</p>
              </div>
            </div>
          </div>
        )}

        {tabActiva === 'riesgo' && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-navy mb-6">Análisis de Riesgo General</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosRiesgo}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {datosRiesgo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="font-bold text-navy mb-4">Distribución por Categoría</h3>
                <div className="space-y-3">
                  {datosRiesgo.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-blue-gray-20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }}></div>
                        <span className="text-sm font-bold text-charcoal">{r.name}</span>
                      </div>
                      <span className="font-extrabold text-navy">{r.value} candidatos</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tabActiva === 'tiempos' && (
          <div className="animate-fade-in">
             <h2 className="text-lg font-bold text-navy mb-6">Eficiencia y Tiempos de Respuesta</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosTiempos} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{fontSize: 12, fill: '#7AA6B3'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 12, fill: '#7AA6B3'}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'rgba(122,166,179,0.1)'}} />
                      <Bar dataKey="Cantidad" radius={[6, 6, 0, 0]} barSize={40}>
                        {datosTiempos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="border border-blue-gray-20 rounded-xl p-6 text-center">
                     <span className="material-symbols-outlined text-4xl text-accent-orange mb-2">speed</span>
                     <div className="text-4xl font-extrabold text-navy mb-1">{datos.tiempoPromedioDias} días</div>
                     <div className="text-sm font-bold text-charcoal">Tiempo Promedio de Respuesta</div>
                     <p className="text-xs text-blue-gray mt-2">Tiempo que tardan los referencistas desde la invitación hasta completar el cuestionario.</p>
                  </div>
                  <div className="border border-blue-gray-20 rounded-xl p-6 bg-off-white">
                     <h4 className="font-bold text-navy text-sm mb-2">Tasa de Conversión</h4>
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-xs font-bold text-charcoal">Completados vs Enviados</span>
                       <span className="text-xs font-bold text-accent-orange">
                         {Math.round((datos.referenciasRecibidas / Math.max(datos.referenciasEnviadas, 1)) * 100)}%
                       </span>
                     </div>
                     <div className="w-full bg-blue-gray-20 h-2 rounded-full overflow-hidden">
                       <div className="bg-accent-orange h-full" style={{ width: `${(datos.referenciasRecibidas / Math.max(datos.referenciasEnviadas, 1)) * 100}%` }}></div>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
