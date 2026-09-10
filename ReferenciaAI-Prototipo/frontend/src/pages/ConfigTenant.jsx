import { useState } from 'react';
import { PreguntasAreaViewer } from '../components/configuracion/PreguntasAreaViewer';

const AREAS = ['Ventas', 'Tecnología', 'Atención al Cliente', 'Finanzas', 'General'];

const POOL_PREGUNTAS = {
  'Ventas': [
    '¿Cómo maneja la presión para alcanzar cuotas mensuales?',
    'Describa una venta difícil que el candidato logró cerrar.',
    '¿Cómo es el trato del candidato con clientes insatisfechos?'
  ],
  'Tecnología': [
    '¿Qué tan rápido se adapta el candidato a nuevas tecnologías o frameworks?',
    '¿Cómo maneja la resolución de problemas (bugs) críticos bajo presión?',
    '¿Cómo evalúa la calidad del código y la capacidad de documentar del candidato?'
  ],
  'Atención al Cliente': [
    '¿Cómo reacciona el candidato ante clientes agresivos o muy molestos?',
    '¿Qué nivel de empatía muestra al resolver problemas diarios?',
    '¿El candidato es capaz de seguir protocolos estrictos de servicio?'
  ],
  'Finanzas': [
    '¿Qué nivel de atención al detalle tiene el candidato en el manejo de cifras?',
    '¿Cómo evalúa la ética profesional del candidato manejando información confidencial?',
    '¿Cómo se organiza frente a cierres de mes bajo presión?'
  ],
  'General': [
    '¿Cuál consideraría que es la mayor fortaleza de este candidato?',
    '¿Hay alguna área de oportunidad o mejora que haya notado en su desempeño?',
    '¿Volvería a contratar a esta persona sin dudarlo?'
  ]
};

export default function ConfigTenant() {
  const [tabActiva, setTabActiva] = useState('preguntas');
  const [areaSeleccionada, setAreaSeleccionada] = useState('Ventas');
  
  // Estado para las preguntas seleccionadas por área
  const [preguntasActivas, setPreguntasActivas] = useState({
    'Ventas': [{ texto: '¿Cuál consideraría que es la mayor fortaleza de este candidato?', tipo: 'abierta' }],
    'Tecnología': [],
    'Atención al Cliente': [],
    'Finanzas': [],
    'General': []
  });

  // Estados para el Modal de agregar pregunta
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoAgregar, setModoAgregar] = useState('pool'); // 'pool' o 'manual'
  const [nuevaPreguntaManual, setNuevaPreguntaManual] = useState('');
  const [tipoRespuesta, setTipoRespuesta] = useState('abierta');

  const handleAgregarDelPool = (preguntaTexto) => {
    // Evitar duplicados
    if (!preguntasActivas[areaSeleccionada].find(p => p.texto === preguntaTexto)) {
      setPreguntasActivas(prev => ({
        ...prev,
        [areaSeleccionada]: [...prev[areaSeleccionada], { texto: preguntaTexto, tipo: 'abierta' }]
      }));
    }
    setModalAbierto(false);
  };

  const handleAgregarManual = () => {
    if (nuevaPreguntaManual.trim() === '') return;
    
    setPreguntasActivas(prev => ({
      ...prev,
      [areaSeleccionada]: [...prev[areaSeleccionada], { texto: nuevaPreguntaManual, tipo: tipoRespuesta }]
    }));
    
    setNuevaPreguntaManual('');
    setModalAbierto(false);
  };

  const handleEliminarPregunta = (index) => {
    setPreguntasActivas(prev => {
      const nuevasPreguntas = [...prev[areaSeleccionada]];
      nuevasPreguntas.splice(index, 1);
      return {
        ...prev,
        [areaSeleccionada]: nuevasPreguntas
      };
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
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
              Preguntas por Área
            </button>
          </nav>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 bg-white border border-blue-gray-20 rounded-3xl p-8 shadow-sm min-h-[600px] relative">
          
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
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tabActiva === 'preguntas' && (
            <div className="animate-fade-in mt-4">
              <PreguntasAreaViewer />
            </div>
          )}

          {/* Modal para Agregar Pregunta */}
          {modalAbierto && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col rounded-3xl overflow-hidden border border-blue-gray-20">
              <div className="flex justify-between items-center p-6 border-b border-blue-gray-20 bg-white">
                <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent-orange">add_circle</span>
                  Añadir pregunta a {areaSeleccionada}
                </h3>
                <button onClick={() => setModalAbierto(false)} className="text-blue-gray hover:text-charcoal">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex gap-4 mb-6">
                  <button 
                    onClick={() => setModoAgregar('pool')}
                    className={`flex-1 py-2 text-sm font-bold border-b-2 transition-colors ${modoAgregar === 'pool' ? 'border-accent-orange text-accent-orange' : 'border-transparent text-blue-gray hover:text-charcoal'}`}
                  >
                    Usar Pool Sugerido
                  </button>
                  <button 
                    onClick={() => setModoAgregar('manual')}
                    className={`flex-1 py-2 text-sm font-bold border-b-2 transition-colors ${modoAgregar === 'manual' ? 'border-accent-orange text-accent-orange' : 'border-transparent text-blue-gray hover:text-charcoal'}`}
                  >
                    Crear Manualmente
                  </button>
                </div>

                {modoAgregar === 'pool' && (
                  <div className="space-y-3">
                    <p className="text-sm text-blue-gray mb-4">Selecciona una de las preguntas sugeridas por la IA para evaluar candidatos de <strong>{areaSeleccionada}</strong>:</p>
                    {POOL_PREGUNTAS[areaSeleccionada]?.map((preg, idx) => {
                      const isAlreadyAdded = preguntasActivas[areaSeleccionada].some(p => p.texto === preg);
                      return (
                        <div 
                          key={idx} 
                          className={`p-4 border rounded-xl flex items-center justify-between ${isAlreadyAdded ? 'border-green-200 bg-green-50' : 'border-blue-gray-20 hover:border-navy cursor-pointer'}`}
                          onClick={() => !isAlreadyAdded && handleAgregarDelPool(preg)}
                        >
                          <span className={`text-sm ${isAlreadyAdded ? 'text-green-800' : 'text-charcoal'}`}>{preg}</span>
                          {isAlreadyAdded ? (
                            <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                          ) : (
                            <span className="material-symbols-outlined text-blue-gray text-sm">add</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {modoAgregar === 'manual' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-charcoal mb-2">Escribe tu pregunta</label>
                      <textarea 
                        rows="3"
                        value={nuevaPreguntaManual}
                        onChange={(e) => setNuevaPreguntaManual(e.target.value)}
                        className="w-full bg-off-white border border-blue-gray-40 text-charcoal text-sm rounded-lg focus:ring-accent-orange focus:border-accent-orange p-3"
                        placeholder="Ej. ¿Cómo se comporta bajo presión constante?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-charcoal mb-2">Tipo de respuesta</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                            type="radio" 
                            name="tipo" 
                            value="abierta" 
                            checked={tipoRespuesta === 'abierta'}
                            onChange={(e) => setTipoRespuesta(e.target.value)}
                            className="accent-accent-orange" 
                          /> Abierta (Texto libre)
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer text-blue-gray">
                          <input 
                            type="radio" 
                            name="tipo" 
                            value="multiple" 
                            disabled
                            className="accent-accent-orange" 
                          /> Opción Múltiple (Próximamente)
                        </label>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleAgregarManual}
                      disabled={nuevaPreguntaManual.trim() === ''}
                      className="w-full mt-4 bg-navy disabled:bg-blue-gray disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors hover:bg-opacity-90"
                    >
                      Guardar y Añadir
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
