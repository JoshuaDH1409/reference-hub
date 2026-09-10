import React, { useState } from 'react';
import { usePreguntasPorArea } from '../../hooks/usePreguntasPorArea';

export function PreguntasAreaViewer() {
  const [areaSeleccionada, setAreaSeleccionada] = useState('');
  const { preguntas, loading, error, togglePreguntaActiva } = usePreguntasPorArea(areaSeleccionada);

  const areas = [
    'General',
    'Ventas',
    'Tecnología',
    'Atención al Cliente',
    'Finanzas'
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--blue-gray)] overflow-hidden">
      <div className="p-6 border-b border-[var(--blue-gray)] bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--navy)]">Banco de Preguntas</h3>
          <p className="text-sm text-gray-500">
            Selecciona un área para visualizar las preguntas asignadas que se enviarán a los referentes.
          </p>
        </div>
        
        <div className="w-full md:w-64">
          <select
            value={areaSeleccionada}
            onChange={(e) => setAreaSeleccionada(e.target.value)}
            className="w-full bg-white border border-[var(--blue-gray)] text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange)] focus:border-transparent transition-all"
          >
            <option value="">-- Seleccionar Área --</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6">
        {!areaSeleccionada ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg">Selecciona un área de la lista para ver sus preguntas.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-orange)]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        ) : preguntas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No hay preguntas configuradas para esta área.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preguntas.map((p, index) => (
              <div key={p.id} className={`border rounded-lg p-5 transition-colors bg-white shadow-sm flex flex-col justify-between ${p.activa ? 'border-gray-200 hover:border-[var(--accent-orange)]' : 'border-gray-100 opacity-60 bg-gray-50'}`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center text-white text-xs font-bold w-6 h-6 rounded-full ${p.activa ? 'bg-[var(--navy)]' : 'bg-gray-400'}`}>
                        {index + 1}
                      </span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {p.tipo === 'Score1To10' ? 'Score' : p.tipo}
                      </span>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={p.activa} 
                          onChange={() => togglePreguntaActiva(p.id)} 
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${p.activa ? 'bg-[var(--accent-orange)]' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${p.activa ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-500 w-12">{p.activa ? 'Activa' : 'Inactiva'}</span>
                    </label>
                  </div>
                  <h4 className={`font-medium leading-snug mb-4 ${p.activa ? 'text-gray-800' : 'text-gray-500 line-through decoration-gray-300'}`}>
                    {p.textoPregunta}
                  </h4>
                </div>
                
                {/* Visual indicator for 1 to 10 scale */}
                <div className={`mt-auto transition-opacity ${p.activa ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">
                    <span>Deficiente (1)</span>
                    <span>Excelente (10)</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <div key={num} className={`h-2 flex-1 rounded-sm ${num <= 3 ? 'bg-red-200' : num <= 7 ? 'bg-yellow-200' : 'bg-green-200'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
