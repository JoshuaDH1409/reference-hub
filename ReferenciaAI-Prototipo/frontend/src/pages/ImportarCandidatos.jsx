import { useState } from 'react'
import { api } from '../api.js'

export default function ImportarCandidatos({ onClose }) {
  const [archivo, setArchivo] = useState(null)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const manejarCambio = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0])
      setError('')
    }
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!archivo) {
      setError('Por favor, selecciona un archivo de Excel (.xlsx).')
      return
    }

    setEnviando(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', archivo)

      const res = await api.importarCandidatosExcel(formData)
      alert(res.mensaje)
      if (onClose) onClose()
    } catch (err) {
      setError(err.message || 'Hubo un error al procesar el archivo.')
      setEnviando(false)
    }
  }

  const descargarPlantilla = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Candidato_Nombre,Candidato_Email,Candidato_Puesto,Referencia_Nombre,Referencia_Empresa,Referencia_Puesto,Referencia_Relacion,Referencia_Email,Referencia_Telefono\n"
      + "Juan Perez,juan@example.com,Desarrollador,Maria Lopez,Acme Corp,Gerente IT,Jefe directo,maria@example.com,555-1234\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Plantilla_Candidatos.csv");
    document.body.appendChild(link); // Requerido para Firefox
    link.click();
  }

  return (
    <div className="theme-modal-overlay">
      <div className="theme-modal-content">
        <button className="theme-modal-close" onClick={onClose} aria-label="Cerrar modal">
          <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        
        <h1 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', color: 'var(--navy)' }}>Importar por Excel</h1>
        <p className="subtitulo" style={{ marginBottom: '24px', color: 'var(--muted)' }}>
          Sube un archivo de Excel (.xlsx) con el formato requerido. La plataforma creará los candidatos y enviará automáticamente las invitaciones.
        </p>

        {error && <div className="error-msg">{error}</div>}

        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--bluegray)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--navy)' }}>Formato esperado</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '10px' }}>
            El archivo debe tener las siguientes columnas en orden (Fila 1 como encabezado):
          </p>
          <ul style={{ fontSize: '0.85rem', color: 'var(--charcoal)', paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Candidato_Nombre</li>
            <li>Candidato_Email</li>
            <li>Candidato_Puesto</li>
            <li>Referencia_Nombre</li>
            <li>Referencia_Empresa</li>
            <li>Referencia_Puesto</li>
            <li>Referencia_Relacion</li>
            <li>Referencia_Email</li>
            <li>Referencia_Telefono</li>
          </ul>
          <button type="button" onClick={descargarPlantilla} className="theme-btn-secondary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            Descargar plantilla CSV (Para convertir a .xlsx)
          </button>
        </div>

        <form onSubmit={guardar}>
          <div className="theme-form-section">
            <div className="theme-field">
              <label>Archivo Excel (.xlsx) *</label>
              <input 
                className="theme-input" 
                type="file" 
                accept=".xlsx" 
                onChange={manejarCambio} 
                required 
                style={{ padding: '10px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="button" className="theme-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="theme-cta" disabled={enviando} style={{ padding: '8px 24px' }}>
              {enviando ? 'Importando...' : 'Subir e Importar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
