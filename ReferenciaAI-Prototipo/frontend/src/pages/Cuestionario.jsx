import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api.js'

const COMPETENCIAS = [
  ['responsabilidad', 'Responsabilidad'],
  ['trabajoEquipo', 'Trabajo en equipo'],
  ['comunicacion', 'Comunicación'],
  ['liderazgo', 'Liderazgo'],
  ['integridad', 'Integridad'],
  ['conocimientoTecnico', 'Conocimiento técnico'],
]

export default function Cuestionario() {
  const { token } = useParams()
  const [info, setInfo] = useState(null)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const [valores, setValores] = useState({
    responsabilidad: 8, trabajoEquipo: 8, comunicacion: 8,
    liderazgo: 8, integridad: 8, conocimientoTecnico: 8,
  })
  const [recontrataria, setRecontrataria] = useState('si')
  const [periodoTrabajado, setPeriodoTrabajado] = useState('')
  const [puestoCandidato, setPuestoCandidato] = useState('')
  const [fortalezas, setFortalezas] = useState('')
  const [areasOportunidad, setAreasOportunidad] = useState('')
  const [comentarios, setComentarios] = useState('')

  useEffect(() => {
    api.infoCuestionario(token).then(setInfo).catch((e) => setError(e.message))
  }, [token])

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await api.enviarRespuesta(token, {
        responsabilidad: Number(valores.responsabilidad),
        trabajoEquipo: Number(valores.trabajoEquipo),
        comunicacion: Number(valores.comunicacion),
        liderazgo: Number(valores.liderazgo),
        integridad: Number(valores.integridad),
        conocimientoTecnico: Number(valores.conocimientoTecnico),
        recontrataria: recontrataria === 'si',
        periodoTrabajado, puestoCandidato, fortalezas, areasOportunidad, comentarios,
      })
      setEnviado(true)
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="publico">
      <div className="encabezado">
        <div className="logo">Reference <span>Hub</span></div>
        <div style={{ fontSize: 12, color: 'var(--gris)' }}>Referencia AI · Secure link</div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {!info && !error && <p className="subtitulo">Cargando…</p>}

      {info && info.yaRespondida && !enviado && (
        <div className="exito">Este cuestionario ya fue respondido anteriormente. Gracias por su participación.</div>
      )}

      {enviado && (
        <div className="exito">
          <strong>¡Gracias, {info.referente}!</strong><br />
          Su respuesta fue registrada correctamente. Puede cerrar esta ventana.
        </div>
      )}

      {info && !info.yaRespondida && !enviado && (
        <>
          <div className="tarjeta seccion">
            <p style={{ margin: 0, fontSize: 14 }}>
              Estimado(a) <strong>{info.referente}</strong>{info.empresa ? ` (${info.empresa})` : ''}:{' '}
              <strong>{info.candidato}</strong> lo(a) señaló como referencia laboral para la vacante de{' '}
              <strong>{info.puesto || 'un puesto en evaluación'}</strong>. Le tomará menos de 5 minutos.
              Sus respuestas son confidenciales.
            </p>
          </div>

          <form onSubmit={enviar}>
            <div className="tarjeta seccion">
              <strong>1. Información general</strong>
              <div className="fila-campos" style={{ marginTop: 14 }}>
                <div className="campo">
                  <label>¿En qué periodo trabajaron juntos?</label>
                  <input type="text" placeholder="Ej. 2019 - 2024" value={periodoTrabajado}
                    onChange={(e) => setPeriodoTrabajado(e.target.value)} />
                </div>
                <div className="campo">
                  <label>¿Qué puesto ocupaba el candidato?</label>
                  <input type="text" value={puestoCandidato}
                    onChange={(e) => setPuestoCandidato(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="tarjeta seccion">
              <strong>2. Evaluación por competencias</strong>
              <p style={{ fontSize: 13, color: 'var(--gris)' }}>Califique de 0 (deficiente) a 10 (excelente).</p>
              {COMPETENCIAS.map(([clave, nombre]) => (
                <div className="campo" key={clave}>
                  <label>{nombre}</label>
                  <div className="rango">
                    <input type="range" min="0" max="10" step="0.5"
                      value={valores[clave]}
                      onChange={(e) => setValores((v) => ({ ...v, [clave]: e.target.value }))} />
                    <span className="valor-rango">{valores[clave]}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="tarjeta seccion">
              <strong>3. Opinión general</strong>
              <div className="campo" style={{ marginTop: 14 }}>
                <label>¿Volvería a contratar a esta persona?</label>
                <select value={recontrataria} onChange={(e) => setRecontrataria(e.target.value)}>
                  <option value="si">Sí, sin dudarlo</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="campo">
                <label>Principales fortalezas (separadas por comas)</label>
                <textarea rows="2" value={fortalezas} onChange={(e) => setFortalezas(e.target.value)}
                  placeholder="Ej. Liderazgo, comunicación, cumple compromisos" />
              </div>
              <div className="campo">
                <label>Áreas de oportunidad (separadas por comas)</label>
                <textarea rows="2" value={areasOportunidad} onChange={(e) => setAreasOportunidad(e.target.value)}
                  placeholder="Ej. Delegación, manejo del tiempo" />
              </div>
              <div className="campo">
                <label>Comentarios adicionales</label>
                <textarea rows="3" value={comentarios} onChange={(e) => setComentarios(e.target.value)} />
              </div>
            </div>

            <button className="boton" type="submit" disabled={enviando} style={{ marginBottom: 40 }}>
              {enviando ? 'Enviando…' : 'Enviar respuesta'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
