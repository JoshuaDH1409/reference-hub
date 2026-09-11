using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ReferenciaAI.Api;

namespace ReferenciaAI.Api
{
    public class ReminderAgentService
    {
        private readonly AppDb _db;
        private readonly IEmailService _emailService;
        private readonly ILogger<ReminderAgentService> _logger;

        public ReminderAgentService(AppDb db, IEmailService emailService, ILogger<ReminderAgentService> logger)
        {
            _db = db;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task ProcessRemindersAsync()
        {
            _logger.LogInformation("Iniciando ejecución de ProcessRemindersAsync (Agente de Recordatorios)...");

            // 1. Buscar referencias en estado "Pendiente" y con menos de 3 recordatorios enviados
            var referenciasPendientes = await _db.Referencias
                .Include(r => r.Candidato)
                .Where(r => r.Estatus == "Pendiente" && r.Candidato != null && r.Recordatorios < 3)
                .ToListAsync();

            if (!referenciasPendientes.Any())
            {
                _logger.LogInformation("No hay referencias pendientes elegibles para recordatorio.");
                return;
            }

            var ahora = DateTime.Now;

            foreach (var referencia in referenciasPendientes)
            {
                var puesto = referencia.Candidato!.Puesto.ToLower();
                
                // 2. Calcular si es momento de enviar un recordatorio basándose en el "puesto".
                // Puestos directivos tienen recordatorios cada 48h, operativos cada 24h.
                bool esPuestoDirectivo = puesto.Contains("director") || puesto.Contains("gerente") || puesto.Contains("vp") || puesto.Contains("jefe");
                
                int horasIntervalo = esPuestoDirectivo ? 48 : 24;
                
                // Calcular tiempo transcurrido desde la fecha de envío.
                var tiempoTranscurrido = ahora - referencia.FechaEnvio;
                
                if (tiempoTranscurrido.TotalHours >= (horasIntervalo * (referencia.Recordatorios + 1)))
                {
                    _logger.LogInformation(
                        "Enviando recordatorio #{Num} para la referencia {NombreReferente} del candidato {Nombre} para la vacante {Puesto}",
                        referencia.Recordatorios + 1,
                        referencia.NombreReferente,
                        referencia.Candidato.Nombre,
                        referencia.Candidato.Puesto
                    );

                    // 3. Generar el correo de recordatorio
                    var correo = Notificaciones.CorreoRecordatorio(referencia.Candidato, referencia, referencia.Recordatorios + 1);
                    _db.Correos.Add(correo);

                    try
                    {
                        // Enviar el correo real
                        await _emailService.EnviarCorreoAsync(correo);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error al enviar el correo de recordatorio a {Email}", referencia.Email);
                        // Continuamos para no detener el agente, pero el recordatorio cuenta como intentado (opcional)
                    }

                    // Registrar en la línea de tiempo del candidato
                    _db.Eventos.Add(new EventoTimeline
                    {
                        CandidatoId = referencia.CandidatoId,
                        Titulo = "Recordatorio automático enviado",
                        Detalle = $"A: {referencia.NombreReferente} (Intento #{referencia.Recordatorios + 1})"
                    });

                    // 4. Actualizamos el contador de recordatorios en la base de datos
                    referencia.Recordatorios++;
                }
            }

            // Guardar todos los cambios (correos, eventos, incrementos)
            await _db.SaveChangesAsync();
            _logger.LogInformation("Finalizó la ejecución del Agente de Recordatorios.");
        }
    }
}
