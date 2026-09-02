import { useEffect, useState } from 'react'
import { api, formatoFecha } from '../api.js'

const correosDemo = [
  {
    id: "1",
    tipo: "Invitación",
    asunto: "Referencia solicitada para Ana Martínez",
    para: "carlos@empresa.com",
    fecha: new Date(Date.now() - 86400000 * 2).toISOString(),
    cuerpo: "Hola Carlos,\n\nAna Martínez te ha designado como referencia profesional para el puesto de Gerente de Finanzas.\nPor favor responde el siguiente cuestionario: https://referencia.ai/responder/demo-token\n\nSaludos,\nEquipo de Reclutamiento"
  },
  {
    id: "2",
    tipo: "Recordatorio",
    asunto: "Recordatorio: Referencia solicitada para Ana Martínez",
    para: "elon@tesla.com",
    fecha: new Date().toISOString(),
    cuerpo: "Hola Elon,\n\nEste es un recordatorio amable de que Ana Martínez te ha designado como referencia profesional.\nEl enlace caduca pronto, por favor accede aquí: https://referencia.ai/responder/demo-token\n\nSaludos,\nEquipo de Reclutamiento"
  }
];

export default function Correos() {
  const [correos, setCorreos] = useState(null)
  const [error, setError] = useState('')
  const [abierto, setAbierto] = useState(null)

  useEffect(() => {
    api.correos().then(setCorreos).catch((e) => {
      console.warn("API Error, using demo data:", e.message)
      setCorreos(correosDemo)
    })
  }, [])

  if (error) return <div className="error-msg">{error}</div>
  if (!correos) return <p className="subtitulo">Cargando…</p>

  return (
    <>
      <h1>Correos enviados</h1>
      <p className="subtitulo">
        Bandeja de demostración: aquí se muestran los correos que la plataforma enviaría automáticamente
        (en producción se envían por SMTP real).
      </p>

      {correos.map((c) => (
        <div className="tarjeta correo" key={c.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className={`chip ${c.tipo === 'Recordatorio' ? 'amarillo' : 'azul'}`}>{c.tipo}</span>{' '}
              <strong style={{ marginLeft: 6 }}>{c.asunto}</strong>
              <div className="meta">Para: {c.para} · {formatoFecha(c.fecha)}</div>
            </div>
            <button className="boton chico secundario" onClick={() => setAbierto(abierto === c.id ? null : c.id)}>
              {abierto === c.id ? 'Cerrar' : 'Ver contenido'}
            </button>
          </div>
          {abierto === c.id && <pre>{c.cuerpo}</pre>}
        </div>
      ))}

      {correos.length === 0 && <div className="tarjeta">Aún no se han enviado correos.</div>}
    </>
  )
}
