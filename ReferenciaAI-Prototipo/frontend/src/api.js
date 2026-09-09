import {
  isDemoMode,
  demoDashboard,
  demoCandidato,
  demoCorreos,
  demoCuestionario,
  DEMO_CANDIDATOS,
} from './demoData.js'

const BASE = '/api'

async function pedir(ruta, opciones) {
  const res = await fetch(`${BASE}${ruta}`, opciones)
  const datos = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(datos?.error || `Error del servidor (${res.status})`)
  }
  return datos
}

async function conDemo(ruta, liveFn, demoFn) {
  if (isDemoMode()) return demoFn()
  try {
    return await liveFn()
  } catch (err) {
    // Sin backend (Pages / local sin API): degradar a demo en vez de romper la UI
    console.warn('API no disponible, usando demo:', ruta, err.message)
    return demoFn()
  }
}

export const api = {
  dashboard: () =>
    conDemo('/dashboard', () => pedir('/dashboard'), () => demoDashboard()),

  candidato: (id) =>
    conDemo(`/candidatos/${id}`, () => pedir(`/candidatos/${id}`), () => demoCandidato(id)),

  crearCandidato: (dto) =>
    conDemo(
      '/candidatos',
      () =>
        pedir('/candidatos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto),
        }),
      () => ({
        id: String(DEMO_CANDIDATOS.length + 1),
        ...dto,
        estatus: 'En curso',
        fechaRegistro: new Date().toISOString(),
        score: { disponible: false },
        referencias: dto.referencias || [],
        demo: true,
      })
    ),

  enviarRecordatorio: (idReferencia) =>
    conDemo(
      `/referencias/${idReferencia}/recordatorio`,
      () => pedir(`/referencias/${idReferencia}/recordatorio`, { method: 'POST' }),
      () => ({ ok: true, idReferencia, demo: true })
    ),

  infoCuestionario: (token) =>
    conDemo(
      `/v1/publico/cuestionario/${token}`,
      () => pedir(`/v1/publico/cuestionario/${token}`),
      () => demoCuestionario(token)
    ),

  enviarRespuesta: (token, dto) =>
    conDemo(
      `/v1/publico/cuestionario/${token}`,
      () =>
        pedir(`/v1/publico/cuestionario/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto),
        }),
      () => ({ ok: true, token, demo: true })
    ),

  correos: () => conDemo('/correos', () => pedir('/correos'), () => demoCorreos()),
}

export function formatoFecha(iso) {
  if (!iso) return '—'
  const f = new Date(iso)
  return (
    f.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' +
    f.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  )
}

export function formatoDia(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}
