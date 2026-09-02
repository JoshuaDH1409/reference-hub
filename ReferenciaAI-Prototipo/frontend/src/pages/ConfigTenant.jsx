import { useState } from 'react';

export default function ConfigTenant() {
  const [tabActiva, setTabActiva] = useState('usuarios');
  const [frecuencia, setFrecuencia] = useState(48); // hours

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Configuración de Empresa</h1>
        <p className="text-blue-gray text-sm">Administra tu cuenta, usuarios y personaliza la experiencia de tus candidatos.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
            <button 
              onClick={() => setTabActiva('usuarios')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${tabActiva === 'usuarios' ? 'bg-navy text-off-white shadow-md' : 'text-charcoal hover:bg-white border border-transparent hover:border-blue-gray-20'}`}
            >
              <span className="material-symbols-outlined text-lg">group</span>
              Usuarios del equipo
            </button>
            <button 
              onClick={() => setTabActiva('preguntas')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${tabActiva === 'preguntas' ? 'bg-navy text-off-white shadow-md' : 'text-charcoal hover:bg-white border border-transparent hover:border-blue-gray-20'}`}
            >
              <span className="material-symbols-outlined text-lg">quiz</span>
              Preguntas personalizadas
            </button>
            <button 
              onClick={() => setTabActiva('automatizacion')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${tabActiva === 'automatizacion' ? 'bg-navy text-off-white shadow-md' : 'text-charcoal hover:bg-white border border-transparent hover:border-blue-gray-20'}`}
            >
              <span className="material-symbols-outlined text-lg">robot_2</span>
              Automatización
            </button>
          </nav>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 bg-white border border-blue-gray-20 rounded-3xl p-8 shadow-sm min-h-[500px]">
          
          {tabActiva === 'usuarios' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-navy">Gestión de Usuarios</h2>
                <button className="bg-accent-orange text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-opacity-90">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  Invitar Usuario
                </button>
              </div>
              <div className="border border-blue-gray-20 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-off-white border-b border-blue-gray-20 text-charcoal">
                    <tr>
                      <th className="p-4 font-bold">Usuario</th>
                      <th className="p-4 font-bold">Rol</th>
                      <th className="p-4 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-blue-gray-20">
                      <td className="p-4">
                        <div className="font-bold text-navy">Admin Principal</div>
                        <div className="text-xs text-blue-gray">admin@empresa.com</div>
                      </td>
                      <td className="p-4"><span className="bg-navy text-white text-xs font-bold px-2 py-1 rounded-md">Owner</span></td>
                      <td className="p-4 text-center text-blue-gray-40">—</td>
                    </tr>
                    <tr>
                      <td className="p-4">
                        <div className="font-bold text-charcoal">Reclutador 1</div>
                        <div className="text-xs text-blue-gray">reclutador@empresa.com</div>
                      </td>
                      <td className="p-4 text-charcoal">Editor</td>
                      <td className="p-4 text-center">
                        <button className="text-accent-orange font-bold text-xs hover:underline">Revocar</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tabActiva === 'preguntas' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-navy mb-2">Preguntas Personalizadas</h2>
              <p className="text-blue-gray text-sm mb-6">Añade hasta 3 preguntas extra al cuestionario base para tus referentes.</p>
              
              <div className="space-y-4">
                <div className="border border-blue-gray-40 border-dashed rounded-xl p-6 bg-off-white flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-gray-20 transition-colors">
                  <span className="material-symbols-outlined text-navy mb-2 text-3xl">add_circle</span>
                  <span className="font-bold text-navy">Añadir nueva pregunta</span>
                  <span className="text-xs text-blue-gray mt-1">Preguntas abiertas o de opción múltiple</span>
                </div>
              </div>
            </div>
          )}

          {tabActiva === 'automatizacion' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-navy mb-2">Automatización y Recordatorios</h2>
              <p className="text-blue-gray text-sm mb-8">Configura la frecuencia con la que la IA envía correos de seguimiento a los referentes.</p>
              
              <div className="bg-off-white border border-blue-gray-20 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-charcoal flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-orange">alarm</span>
                    Frecuencia de Recordatorios
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

                <div className="mt-8 border-t border-blue-gray-40 pt-6 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-charcoal">Agradecimiento automático</div>
                    <div className="text-xs text-blue-gray">Enviar correo al concluir la referencia.</div>
                  </div>
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-blue-gray-40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-orange"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
