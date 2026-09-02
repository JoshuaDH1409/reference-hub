import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const [mensaje, setMensaje] = useState('');

  const cargar = useCallback(() => {
    api.candidato(id).then(setC).catch((e) => {
      console.warn("API Error, using demo data:", e.message);
      setC(candidatoDemo);
    });
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;
  if (!c) return <p className="text-blue-gray font-bold">Cargando expediente...</p>;

  const score = c.score;

  // Semantic color for Risk Semaphore
  const semaforoColors = {
    verde: "bg-green-500 shadow-green-200",
    amarillo: "bg-orange-500 shadow-orange-200",
    rojo: "bg-red-500 shadow-red-200",
    gris: "bg-gray-400"
  };

  return (
    <div className="max-w-6xl">
      {/* Cabecera */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">{c.nombre}</h1>
          <div className="flex items-center gap-3 text-sm text-blue-gray">
            <span className="font-bold text-charcoal">{c.puesto}</span>
            <span>&bull;</span>
            <span>Registrado el {formatoFecha(c.fechaRegistro)}</span>
            <span>&bull;</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${c.estatus === 'Completado' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
              {c.estatus}
            </span>
          </div>
        </div>
        <button 
          onClick={async () => {
            try {
              const res = await fetch(`http://localhost:5155/api/candidatos/${c.id}/reporte/pdf`);
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
          }}
          className="bg-white border border-blue-gray-40 text-navy font-bold py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
          Descargar PDF
        </button>
      </div>

      {mensaje && <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg mb-6">{mensaje}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
        {/* Score Card */}
        <div className="bg-white border border-blue-gray-20 rounded-2xl p-6 shadow-sm flex flex-col">
          <span className="font-bold text-charcoal mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-gray">speed</span>
            Score General
          </span>
          {score.disponible ? (
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-navy leading-none">{score.general}</span>
              <span className="text-blue-gray text-lg font-bold">/ 10</span>
            </div>
          ) : (
            <p className="text-sm text-blue-gray">Sin suficientes respuestas.</p>
          )}

          {score.disponible && (
            <div className="space-y-3 mt-6">
              {score.competencias.map((comp) => (
                <div key={comp.nombre}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-charcoal">{comp.nombre}</span>
                    <span className="text-navy">{comp.valor}</span>
                  </div>
                  <div className="h-1.5 bg-blue-gray-20 rounded-full overflow-hidden">
                    <div className="h-full bg-navy rounded-full" style={{ width: `${comp.valor * 10}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Semáforo Card */}
        <div className="bg-white border border-blue-gray-20 rounded-2xl p-6 shadow-sm flex flex-col">
          <span className="font-bold text-charcoal mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-gray">traffic</span>
            Semáforo de Riesgo
          </span>
          <div className="flex flex-col items-center justify-center py-4 mt-2">
             <div className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center mb-4 ${score.disponible ? semaforoColors[score.semaforo] : semaforoColors.gris}`}>
                <div className="w-8 h-8 bg-white opacity-20 rounded-full blur-sm"></div>
             </div>
             <span className="text-xl font-bold text-navy">{score.disponible ? score.etiqueta : 'N/A'}</span>
             {score.disponible && (
               <p className="text-xs text-blue-gray mt-2 text-center">
                 {score.recontratarian} de {score.totalRespuestas} referentes lo recontratarían.
               </p>
             )}
          </div>
        </div>

        {/* Comentarios Resumidos */}
        <div className="bg-blue-gray-20 rounded-2xl p-6 border border-blue-gray-40 flex flex-col">
          <span className="font-bold text-charcoal mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-navy">forum</span>
            Comentarios Destacados
          </span>
          {score.disponible ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-navy uppercase tracking-wider">Fortalezas</span>
                <ul className="mt-1 space-y-1">
                  {c.fortalezas.map((f, i) => (
                    <li key={i} className="text-sm text-charcoal flex items-start gap-2">
                      <span className="material-symbols-outlined text-accent-orange text-sm mt-0.5">check_small</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-xs font-bold text-navy uppercase tracking-wider">Áreas de oportunidad</span>
                <ul className="mt-1 space-y-1">
                  {c.areasOportunidad.map((f, i) => (
                    <li key={i} className="text-sm text-charcoal flex items-start gap-2">
                      <span className="material-symbols-outlined text-blue-gray text-sm mt-0.5">info</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-charcoal opacity-70">El resumen se generará al recibir respuestas.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Tabla de Referencias */}
        <div className="lg:col-span-2 bg-white border border-blue-gray-20 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-charcoal mb-6">Referencias ({c.referencias.filter(r => r.estatus === 'Respondida').length}/{c.referencias.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blue-gray-40 text-blue-gray uppercase text-xs">
                  <th className="pb-3 font-bold">Referente</th>
                  <th className="pb-3 font-bold">Relación</th>
                  <th className="pb-3 font-bold">Estatus</th>
                  <th className="pb-3 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {c.referencias.map((r) => (
                  <tr key={r.id} className="border-b border-blue-gray-20 last:border-0">
                    <td className="py-4">
                      <div className="font-bold text-charcoal">{r.nombreReferente}</div>
                      <div className="text-xs text-blue-gray">{r.empresa}</div>
                    </td>
                    <td className="py-4 text-charcoal">{r.relacion}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${r.estatus === 'Respondida' ? 'bg-green-50 text-green-700' : 'bg-blue-gray-20 text-navy'}`}>
                        {r.estatus}
                      </span>
                    </td>
                    <td className="py-4">
                      {r.estatus !== 'Respondida' && (
                        <button className="text-accent-orange font-bold text-xs flex items-center gap-1 hover:underline">
                          <span className="material-symbols-outlined text-sm">notifications</span>
                          Recordatorio
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-blue-gray-20 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-charcoal mb-6">Línea de Tiempo</h2>
          <div className="relative border-l-2 border-blue-gray-40 ml-4 space-y-8 py-2">
            {c.timeline.map((e) => (
              <div key={e.id} className="relative pl-6">
                <div className="absolute -left-[17px] top-0 bg-white border-2 border-accent-orange rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent-orange text-sm">{e.icono || 'circle'}</span>
                </div>
                <div className="text-xs text-blue-gray mb-1">{formatoFecha(e.fecha)}</div>
                <div className="font-bold text-charcoal text-sm">{e.titulo}</div>
                {e.detalle && <div className="text-xs text-blue-gray mt-1">{e.detalle}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
