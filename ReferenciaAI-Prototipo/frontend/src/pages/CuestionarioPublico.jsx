import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Slider from '@radix-ui/react-slider';
import { api } from '../api.js';

const COMPETENCIAS = [
  { clave: 'responsabilidad', nombre: 'Responsabilidad' },
  { clave: 'trabajoEquipo', nombre: 'Trabajo en equipo' },
  { clave: 'comunicacion', nombre: 'Comunicación' },
  { clave: 'liderazgo', nombre: 'Liderazgo' },
  { clave: 'integridad', nombre: 'Integridad' },
  { clave: 'conocimientoTecnico', nombre: 'Conocimiento técnico' },
];

export default function CuestionarioPublico() {
  const { token } = useParams();
  
  // Data Fetching with React Query
  const { data: info, isLoading, isError } = useQuery({
    queryKey: ['cuestionarioInfo', token],
    queryFn: () => api.infoCuestionario(token),
    retry: false,
    staleTime: 1000 * 60 * 15,
  });

  const enviarMutation = useMutation({
    mutationFn: (datosFinales) => api.enviarRespuesta(token, datosFinales),
  });

  // State
  const [paso, setPaso] = useState(1);
  const [identidad, setIdentidad] = useState({ nombre: '', relacion: '' });
  const [valores, setValores] = useState({
    responsabilidad: 8, trabajoEquipo: 8, comunicacion: 8,
    liderazgo: 8, integridad: 8, conocimientoTecnico: 8,
  });
  const [recontrataria, setRecontrataria] = useState(null);
  const [fortalezas, setFortalezas] = useState('');
  const [areasOportunidad, setAreasOportunidad] = useState('');
  
  // LocalStorage Auto-save
  useEffect(() => {
    const savedData = localStorage.getItem(`referencia_${token}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.identidad) setIdentidad(parsed.identidad);
        if (parsed.valores) setValores(parsed.valores);
        if (parsed.recontrataria !== undefined) setRecontrataria(parsed.recontrataria);
        if (parsed.fortalezas) setFortalezas(parsed.fortalezas);
        if (parsed.areasOportunidad) setAreasOportunidad(parsed.areasOportunidad);
        if (parsed.paso) setPaso(parsed.paso);
      } catch (e) {
        console.error("Error parsing local storage", e);
      }
    }
  }, [token]);

  useEffect(() => {
    // Only save if we are past initial load
    if (identidad.nombre || identidad.relacion) {
      localStorage.setItem(`referencia_${token}`, JSON.stringify({
        identidad, valores, recontrataria, fortalezas, areasOportunidad, paso
      }));
    }
  }, [identidad, valores, recontrataria, fortalezas, areasOportunidad, paso, token]);

  const enviarRespuesta = () => {
    const datosFinales = {
      ...valores,
      recontrataria: recontrataria === 'si',
      fortalezas,
      areasOportunidad
    };
    enviarMutation.mutate(datosFinales, {
      onSuccess: () => {
        localStorage.removeItem(`referencia_${token}`);
      }
    });
  };

  if (isLoading) return <div className="min-h-screen bg-off-white flex items-center justify-center font-bold text-blue-gray" aria-live="polite">Cargando cuestionario...</div>;
  if (isError) return <div className="min-h-screen bg-off-white flex items-center justify-center font-bold text-red-500">Error al cargar o enlace inválido.</div>;
  
  if (info?.yaRespondida) return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-6 text-center">
      <span className="material-symbols-outlined text-6xl text-blue-gray mb-4" aria-hidden="true">task</span>
      <h1 className="text-2xl font-bold text-navy mb-2">Cuestionario completado</h1>
      <p className="text-charcoal">Gracias, esta referencia ya ha sido proporcionada.</p>
    </div>
  );

  if (enviarMutation.isSuccess) return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-6 text-center" role="alert" aria-live="assertive">
      <div className="w-16 h-16 bg-[#E8F5E9] text-[#2E7D32] rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl" aria-hidden="true">check_circle</span>
      </div>
      <h1 className="text-3xl font-bold text-navy mb-3">¡Muchas gracias!</h1>
      <p className="text-charcoal max-w-sm mb-8">
        Hemos guardado tus respuestas exitosamente. Tu tiempo y sinceridad son muy valiosos para nosotros.
      </p>
      <button onClick={() => window.close()} className="text-accent-orange font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-accent-orange rounded p-2">Cerrar ventana</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-off-white pb-20">
      <header className="bg-navy p-5 shadow-md flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent-orange rounded-full" aria-hidden="true"></div>
          <span className="font-bold text-off-white text-lg tracking-wide">Reference<span className="text-accent-orange">Hub</span></span>
        </div>
        <div className="text-blue-gray text-sm font-bold" aria-live="polite">
          Paso {paso} de 3
        </div>
      </header>

      <div className="h-1 bg-navy bg-opacity-20 w-full" role="progressbar" aria-valuenow={paso} aria-valuemin={1} aria-valuemax={3}>
        <div 
          className="h-full bg-accent-orange transition-all duration-300" 
          style={{ width: `${(paso / 3) * 100}%` }}
        ></div>
      </div>

      <main className="p-6 max-w-md mx-auto">
        {paso === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-navy mb-2">Identidad</h2>
            <p className="text-blue-gray text-sm mb-6">
              Para continuar con la evaluación de <strong>{info?.candidato}</strong>, necesitamos confirmar tu identidad.
            </p>
            
            <div className="mb-5">
              <label htmlFor="nombreReferente" className="block font-bold text-charcoal text-sm mb-2">Tu nombre completo</label>
              <input 
                id="nombreReferente"
                type="text" 
                placeholder="Ingresa tu nombre"
                className="w-full border-2 border-blue-gray-40 rounded-xl p-4 text-charcoal focus:border-accent-orange focus:outline-none focus:ring-2 focus:ring-accent-orange/50 transition-colors"
                value={identidad.nombre}
                onChange={e => setIdentidad({...identidad, nombre: e.target.value})}
              />
            </div>
            <div className="mb-8">
              <label htmlFor="relacionReferente" className="block font-bold text-charcoal text-sm mb-2">Relación con {info?.candidato}</label>
              <select 
                id="relacionReferente"
                className="w-full border-2 border-blue-gray-40 rounded-xl p-4 text-charcoal focus:border-accent-orange focus:outline-none focus:ring-2 focus:ring-accent-orange/50 transition-colors bg-white"
                value={identidad.relacion}
                onChange={e => setIdentidad({...identidad, relacion: e.target.value})}
              >
                <option value="">Selecciona una opción</option>
                <option value="Jefe">Jefe / Supervisor</option>
                <option value="Colega">Colega / Par</option>
                <option value="Subordinado">Subordinado</option>
                <option value="Cliente">Cliente</option>
              </select>
            </div>
            
            <button 
              onClick={() => setPaso(2)}
              disabled={!identidad.nombre || !identidad.relacion}
              className="w-full bg-accent-orange text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-orange"
            >
              Continuar <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </button>
          </div>
        )}

        {paso === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-navy mb-2">Competencias</h2>
            <p className="text-blue-gray text-sm mb-6">
              Evalúa a <strong>{info?.candidato}</strong> del 1 al 10 en las siguientes áreas. (1 = Deficiente, 10 = Excelente)
            </p>
            
            <div className="space-y-8 mb-8">
              {COMPETENCIAS.map((comp) => (
                <div key={comp.clave} className="bg-white p-5 rounded-2xl border border-blue-gray-20 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span id={`label-${comp.clave}`} className="font-bold text-charcoal text-base">{comp.nombre}</span>
                    <span className="bg-navy text-off-white font-bold px-3 py-1 rounded-lg text-lg" aria-live="polite">
                      {valores[comp.clave]}
                    </span>
                  </div>
                  
                  <Slider.Root 
                    className="relative flex items-center select-none touch-none w-full h-5"
                    value={[valores[comp.clave]]}
                    onValueChange={(val) => setValores({...valores, [comp.clave]: val[0]})}
                    max={10}
                    step={1}
                    aria-labelledby={`label-${comp.clave}`}
                  >
                    <Slider.Track className="bg-blue-gray-20 relative grow rounded-full h-[6px]">
                      <Slider.Range className="absolute bg-accent-orange rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb 
                      className="block w-6 h-6 bg-white border-2 border-accent-orange shadow-[0_2px_10px] shadow-black/10 rounded-full hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-accent-orange/30 transition-all cursor-grab active:cursor-grabbing" 
                      aria-label={`Calificación para ${comp.nombre}`} 
                    />
                  </Slider.Root>

                  <div className="flex justify-between text-xs text-blue-gray mt-2 font-bold" aria-hidden="true">
                    <span>0</span>
                    <span>10</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setPaso(1)} 
                className="p-4 bg-white border border-blue-gray-40 text-navy rounded-xl font-bold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-navy"
                aria-label="Regresar al paso anterior"
              >
                <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              </button>
              <button 
                onClick={() => setPaso(3)} 
                className="flex-1 bg-accent-orange text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-orange"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-navy mb-2">Recontratación y Comentarios</h2>
            <p className="text-blue-gray text-sm mb-10">
              Considerando el desempeño global de <strong>{info?.candidato}</strong>, ayúdanos con un par de detalles más.
            </p>

            <fieldset>
              <legend className="font-bold text-charcoal text-lg mb-6 text-center w-full">¿Volverías a contratar o trabajar con esta persona?</legend>
              <div className="flex flex-col gap-4 mb-10">
                <button 
                  type="button"
                  onClick={() => setRecontrataria('si')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-accent-orange ${recontrataria === 'si' ? 'border-accent-orange bg-orange-50' : 'border-blue-gray-20 bg-white'}`}
                  aria-pressed={recontrataria === 'si'}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${recontrataria === 'si' ? 'border-accent-orange text-accent-orange' : 'border-blue-gray-40'}`}>
                    {recontrataria === 'si' && <span className="material-symbols-outlined text-sm" aria-hidden="true">check</span>}
                  </div>
                  <span className={`font-bold text-lg ${recontrataria === 'si' ? 'text-accent-orange' : 'text-charcoal'}`}>Sí, absolutamente</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setRecontrataria('no')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-navy ${recontrataria === 'no' ? 'border-navy bg-indigo-50' : 'border-blue-gray-20 bg-white'}`}
                  aria-pressed={recontrataria === 'no'}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${recontrataria === 'no' ? 'border-navy text-navy' : 'border-blue-gray-40'}`}>
                    {recontrataria === 'no' && <span className="material-symbols-outlined text-sm" aria-hidden="true">check</span>}
                  </div>
                  <span className={`font-bold text-lg ${recontrataria === 'no' ? 'text-navy' : 'text-charcoal'}`}>No lo haría</span>
                </button>
              </div>
            </fieldset>

            <div className="mb-6">
              <label htmlFor="fortalezas" className="block font-bold text-charcoal text-sm mb-2">Principales fortalezas (Opcional)</label>
              <textarea 
                id="fortalezas"
                rows="3" 
                placeholder="Ej. Gran liderazgo, empatía, cumple con sus promesas..."
                className="w-full border-2 border-blue-gray-40 rounded-xl p-4 text-charcoal focus:border-accent-orange focus:outline-none focus:ring-2 focus:ring-accent-orange/50 transition-colors resize-none"
                value={fortalezas}
                onChange={e => setFortalezas(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-8">
              <label htmlFor="areasOportunidad" className="block font-bold text-charcoal text-sm mb-2">Áreas de oportunidad (Opcional)</label>
              <textarea 
                id="areasOportunidad"
                rows="3" 
                placeholder="Ej. Podría delegar más tareas, manejo del tiempo..."
                className="w-full border-2 border-blue-gray-40 rounded-xl p-4 text-charcoal focus:border-accent-orange focus:outline-none focus:ring-2 focus:ring-accent-orange/50 transition-colors resize-none"
                value={areasOportunidad}
                onChange={e => setAreasOportunidad(e.target.value)}
              ></textarea>
            </div>

            {enviarMutation.isError && (
              <div className="mb-4 text-red-600 font-bold text-sm bg-red-50 p-3 rounded-lg border border-red-200" role="alert">
                Error al enviar: {enviarMutation.error?.message || 'Por favor intenta de nuevo.'}
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setPaso(2)} 
                className="p-4 bg-white border border-blue-gray-40 text-navy rounded-xl font-bold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-navy"
                aria-label="Regresar al paso anterior"
              >
                <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              </button>
              <button 
                onClick={enviarRespuesta}
                disabled={enviarMutation.isPending || !recontrataria}
                className="flex-1 bg-navy text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
              >
                {enviarMutation.isPending ? 'Enviando...' : 'Finalizar y Enviar'}
                {!enviarMutation.isPending && <span className="material-symbols-outlined" aria-hidden="true">send</span>}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
