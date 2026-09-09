const ahora = Date.now()
const dias = (n) => new Date(ahora - 86400000 * n).toISOString()

export const DEMO_CANDIDATOS = [
  {
    id: '1',
    nombre: 'Ana Martínez',
    email: 'ana.martinez@mail.com',
    puesto: 'Gerente de Finanzas',
    fechaRegistro: dias(5),
    estatus: 'Completado',
    avance: '3/3',
    score: {
      disponible: true,
      general: 9.2,
      semaforo: 'verde',
      etiqueta: 'Riesgo bajo',
      competencias: [
        { nombre: 'Liderazgo', valor: 9 },
        { nombre: 'Trabajo en equipo', valor: 9.5 },
        { nombre: 'Resolución de problemas', valor: 9 },
      ],
      recontratarian: 3,
      totalRespuestas: 3,
    },
    fortalezas: ['Comunicación clara', 'Criterio financiero', 'Liderazgo'],
    areasOportunidad: ['Delegar operación rutinaria'],
    referencias: [
      {
        id: 1,
        nombreReferente: 'Laura Gómez',
        email: 'laura@empresa.com',
        relacion: 'Jefa directa',
        empresa: 'FinCorp',
        estatus: 'Respondida',
        fechaRespuesta: dias(2),
      },
      {
        id: 2,
        nombreReferente: 'Miguel Ortiz',
        email: 'miguel@empresa.com',
        relacion: 'Colega',
        empresa: 'FinCorp',
        estatus: 'Respondida',
        fechaRespuesta: dias(1),
      },
      {
        id: 3,
        nombreReferente: 'Sofía Reyes',
        email: 'sofia@cliente.com',
        relacion: 'Cliente',
        empresa: 'Cliente SA',
        estatus: 'Respondida',
        fechaRespuesta: dias(1),
      },
    ],
    timeline: [
      { id: 1, fecha: dias(5), titulo: 'Candidato registrado', detalle: 'Alta en Reference Hub.', icono: 'person_add' },
      { id: 2, fecha: dias(5), titulo: 'Invitaciones enviadas', detalle: '3 correos a referentes.', icono: 'mail' },
      { id: 3, fecha: dias(2), titulo: 'Respuestas recibidas', detalle: 'Cuestionarios completados.', icono: 'mark_email_read' },
    ],
  },
  {
    id: '2',
    nombre: 'Diego Herrera',
    email: 'diego.herrera@mail.com',
    puesto: 'Ingeniero de Software',
    fechaRegistro: dias(3),
    estatus: 'En curso',
    avance: '1/3',
    score: {
      disponible: true,
      general: 7.4,
      semaforo: 'amarillo',
      etiqueta: 'Riesgo medio',
      competencias: [
        { nombre: 'Liderazgo', valor: 7 },
        { nombre: 'Trabajo en equipo', valor: 8 },
        { nombre: 'Resolución de problemas', valor: 7.5 },
      ],
      recontratarian: 1,
      totalRespuestas: 1,
    },
    fortalezas: ['Entrega consistente'],
    areasOportunidad: ['Comunicación con stakeholders'],
    referencias: [
      {
        id: 4,
        nombreReferente: 'Patricia Ruiz',
        email: 'patricia@tech.com',
        relacion: 'Jefa directa',
        empresa: 'TechLabs',
        estatus: 'Respondida',
        fechaRespuesta: dias(1),
      },
      {
        id: 5,
        nombreReferente: 'Andrés Vega',
        email: 'andres@tech.com',
        relacion: 'Colega',
        empresa: 'TechLabs',
        estatus: 'Pendiente',
        recordatorios: 1,
        token: 'demo-token-2',
      },
      {
        id: 6,
        nombreReferente: 'Elena Cruz',
        email: 'elena@tech.com',
        relacion: 'Mentor',
        empresa: 'TechLabs',
        estatus: 'Pendiente',
        recordatorios: 0,
        token: 'demo-token-3',
      },
    ],
    timeline: [
      { id: 1, fecha: dias(3), titulo: 'Candidato registrado', detalle: 'Proceso iniciado.', icono: 'person_add' },
      { id: 2, fecha: dias(1), titulo: 'Primera respuesta', detalle: 'Patricia Ruiz respondió.', icono: 'mark_email_read' },
    ],
  },
  {
    id: '3',
    nombre: 'Camila Soto',
    email: 'camila.soto@mail.com',
    puesto: 'Diseñadora de Producto',
    fechaRegistro: dias(8),
    estatus: 'Completado',
    avance: '2/2',
    score: {
      disponible: true,
      general: 8.6,
      semaforo: 'verde',
      etiqueta: 'Riesgo bajo',
      competencias: [
        { nombre: 'Liderazgo', valor: 8 },
        { nombre: 'Trabajo en equipo', valor: 9 },
        { nombre: 'Resolución de problemas', valor: 8.5 },
      ],
      recontratarian: 2,
      totalRespuestas: 2,
    },
    fortalezas: ['Criterio de UX', 'Colaboración'],
    areasOportunidad: ['Priorización bajo presión'],
    referencias: [
      {
        id: 7,
        nombreReferente: 'Iván Paredes',
        email: 'ivan@studio.com',
        relacion: 'Jefe directo',
        empresa: 'Studio Norte',
        estatus: 'Respondida',
        fechaRespuesta: dias(4),
      },
      {
        id: 8,
        nombreReferente: 'Natalia Peña',
        email: 'natalia@studio.com',
        relacion: 'Colega',
        empresa: 'Studio Norte',
        estatus: 'Respondida',
        fechaRespuesta: dias(3),
      },
    ],
    timeline: [
      { id: 1, fecha: dias(8), titulo: 'Candidato registrado', detalle: 'Alta completa.', icono: 'person_add' },
      { id: 2, fecha: dias(3), titulo: 'Proceso cerrado', detalle: 'Referencias suficientes.', icono: 'check_circle' },
    ],
  },
  {
    id: '4',
    nombre: 'Jorge Beltrán',
    email: 'jorge.beltran@mail.com',
    puesto: 'Analista de Datos',
    fechaRegistro: dias(1),
    estatus: 'En curso',
    avance: '0/3',
    score: { disponible: false },
    fortalezas: [],
    areasOportunidad: [],
    referencias: [
      {
        id: 9,
        nombreReferente: 'Mónica Díaz',
        email: 'monica@data.com',
        relacion: 'Jefa directa',
        empresa: 'DataWorks',
        estatus: 'Pendiente',
        recordatorios: 0,
        token: 'demo-token-4',
      },
    ],
    timeline: [
      { id: 1, fecha: dias(1), titulo: 'Candidato registrado', detalle: 'Esperando referencias.', icono: 'person_add' },
    ],
  },
]

export function demoDashboard() {
  const candidatos = DEMO_CANDIDATOS
  const procesosEnCurso = candidatos.filter((c) => c.estatus === 'En curso').length
  const procesosConcluidos = candidatos.filter((c) => c.estatus === 'Completado').length
  let enviadas = 0
  let recibidas = 0
  let pendientes = 0
  for (const c of candidatos) {
    for (const r of c.referencias || []) {
      enviadas += 1
      if (r.estatus === 'Respondida') recibidas += 1
      else pendientes += 1
    }
  }
  return {
    totalCandidatos: candidatos.length,
    procesosEnCurso,
    procesosConcluidos,
    referenciasEnviadas: enviadas,
    referenciasRecibidas: recibidas,
    referenciasPendientes: pendientes,
    tiempoPromedioDias: 2.1,
    candidatos,
  }
}

export function demoCandidato(id) {
  return DEMO_CANDIDATOS.find((c) => String(c.id) === String(id)) || DEMO_CANDIDATOS[0]
}

export function demoCorreos() {
  return [
    {
      id: '1',
      tipo: 'Invitación',
      asunto: 'Referencia solicitada para Ana Martínez',
      para: 'laura@empresa.com',
      fecha: dias(4),
      cuerpo:
        'Hola Laura,\n\nAna Martínez te designó como referencia para Gerente de Finanzas.\nResponde el cuestionario desde Reference Hub.\n\nSaludos',
    },
    {
      id: '2',
      tipo: 'Recordatorio',
      asunto: 'Recordatorio: referencia Diego Herrera',
      para: 'andres@tech.com',
      fecha: dias(0),
      cuerpo: 'Hola Andrés,\n\nRecordatorio amable para completar la referencia de Diego Herrera.\n\nSaludos',
    },
  ]
}

export function demoCuestionario(token) {
  return {
    token,
    candidato: 'Ana Martínez',
    puesto: 'Gerente de Finanzas',
    referente: 'Laura Gómez',
    empresa: 'FinCorp',
    preguntas: [
      { id: 1, texto: '¿Cómo describirías su desempeño general?', tipo: 'texto' },
      { id: 2, texto: '¿La recontratarías?', tipo: 'opcion', opciones: ['Sí', 'No', 'Depende'] },
    ],
    yaRespondido: false,
  }
}

export function isDemoMode() {
  if (import.meta.env.VITE_DEMO === 'true') return true
  if (typeof window === 'undefined') return false
  const host = window.location.hostname || ''
  if (host.endsWith('github.io')) return true
  const q = new URLSearchParams(window.location.search)
  return q.get('demo') === '1'
}
