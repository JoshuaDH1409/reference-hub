import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'

const referenciaVacia = () => ({
  nombreReferente: '', empresa: '', puestoReferente: '',
  relacion: 'Jefe directo', email: '', telefono: '',
})

export default function NuevoCandidato({ onClose }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [puesto, setPuesto] = useState('')
  const [referencias, setReferencias] = useState([referenciaVacia(), referenciaVacia()])
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  const actualizarRef = (i, campo, valor) => {
    setReferencias((prev) => prev.map((r, j) => (j === i ? { ...r, [campo]: valor } : r)))
  }

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    const validas = referencias.filter((r) => r.nombreReferente.trim() && r.email.trim())
    if (!validas.length) {
      setError('Registra al menos una referencia con nombre y correo electrónico.')
      return
    }
    setEnviando(true)
    try {
      const res = await api.crearCandidato({ nombre, email, puesto, referencias: validas })
      if (onClose) onClose();
      navegar(`/candidatos/${res.id}`)
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="theme-modal-overlay">
      <div className="theme-modal-content">
        <button className="theme-modal-close" onClick={onClose} aria-label="Cerrar modal">
          <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        
        <h1 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', color: 'var(--navy)' }}>Registrar candidato</h1>
        <p className="subtitulo" style={{ marginBottom: '24px', color: 'var(--muted)' }}>
          Al guardar, la plataforma envía automáticamente las invitaciones por correo a cada referencia.
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={guardar}>
          <div className="theme-form-section">
            <div className="theme-form-section-title">Datos del candidato</div>
            <div className="theme-form-grid">
              <div className="theme-field">
                <label>Nombre completo *</label>
                <input className="theme-input" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="theme-field">
                <label>Correo electrónico</label>
                <input className="theme-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="theme-field">
                <label>Vacante / puesto</label>
                <input className="theme-input" type="text" value={puesto} onChange={(e) => setPuesto(e.target.value)} />
              </div>
            </div>
          </div>

          {referencias.map((r, i) => (
            <div className="theme-form-section" key={i}>
              <div className="theme-form-section-title">
                <span>Referencia {i + 1}</span>
                {referencias.length > 1 && (
                  <button
                    type="button"
                    className="theme-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => setReferencias((prev) => prev.filter((_, j) => j !== i))}
                  >
                    Quitar
                  </button>
                )}
              </div>
              <div className="theme-form-grid">
                <div className="theme-field">
                  <label>Nombre del referente *</label>
                  <input className="theme-input" type="text" value={r.nombreReferente}
                    onChange={(e) => actualizarRef(i, 'nombreReferente', e.target.value)} />
                </div>
                <div className="theme-field">
                  <label>Empresa</label>
                  <input className="theme-input" type="text" value={r.empresa}
                    onChange={(e) => actualizarRef(i, 'empresa', e.target.value)} />
                </div>
                <div className="theme-field">
                  <label>Puesto del referente</label>
                  <input className="theme-input" type="text" value={r.puestoReferente}
                    onChange={(e) => actualizarRef(i, 'puestoReferente', e.target.value)} />
                </div>
                <div className="theme-field">
                  <label>Relación con el candidato</label>
                  <select className="theme-select" value={r.relacion} onChange={(e) => actualizarRef(i, 'relacion', e.target.value)}>
                    <option>Jefe directo</option>
                    <option>Jefe anterior</option>
                    <option>Colega</option>
                    <option>Recursos Humanos</option>
                    <option>Cliente</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="theme-field">
                  <label>Correo electrónico *</label>
                  <input className="theme-input" type="email" value={r.email}
                    onChange={(e) => actualizarRef(i, 'email', e.target.value)} />
                </div>
                <div className="theme-field">
                  <label>Teléfono</label>
                  <input className="theme-input" type="text" value={r.telefono}
                    onChange={(e) => actualizarRef(i, 'telefono', e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            <button type="button" className="theme-btn-secondary"
              onClick={() => setReferencias((prev) => [...prev, referenciaVacia()])}>
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: 16, height: 16}}><path d="M12 5v14M5 12h14"/></svg>
              Agregar otra referencia
            </button>
            <button type="submit" className="theme-cta" disabled={enviando} style={{ padding: '8px 24px', fontSize: '0.9rem' }}>
              {enviando ? 'Guardando…' : 'Guardar e invitar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

