import { useState } from 'react';

export default function Agente() {
  const [tabActiva, setTabActiva] = useState('recordatorios');
  const [frecuencia, setFrecuencia] = useState(48); // hours
  const [maxIntentos, setMaxIntentos] = useState(3);
  const [tono, setTono] = useState('formal');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-accent-orange text-4xl">robot_2</span>
            Agente IA de Reclutamiento
          </h1>
          <p className="text-blue-gray text-sm">
            Configura y supervisa cómo el agente interactúa con tus candidatos y referentes en segundo plano.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-bold text-green-600">Agente Activo</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
            <button 
              onClick={() => setTabActiva('recordatorios')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${tabActiva === 'recordatorios' ? 'bg-navy text-off-white shadow-md' : 'text-charcoal hover:bg-white border border-transparent hover:border-blue-gray-20'}`}
            >
              <span className="material-symbols-outlined text-lg">alarm</span>
              Recordatorios
            </button>
            <button 
              onClick={() => setTabActiva('identidad')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${tabActiva === 'identidad' ? 'bg-navy text-off-white shadow-md' : 'text-charcoal hover:bg-white border border-transparent hover:border-blue-gray-20'}`}
            >
              <span className="material-symbols-outlined text-lg">face</span>
              Identidad
            </button>
            <button 
              onClick={() => setTabActiva('analisis')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${tabActiva === 'analisis' ? 'bg-navy text-off-white shadow-md' : 'text-charcoal hover:bg-white border border-transparent hover:border-blue-gray-20'}`}
            >
              <span className="material-symbols-outlined text-lg">analytics</span>
              Análisis y Alertas
            </button>
            <button 
              onClick={() => setTabActiva('actividad')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${tabActiva === 'actividad' ? 'bg-navy text-off-white shadow-md' : 'text-charcoal hover:bg-white border border-transparent hover:border-blue-gray-20'}`}
            >
              <span className="material-symbols-outlined text-lg">history</span>
              Registro de Actividad
            </button>
          </nav>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 bg-white border border-blue-gray-20 rounded-3xl p-8 shadow-sm min-h-[500px]">
          
          {/* TAB: RECORDATORIOS */}
          {tabActiva === 'recordatorios' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-navy mb-2">Automatización de Recordatorios</h2>
              <p className="text-blue-gray text-sm mb-8">
                Configura cómo y cuándo el agente debe insistir a los referentes para que completen sus evaluaciones.
              </p>
              
              <div className="bg-off-white border border-blue-gray-20 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-charcoal flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-orange">hourglass_empty</span>
                    Frecuencia de Seguimiento
                  </span>
                  <span className="bg-navy text-white font-bold px-3 py-1 rounded-lg">Cada {frecuencia} hrs</span>
                </div>
                
                <input 
                  type="range" 
                  min="24" 
                  max="120" 
                  step="24"
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(e.target.value)}
                  className="w-full h-2 bg-blue-gray-40 rounded-lg appearance-none cursor-pointer accent-accent-orange"
                />
                
                <div className="flex justify-between text-xs font-bold text-blue-gray mt-3">
                  <span>24 hrs</span>
                  <span>48 hrs</span>
                  <span>72 hrs</span>
                  <span>120 hrs</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-off-white border border-blue-gray-20 rounded-xl p-6">
                  <div className="font-bold text-charcoal mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-orange">repeat</span>
                    Intentos Máximos
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-gray">Detener tras X correos</span>
                    <select 
                      value={maxIntentos}
                      onChange={(e) => setMaxIntentos(e.target.value)}
                      className="bg-white border border-blue-gray-40 text-charcoal text-sm font-bold rounded-lg focus:ring-accent-orange focus:border-accent-orange block p-2.5"
                    >
                      <option value="1">1 intento</option>
                      <option value="2">2 intentos</option>
                      <option value="3">3 intentos</option>
                      <option value="5">5 intentos</option>
                    </select>
                  </div>
                </div>

                <div className="bg-off-white border border-blue-gray-20 rounded-xl p-6">
                  <div className="font-bold text-charcoal mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-orange">event</span>
                    Días Hábiles
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-gray">Enviar solo de Lun - Vie</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-blue-gray-40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-orange"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: IDENTIDAD */}
          {tabActiva === 'identidad' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-navy mb-2">Identidad del Agente</h2>
              <p className="text-blue-gray text-sm mb-8">Personaliza cómo se presenta el agente al comunicarse.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-charcoal mb-2">Nombre del Agente</label>
                  <input 
                    type="text" 
                    defaultValue="EstrategIA Bot"
                    className="w-full bg-white border border-blue-gray-40 text-charcoal text-sm rounded-lg focus:ring-accent-orange focus:border-accent-orange block p-3"
                    placeholder="Ej. Asistente de Reclutamiento"
                  />
                  <p className="text-xs text-blue-gray mt-2">Este nombre aparecerá como el remitente en los correos.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-charcoal mb-4">Tono de Voz</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setTono('formal')}
                      className={`border p-4 rounded-xl text-left transition-all ${tono === 'formal' ? 'border-accent-orange bg-orange-50' : 'border-blue-gray-40 hover:border-navy'}`}
                    >
                      <div className="font-bold text-navy mb-1">Formal y Profesional</div>
                      <div className="text-xs text-blue-gray">"Estimado referente, le solicitamos amablemente..."</div>
                    </button>
                    <button 
                      onClick={() => setTono('amigable')}
                      className={`border p-4 rounded-xl text-left transition-all ${tono === 'amigable' ? 'border-accent-orange bg-orange-50' : 'border-blue-gray-40 hover:border-navy'}`}
                    >
                      <div className="font-bold text-navy mb-1">Amigable y Cercano</div>
                      <div className="text-xs text-blue-gray">"¡Hola! Esperamos que estés teniendo un gran día. Queríamos pedirte..."</div>
                    </button>
                    <button 
                      onClick={() => setTono('persuasivo')}
                      className={`border p-4 rounded-xl text-left transition-all ${tono === 'persuasivo' ? 'border-accent-orange bg-orange-50' : 'border-blue-gray-40 hover:border-navy'}`}
                    >
                      <div className="font-bold text-navy mb-1">Urgente / Persuasivo</div>
                      <div className="text-xs text-blue-gray">"Importante: Requerimos su validación urgente para el proceso de..."</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANALISIS */}
          {tabActiva === 'analisis' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-navy mb-2">Análisis Inteligente y Alertas</h2>
              <p className="text-blue-gray text-sm mb-8">Configura las acciones automáticas que realiza el agente al recibir una referencia.</p>
              
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-blue-gray-20 pb-6">
                  <div>
                    <div className="font-bold text-charcoal text-base">Resumen Automático de Candidato</div>
                    <div className="text-sm text-blue-gray mt-1">Generar un resumen ejecutivo destacando fortalezas y debilidades cuando se completen todas las referencias.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-blue-gray-40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-orange"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between border-b border-blue-gray-20 pb-6">
                  <div>
                    <div className="font-bold text-charcoal text-base flex items-center gap-2">
                      Detección de Banderas Rojas (Red Flags)
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded font-bold">Beta</span>
                    </div>
                    <div className="text-sm text-blue-gray mt-1">Notificar inmediatamente al reclutador si el análisis semántico detecta comentarios altamente negativos.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-blue-gray-40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-orange"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between pb-2">
                  <div>
                    <div className="font-bold text-charcoal text-base">Agradecimiento al Referente</div>
                    <div className="text-sm text-blue-gray mt-1">Enviar un correo de agradecimiento redactado por la IA una vez que envíen el formulario.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-blue-gray-40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-orange"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACTIVIDAD */}
          {tabActiva === 'actividad' && (
            <div className="animate-fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-navy mb-1">Registro de Actividad</h2>
                  <p className="text-blue-gray text-sm">Monitorea las acciones recientes del Agente IA en tiempo real.</p>
                </div>
                <button className="text-accent-orange text-sm font-bold flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-sm">download</span> Exportar
                </button>
              </div>
              
              <div className="border border-blue-gray-20 rounded-xl overflow-hidden flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="bg-off-white border-b border-blue-gray-20 text-charcoal">
                    <tr>
                      <th className="p-4 font-bold">Fecha / Hora</th>
                      <th className="p-4 font-bold">Acción</th>
                      <th className="p-4 font-bold">Detalle</th>
                      <th className="p-4 font-bold text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-blue-gray-20">
                      <td className="p-4 text-blue-gray">Hoy, 10:24 AM</td>
                      <td className="p-4 font-bold text-charcoal">Recordatorio Enviado</td>
                      <td className="p-4">Candidato: Laura Mendoza (2do Intento)</td>
                      <td className="p-4 text-center">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Exitoso</span>
                      </td>
                    </tr>
                    <tr className="border-b border-blue-gray-20">
                      <td className="p-4 text-blue-gray">Hoy, 09:15 AM</td>
                      <td className="p-4 font-bold text-charcoal">Análisis Completado</td>
                      <td className="p-4">Generación de resumen para Carlos Gómez</td>
                      <td className="p-4 text-center">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Exitoso</span>
                      </td>
                    </tr>
                    <tr className="border-b border-blue-gray-20">
                      <td className="p-4 text-blue-gray">Ayer, 16:30 PM</td>
                      <td className="p-4 font-bold text-charcoal flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500 text-sm">flag</span>
                        Alerta de Red Flag
                      </td>
                      <td className="p-4">Comentario negativo detectado en Ref #1234</td>
                      <td className="p-4 text-center">
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-md">Notificado</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-blue-gray">Ayer, 08:00 AM</td>
                      <td className="p-4 font-bold text-charcoal">Recordatorio Enviado</td>
                      <td className="p-4">Candidato: Andrés Silva (3er Intento)</td>
                      <td className="p-4 text-center">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Exitoso</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
