import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Consentimiento() {
  const [aceptado, setAceptado] = useState(false);
  const navegar = useNavigate();

  const handleContinuar = () => {
    if (aceptado) {
      // In a real app, this might navigate to a specific token URL or save consent to backend
      navegar('/responder/demo-token');
    }
  };

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-blue-gray-20 p-8 flex flex-col">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-accent-orange rounded-full flex-shrink-0"></div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-xl text-navy tracking-wide">Reference<span className="text-accent-orange">Hub</span></span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-charcoal mb-4 text-center">Aviso de Privacidad</h1>
        
        <div className="text-charcoal text-sm mb-6 leading-relaxed bg-off-white p-4 rounded-lg border border-blue-gray-20 overflow-y-auto max-h-60">
          <p className="mb-3">
            Al utilizar <strong>Reference Hub</strong>, usted acepta que la información proporcionada será tratada con estricta confidencialidad y utilizada exclusivamente para fines de evaluación profesional y procesos de reclutamiento.
          </p>
          <p className="mb-3">
            Sus datos personales y respuestas están protegidos bajo los más altos estándares de seguridad y anonimato, asegurando que su identidad sea resguardada de acuerdo a las leyes aplicables de protección de datos.
          </p>
          <p>
            No compartiremos su información con terceros fuera del proceso de selección pertinente.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-8 group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input 
              type="checkbox" 
              className="peer sr-only"
              checked={aceptado}
              onChange={(e) => setAceptado(e.target.checked)}
            />
            <div className="w-5 h-5 border-2 border-blue-gray rounded bg-white peer-checked:bg-accent-orange peer-checked:border-accent-orange transition-colors"></div>
            <span className="material-symbols-outlined absolute text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none">
              check
            </span>
          </div>
          <span className="text-sm text-charcoal select-none group-hover:text-navy transition-colors">
            He leído y acepto el aviso de privacidad y consiento el tratamiento de mis datos.
          </span>
        </label>

        <button 
          onClick={handleContinuar}
          disabled={!aceptado}
          className="w-full bg-accent-orange text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 shadow-md"
        >
          Aceptar y Continuar
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      
      <div className="mt-8 text-xs text-blue-gray text-center">
        Reference Hub &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
