import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api, formatoFecha } from '../api.js';

const candidatoDemo = {
  id: "1",
  nombre: "Ana Martínez (Demo)",
  puesto: "Gerente de Finanzas",
  fechaRegistro: new Date(Date.now() - 86400000 * 3).toISOString(),
  estatus: "Completado",
  score: {
    disponible: true,
    general: 9.5,
    semaforo: "verde",
    etiqueta: "Riesgo Bajo",
    competencias: [
      { nombre: "Liderazgo", valor: 9 },
      { nombre: "Trabajo en equipo", valor: 10 },
      { nombre: "Resolución de problemas", valor: 9.5 }
    ],
    recontratarian: 3,
    totalRespuestas: 3
  },
  fortalezas: ["Excelente comunicación", "Alta capacidad analítica", "Gran liderazgo"],
  areasOportunidad: ["Delegar más tareas operativas"],
  referencias: [
    { id: 1, nombreReferente: "Carlos Slim", email: "carlos@empresa.com", relacion: "Jefe directo", empresa: "Grupo Carso", estatus: "Respondida", fechaRespuesta: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, nombreReferente: "Bill Gates", email: "bill@microsoft.com", relacion: "Cliente", empresa: "Microsoft", estatus: "Respondida", fechaRespuesta: new Date(Date.now() - 40000000).toISOString() },
    { id: 3, nombreReferente: "Elon Musk", email: "elon@tesla.com", relacion: "Colega", empresa: "Tesla", estatus: "Pendiente", recordatorios: 1, token: "demo-token" }
  ],
  timeline: [
    { id: 1, fecha: new Date(Date.now() - 86400000 * 3).toISOString(), titulo: "Candidato registrado", detalle: "Registrado por admin.", icono: "person_add" },
    { id: 2, fecha: new Date(Date.now() - 86400000 * 3).toISOString(), titulo: "Invitaciones enviadas", detalle: "Se enviaron 3 correos.", icono: "mail" },
    { id: 3, fecha: new Date(Date.now() - 86400000).toISOString(), titulo: "Respuesta recibida", detalle: "Carlos Slim respondió el cuestionario.", icono: "mark_email_read" }
  ]
};

export default function Expediente() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    api.candidato(id).then(setC).catch((e) => {
      console.warn("API Error, using demo data:", e.message);
      setC(candidatoDemo);
    });
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (error) return <div className="error-msg">{error}</div>;
  if (!c) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-gray-20 rounded-full mb-4"></div>
        <p className="bold-text text-blue-gray">Cargando expediente…</p>
      </div>
    </div>
  );

  const score = c.score;

  const downloadPdf = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/candidatos/${c.id}/reporte/pdf`);
      if (!res.ok) throw new Error('Error al generar PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_${c.nombre.replace(/ /g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Error al descargar el reporte.');
    }
  };

  return (
    <div className="theme-content p-0 lg:p-8">
      {/* Hero Banner en branding Navy */}
      <div className="bg-[var(--navy)] rounded-3xl p-8 mb-8 relative overflow-hidden shadow-[var(--shadow)]">
        {/* Background elements for depth */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-orange)] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--blue-gray)] opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="text-white">
            <div 
              className="text-[var(--blue-gray)] text-sm font-bold tracking-widest uppercase mb-4 cursor-pointer hover:text-white transition-colors inline-flex items-center gap-2" 
              onClick={() => window.history.back()}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Expediente del Candidato
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white tracking-tight">{c.nombre}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#EAEBE7]/80">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <span className="material-symbols-outlined text-base text-[var(--accent-orange)]">work</span>
                {c.puesto}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <span className="material-symbols-outlined text-base">calendar_today</span>
                {formatoFecha(c.fechaRegistro)}
              </span>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold border ${c.estatus === 'Completado' ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30' : 'bg-[#F66B40]/20 text-[#F66B40] border-[#F66B40]/30'}`}>
                {c.estatus}
              </span>
            </div>
          </div>
          
          <button 
            onClick={downloadPdf}
            className="bg-gradient-to-r from-[var(--accent-orange)] to-[#FEAA18] text-white border-0 py-3 px-6 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">download</span>
            Descargar Reporte PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda (Insights Principales) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Card Score */}
          <article className="theme-card p-8">
            <h2 className="text-[var(--navy)] text-lg font-bold uppercase tracking-wider mb-8 flex items-center gap-2">
               <span className="material-symbols-outlined text-[var(--accent-orange)]">insights</span>
               Score de Evaluación
            </h2>
            
            {score.disponible ? (
              <>
                <div className="flex items-end justify-center gap-2 mb-10 pb-10 border-b border-[var(--border)]">
                  <span className="text-7xl font-bold text-[var(--navy)] leading-none tracking-tighter">{score.general}</span>
                  <span className="text-2xl font-bold text-[var(--blue-gray)] mb-2">/ 10</span>
                </div>
                
                <div className="space-y-6">
                  {score.competencias.map((comp) => (
                    <div key={comp.nombre}>
                      <div className="flex justify-between text-sm font-bold text-[var(--charcoal)] mb-2">
                        <span>{comp.nombre}</span>
                        <span>{comp.valor}</span>
                      </div>
                      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--navy)] rounded-full" style={{ width: `${comp.valor * 10}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-[var(--blue-gray)] text-sm py-12 font-medium bg-[var(--off-white)] rounded-2xl border border-[var(--border)]">
                Aún no hay suficientes datos para calcular el score.
              </div>
            )}
          </article>

          {/* Card Semáforo */}
          <article className="theme-card p-8">
            <h2 className="text-[var(--navy)] text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-[var(--accent-orange)]">security</span>
               Nivel de Riesgo
            </h2>
            
            <div className="flex flex-col items-center justify-center p-6 bg-[var(--off-white)] border border-[var(--border)] rounded-3xl">
               <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative">
                  <div className={`absolute inset-0 rounded-full opacity-20 blur-md ${score.semaforo === 'verde' ? 'bg-[#10B981]' : score.semaforo === 'rojo' ? 'bg-[#EF4444]' : score.semaforo === 'amarillo' ? 'bg-[#F59E0B]' : 'bg-gray-400'}`}></div>
                  <div className={`w-14 h-14 rounded-full border-4 border-white shadow-lg z-10 ${score.semaforo === 'verde' ? 'bg-[#10B981]' : score.semaforo === 'rojo' ? 'bg-[#EF4444]' : score.semaforo === 'amarillo' ? 'bg-[#F59E0B]' : 'bg-gray-400'}`}></div>
               </div>
               
               <h3 className="text-xl font-bold text-[var(--navy)] mb-1 text-center">
                 {score.disponible ? score.etiqueta : 'Indeterminado'}
               </h3>
               
               {score.disponible && (
                 <p className="text-[var(--blue-gray)] text-sm text-center font-medium">
                   <strong className="text-[var(--charcoal)]">{score.recontratarian} de {score.totalRespuestas}</strong> lo recontratarían
                 </p>
               )}
            </div>
          </article>
        </div>

        {/* Columna Derecha (Datos y Detalles) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Card Comentarios */}
          <article className="theme-card p-8">
            <h2 className="text-[var(--navy)] text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-[var(--accent-orange)]">format_quote</span>
               Resumen de Comentarios
            </h2>
            
            {score.disponible ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#EAEBE7]/50 rounded-2xl p-6 border border-[var(--border)]">
                  <div className="flex items-center gap-2 text-[var(--navy)] font-bold mb-4 uppercase text-xs tracking-widest">
                    <span className="material-symbols-outlined text-[16px] text-green-600">thumb_up</span>
                    Fortalezas
                  </div>
                  <ul className="space-y-3">
                    {c.fortalezas.length > 0 ? c.fortalezas.map((f, i) => (
                      <li key={i} className="text-[var(--charcoal)] text-sm flex gap-2">
                        <span className="text-green-600 font-bold mt-[-1px]">•</span> {f}
                      </li>
                    )) : <li className="text-[var(--blue-gray)] text-sm italic">Sin datos.</li>}
                  </ul>
                </div>
                
                <div className="bg-[#EAEBE7]/50 rounded-2xl p-6 border border-[var(--border)]">
                  <div className="flex items-center gap-2 text-[var(--navy)] font-bold mb-4 uppercase text-xs tracking-widest">
                    <span className="material-symbols-outlined text-[16px] text-orange-600">psychology</span>
                    Áreas de Oportunidad
                  </div>
                  <ul className="space-y-3">
                    {c.areasOportunidad.length > 0 ? c.areasOportunidad.map((f, i) => (
                      <li key={i} className="text-[var(--charcoal)] text-sm flex gap-2">
                        <span className="text-orange-600 font-bold mt-[-1px]">•</span> {f}
                      </li>
                    )) : <li className="text-[var(--blue-gray)] text-sm italic">Sin datos.</li>}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-[var(--blue-gray)] text-sm py-8 font-medium">
                Esperando respuestas de los referentes para consolidar los comentarios.
              </div>
            )}
          </article>

          {/* Estado de Referencias */}
          <article className="theme-card p-8">
            <div className="flex justify-between items-end mb-6 border-b border-[var(--border)] pb-4">
               <h2 className="text-[var(--navy)] text-lg font-bold uppercase tracking-wider flex items-center gap-2 m-0">
                 <span className="material-symbols-outlined text-[var(--accent-orange)]">group</span>
                 Estado de Referencias
               </h2>
               <div className="text-[var(--navy)] font-bold text-sm bg-[var(--off-white)] px-4 py-1.5 rounded-full border border-[var(--border)]">
                  {c.referencias.filter(r => r.estatus === 'Respondida').length} / {c.referencias.length}
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[var(--blue-gray)] text-[11px] uppercase tracking-widest border-b border-[var(--border)]">
                    <th className="pb-3 px-2 font-bold">Referente</th>
                    <th className="pb-3 px-2 font-bold">Relación</th>
                    <th className="pb-3 px-2 font-bold">Estatus</th>
                    <th className="pb-3 px-2 font-bold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {c.referencias.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--off-white)] transition-colors">
                      <td className="py-4 px-2">
                        <div className="font-bold text-[var(--navy)]">{r.nombreReferente}</div>
                        <div className="text-xs text-[var(--blue-gray)] mt-0.5">{r.empresa}</div>
                      </td>
                      <td className="py-4 px-2 text-sm text-[var(--charcoal)]">{r.relacion}</td>
                      <td className="py-4 px-2">
                        {r.estatus === 'Respondida' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Respondida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F66B40] bg-[#F66B40]/10 px-3 py-1 rounded-full border border-[#F66B40]/20">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right">
                        {r.estatus !== 'Respondida' ? (
                          <button className="text-[var(--accent-orange)] text-xs font-bold bg-white border border-[var(--border)] px-3 py-1.5 rounded-lg hover:border-[var(--accent-orange)] transition-colors inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">notifications</span>
                            Recordar
                          </button>
                        ) : (
                          <span className="text-[var(--blue-gray)] text-xs font-medium">Completada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {c.referencias.length === 0 && (
                     <tr><td colSpan="4" className="text-center py-8 text-sm text-[var(--blue-gray)]">No hay referencias.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          {/* Timeline Corporativo */}
          <article className="theme-card p-8">
            <h2 className="text-[var(--navy)] text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-[var(--accent-orange)]">history</span>
               Actividad Reciente
            </h2>
            
            <div className="theme-activity-list mt-2">
              {c.timeline.map((e, index) => (
                <div key={e.id} className="theme-activity-item border-0 bg-transparent px-0 py-2 relative flex gap-4 items-start">
                  {/* Connecting Line */}
                  {index !== c.timeline.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-[-10px] w-[2px] bg-[var(--border)]"></div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${index === 0 ? 'bg-[var(--navy)] text-white shadow-lg' : 'bg-[var(--off-white)] border-2 border-[var(--border)] text-[var(--charcoal)]'}`}>
                    <span className="material-symbols-outlined text-[18px]">{e.icono || 'radio_button_checked'}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="font-bold text-[var(--navy)] text-sm mb-0.5">{e.titulo}</div>
                    <div className="text-[var(--charcoal)] text-sm mb-1 opacity-90">{e.detalle}</div>
                    <div className="text-xs text-[var(--blue-gray)] font-medium">{formatoFecha(e.fecha)}</div>
                  </div>
                </div>
              ))}
              {c.timeline.length === 0 && (
                <p className="text-sm text-[var(--blue-gray)] text-center py-4">Sin actividad.</p>
              )}
            </div>
          </article>

        </div>
      </div>
    </div>
  );
}

