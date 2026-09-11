import { useState, useRef } from 'react'
import { api } from '../api.js'

export default function ImportarCandidatos({ onClose }) {
  const [archivo, setArchivo] = useState(null)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setArchivo(e.dataTransfer.files[0])
      setError('')
    }
  }

  const manejarCambio = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0])
      setError('')
    }
  }

  const descargarPlantilla = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/candidatos/importar/plantilla`);
      if (!response.ok) throw new Error('Error al descargar la plantilla');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Plantilla_Candidatos.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('No se pudo descargar la plantilla.');
    }
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!archivo) {
      setError('Por favor, selecciona un archivo de Excel (.xlsx).')
      return
    }

    if (!archivo.name.endsWith('.xlsx')) {
      setError('El archivo debe tener formato .xlsx')
      return
    }

    setEnviando(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', archivo)

      const res = await api.importarCandidatosExcel(formData)
      alert(res.mensaje || "Importación exitosa")
      if (onClose) onClose()
    } catch (err) {
      setError(err.message || 'Hubo un error al procesar el archivo.')
      setEnviando(false)
    }
  }

  return (
    <div className="theme-modal-overlay">
      <div className="theme-modal-content max-w-2xl">
        <button className="theme-modal-close" onClick={onClose} aria-label="Cerrar modal">
          <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        
        <h1 className="text-2xl font-bold text-navy mb-2">Importación Masiva (Excel)</h1>
        <p className="text-blue-gray text-sm mb-6">
          Sube un archivo `.xlsx` usando nuestra plantilla. La plataforma creará los procesos y enviará automáticamente las invitaciones a los referentes.
        </p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-4">{error}</div>}

        <div className="bg-off-white border border-blue-gray-20 rounded-xl p-5 mb-6 flex items-start justify-between">
          <div>
            <h3 className="font-bold text-charcoal text-sm mb-1">Plantilla Requerida</h3>
            <p className="text-xs text-blue-gray mb-3">Para asegurar que los datos se procesen correctamente, por favor utiliza nuestra plantilla oficial.</p>
          </div>
          <button 
            type="button" 
            onClick={descargarPlantilla} 
            className="flex items-center gap-2 bg-white border border-blue-gray-20 text-navy hover:bg-blue-gray-10 transition-colors text-xs font-bold py-2 px-4 rounded-lg shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Descargar .xlsx
          </button>
        </div>

        <form onSubmit={guardar}>
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-accent-orange bg-orange-50' : 'border-blue-gray-30 hover:border-navy bg-white'} ${archivo ? 'bg-green-50 border-green-400' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <input 
              type="file" 
              accept=".xlsx" 
              onChange={manejarCambio} 
              className="hidden" 
              ref={fileInputRef}
            />
            
            {archivo ? (
              <div className="animate-fade-in flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <h3 className="font-bold text-navy text-lg mb-1">Archivo Listo</h3>
                <p className="text-sm text-blue-gray font-medium">{archivo.name}</p>
                <p className="text-xs text-blue-gray mt-1">{(archivo.size / 1024).toFixed(1)} KB</p>
                <button type="button" className="text-xs font-bold text-red-500 mt-4 hover:underline" onClick={(e) => { e.stopPropagation(); setArchivo(null); }}>Cambiar archivo</button>
              </div>
            ) : (
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-blue-gray-10 text-navy rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">upload_file</span>
                </div>
                <h3 className="font-bold text-navy text-lg mb-1">Sube tu archivo</h3>
                <p className="text-sm text-blue-gray">Arrastra y suelta tu archivo <span className="font-bold">.xlsx</span> aquí</p>
                <div className="flex items-center gap-4 my-4 w-full">
                  <div className="h-px bg-blue-gray-20 flex-1"></div>
                  <span className="text-xs text-blue-gray-40 font-bold uppercase">O</span>
                  <div className="h-px bg-blue-gray-20 flex-1"></div>
                </div>
                <span className="bg-navy text-white text-xs font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-all shadow-sm">
                  Examinar archivos
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" className="px-5 py-2 text-sm font-bold text-charcoal hover:bg-blue-gray-10 rounded-lg transition-colors" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-sm font-bold text-white bg-accent-orange hover:bg-opacity-90 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={enviando || !archivo}
            >
              {enviando ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Procesando...
                </>
              ) : (
                'Importar Candidatos'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
