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
        private readonly ILogger<ReminderAgentService> _logger;

        public ReminderAgentService(AppDb db, ILogger<ReminderAgentService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task ProcessRemindersAsync()
        {
            _logger.LogInformation("Iniciando ejecución de ProcessRemindersAsync (Agente de Recordatorios)...");

            // 1. Buscar referencias en estado "Pendiente"
            var referenciasPendientes = await _db.Referencias
                .Include(r => r.Candidato)
                .Where(r => r.Estatus == "Pendiente" && r.Candidato != null)
                .ToListAsync();

            if (!referenciasPendientes.Any())
            {
                _logger.LogInformation("No hay referencias pendientes por procesar.");
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
                // Multiplicamos por (Recordatorios + 1) para saber si ya pasó el tiempo para el siguiente recordatorio.
                var tiempoTranscurrido = ahora - referencia.FechaEnvio;
                
                if (tiempoTranscurrido.TotalHours >= (horasIntervalo * (referencia.Recordatorios + 1)))
                {
                    // 3. Simular el envío de correo usando ILogger en lugar de gastar cuotas
                    _logger.LogInformation(
                        "Simulando envío de recordatorio para la referencia {NombreReferente} del candidato {Nombre} para la vacante {Puesto}",
                        referencia.NombreReferente,
                        referencia.Candidato.Nombre,
                        referencia.Candidato.Puesto
                    );

                    // Actualizamos el contador de recordatorios en la base de datos
                    referencia.Recordatorios++;
                }
            }

            // Guardar los cambios (incremento de recordatorios)
            await _db.SaveChangesAsync();
            _logger.LogInformation("Finalizó la ejecución del Agente de Recordatorios.");
        }
    }
}
