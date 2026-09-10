import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, formatoFecha } from '../api.js'
import NuevoCandidato from './NuevoCandidato.jsx'
import ImportarCandidatos from './ImportarCandidatos.jsx'

function SemaforoMini({ score }) {
  if (!score || !score.disponible) {
    return <span className="theme-status-badge">N/A</span>;
  }
  let color = 'gris';
  if (score.semaforo === 'rojo') color = 'alto';
  else if (score.semaforo === 'amarillo' || score.semaforo === 'naranja') color = 'medio';
  else if (score.semaforo === 'verde') color = 'bajo';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div className={`semaforo-luz ${color}`} style={{ width: '12px', height: '12px' }}></div>
      <span style={{ fontWeight: 600 }}>{score.general.toFixed(1)}</span>
    </div>
  );
}

export default function Candidatos() {
  const [candidatos, setCandidatos] = useState(null)
  const [error, setError] = useState('')
  const [modalAbierta, setModalAbierta] = useState(false)
  const [modalImportarAbierta, setModalImportarAbierta] = useState(false)
  const navegar = useNavigate()

  const cargarDatos = () => {
    api.dashboard().then(res => setCandidatos(res.candidatos)).catch((e) => {
      setError(e.message)
    })
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  if (error) return <div className="error-msg">No se pudo conectar con la API: {error}</div>
  if (!candidatos) return <div className="theme-content"><p style={{ color: 'var(--bluegray)' }}>Cargando candidatos…</p></div>

  return (
    <section className="theme-content">
      <div className="theme-page-head" style={{ alignItems: 'center' }}>
        <div>
          <div className="theme-eyebrow">Gestión › Candidatos</div>
          <h1>Candidatos</h1>
          <div className="theme-subtitle">Administra los expedientes y procesos de referencia de los candidatos.</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="theme-btn-secondary" onClick={() => setModalImportarAbierta(true)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            Importar Excel
          </button>
          <button className="theme-cta" onClick={() => setModalAbierta(true)}>
            <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Registrar Candidato
          </button>
        </div>
      </div>

      <article className="theme-card theme-panel">
        <div className="theme-panel-head">
          <h2 className="theme-panel-title">Todos los Candidatos ({candidatos.length})</h2>
        </div>
        
        <div className="theme-table-container">
          <table className="theme-table">
            <thead>
              <tr>
                <th>Nombre y Puesto</th>
                <th>Fecha Registro</th>
                <th>Estatus</th>
                <th>Avance</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {candidatos.map(c => (
                <tr key={c.id} onClick={() => navegar(`/candidatos/${c.id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="theme-avatar" style={{ width: '38px', height: '38px', fontSize: '0.8rem' }}>
                        {c.nombre.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="theme-profile-copy">
                        <strong style={{ color: 'var(--navy)' }}>{c.nombre}</strong>
                        <span>{c.puesto}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                    {formatoFecha(c.fechaRegistro)}
                  </td>
                  <td>
                    <span className={`theme-status-badge ${c.estatus === 'Completado' ? 'completado' : 'en-proceso'}`}>
                      {c.estatus === 'Completado' ? 'Completado' : 'En Proceso'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="theme-progress" style={{ width: '80px', height: '6px' }}>
                        <span style={{ width: `${c.avance}%` }}></span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{c.avance}%</span>
                    </div>
                  </td>
                  <td>
                    <SemaforoMini score={c.score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {candidatos.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>
              No se encontraron candidatos registrados.
            </div>
          )}
        </div>
      </article>

      {modalAbierta && (
        <NuevoCandidato onClose={() => {
          setModalAbierta(false)
          cargarDatos()
        }} />
      )}

      {modalImportarAbierta && (
        <ImportarCandidatos onClose={() => {
          setModalImportarAbierta(false)
          cargarDatos()
        }} />
      )}
    </section>
  )
}
