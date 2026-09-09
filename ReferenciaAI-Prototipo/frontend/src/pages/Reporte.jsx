import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, formatoDia, formatoFecha } from '../api.js'

export default function Reporte() {
  const { id } = useParams()
  const [c, setC] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.candidato(id).then(setC).catch((e) => setError(e.message))
  }, [id])

  if (error) return <div className="error-msg" style={{ margin: 40 }}>{error}</div>
  if (!c) return <p className="subtitulo" style={{ margin: 40 }}>Cargando…</p>

  const score = c.score
  const respondidas = c.referencias.filter((r) => r.estatus === 'Respondida')

  return (
    <div style={{ padding: '30px 0', background: 'var(--fondo)', minHeight: '100vh' }}>
      <div className="reporte tarjeta">
        <div className="no-imprimir" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <Link to={`/candidatos/${c.id}`}>&larr; Volver al expediente</Link>
          <button className="boton chico" onClick={async () => {
            try {
              const res = await fetch(`http://localhost:5155/api/candidatos/${c.id}/reporte/pdf`);
              if (!res.ok) throw new Error('Error al descargar PDF');
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Reporte_${c.nombre.replace(/ /g, '_')}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            } catch (err) {
              console.error(err);
              alert('Error al descargar el PDF.');
            }
          }}>Imprimir / Guardar PDF</button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--azul-osc)' }}>
            Reference <span style={{ color: 'var(--acento)' }}>Hub</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--gris)' }}>
            Reference Hub · Employment reference report · {formatoDia(new Date().toISOString())}
          </div>
        </div>

        <h2>Datos del candidato</h2>
        <table>
          <tbody>
            <tr><td><strong>Nombre</strong></td><td>{c.nombre}</td></tr>
            <tr><td><strong>Vacante</strong></td><td>{c.puesto || '—'}</td></tr>
            <tr><td><strong>Fecha de registro</strong></td><td>{formatoDia(c.fechaRegistro)}</td></tr>
            <tr><td><strong>Estatus del proceso</strong></td>
              <td>{c.estatus === 'Completado' ? 'Completado' : 'En proceso'} ({respondidas.length}/{c.referencias.length} referencias respondidas)</td></tr>
          </tbody>
        </table>

        <h2>Resultado general</h2>
        {score.disponible ? (
          <>
            <div className="score-general" style={{ margin: '10px 0 16px' }}>
              <span className="num">{score.general}</span>
              <span className="de">/ 10</span>
              <span className={`chip ${score.semaforo}`} style={{ marginLeft: 10 }}>{score.etiqueta}</span>
            </div>
            {score.competencias.map((comp) => (
              <div className="comp" key={comp.nombre}>
                <div className="nombre"><span>{comp.nombre}</span><strong>{comp.valor}</strong></div>
                <div className="barra"><div style={{ width: `${comp.valor * 10}%` }} /></div>
              </div>
            ))}
            <p style={{ fontSize: 13 }}>
              {score.recontratarian} de {score.totalRespuestas} referentes volverían a contratar al candidato.
            </p>

            <h2>Análisis de comentarios</h2>
            <div className="dos-columnas">
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>Fortalezas más mencionadas</p>
                <ul className="lista-temas">
                  {c.fortalezas.length ? c.fortalezas.map((f, i) => <li key={i}>{f}</li>) : <li>Sin datos</li>}
                </ul>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>Áreas de oportunidad</p>
                <ul className="lista-temas">
                  {c.areasOportunidad.length ? c.areasOportunidad.map((f, i) => <li key={i}>{f}</li>) : <li>Sin datos</li>}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p>Aún no se reciben respuestas de las referencias.</p>
        )}

        <h2>Detalle por referencia</h2>
        {c.referencias.map((r) => (
          <div key={r.id} style={{ marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--borde)' }}>
            <p style={{ margin: '0 0 6px' }}>
              <strong>{r.nombreReferente}</strong> — {r.puestoReferente}{r.empresa ? `, ${r.empresa}` : ''} ({r.relacion}){' '}
              <span className={`chip ${r.estatus === 'Respondida' ? 'verde' : 'gris'}`}>{r.estatus}</span>
            </p>
            {r.estatus === 'Respondida' ? (
              <div style={{ fontSize: 13, color: 'var(--texto)' }}>
                <p style={{ margin: '4px 0' }}>
                  Periodo: {r.periodoTrabajado || '—'} · Puesto del candidato: {r.puestoCandidato || '—'} ·{' '}
                  ¿Recontrataría?: <strong>{r.recontrataria ? 'Sí' : 'No'}</strong> ·{' '}
                  Respondió: {formatoFecha(r.fechaRespuesta)}
                </p>
                <p style={{ margin: '4px 0' }}>
                  Responsabilidad {r.responsabilidad} · Equipo {r.trabajoEquipo} · Comunicación {r.comunicacion} ·{' '}
                  Liderazgo {r.liderazgo} · Integridad {r.integridad} · Técnico {r.conocimientoTecnico}
                </p>
                {r.comentarios && <p style={{ margin: '4px 0', fontStyle: 'italic' }}>“{r.comentarios}”</p>}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--gris)', margin: 0 }}>
                Sin respuesta. Invitación enviada el {formatoFecha(r.fechaEnvio)}
                {r.recordatorios ? ` · ${r.recordatorios} recordatorio(s) enviado(s)` : ''}.
              </p>
            )}
          </div>
        ))}

        <p style={{ fontSize: 11, color: 'var(--gris)', marginTop: 30 }}>
          Este reporte fue generado automáticamente por la plataforma Reference Hub. La información proviene
          directamente de las respuestas de los referentes y se trata de manera confidencial, exclusivamente
          para fines del proceso de evaluación.
        </p>
      </div>
    </div>
  )
}
