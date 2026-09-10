const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

async function pedir(ruta, opciones) {
  const res = await fetch(`${BASE}${ruta}`, opciones)
  const datos = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(datos?.error || `Error del servidor (${res.status})`)
  }
  return datos
}

export const api = {
  dashboard: () => pedir('/dashboard'),
  candidato: (id) => pedir(`/candidatos/${id}`),
  crearCandidato: (dto) =>
    pedir('/candidatos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }),
  importarCandidatosExcel: (formData) =>
    pedir('/v1/candidatos/importar', {
      method: 'POST',
      body: formData,
    }),
  enviarRecordatorio: (idReferencia) =>
    pedir(`/referencias/${idReferencia}/recordatorio`, { method: 'POST' }),
  infoCuestionario: (token) => pedir(`/v1/publico/cuestionario/${token}`),
  enviarRespuesta: (token, dto) =>
    pedir(`/v1/publico/cuestionario/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }),
  correos: () => pedir('/correos'),
}

export function formatoFecha(iso) {
  if (!iso) return '—'
  const f = new Date(iso)
  return f.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + f.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export function formatoDia(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}
