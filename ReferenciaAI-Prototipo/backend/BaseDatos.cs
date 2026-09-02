using Microsoft.EntityFrameworkCore;

namespace ReferenciaAI.Api;

public class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> opciones) : base(opciones) { }

    public DbSet<Candidato> Candidatos => Set<Candidato>();
    public DbSet<Referencia> Referencias => Set<Referencia>();
    public DbSet<EventoTimeline> Eventos => Set<EventoTimeline>();
    public DbSet<CorreoSimulado> Correos => Set<CorreoSimulado>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<ReporteDashboard> ReportesDashboard => Set<ReporteDashboard>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Candidato>()
          .HasMany(c => c.Referencias)
          .WithOne(r => r.Candidato)
          .HasForeignKey(r => r.CandidatoId)
          .OnDelete(DeleteBehavior.Cascade);

        mb.Entity<Candidato>()
          .HasOne(c => c.Reporte)
          .WithOne(r => r.Candidato)
          .HasForeignKey<ReporteDashboard>(r => r.CandidatoId)
          .OnDelete(DeleteBehavior.Cascade);
    }
}

public static class DatosIniciales
{
    public static void Sembrar(AppDb db)
    {
        if (!db.Usuarios.Any())
        {
            db.Usuarios.Add(new Usuario
            {
                Nombre = "Administrador",
                Email = "admin@ejemplo.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!")
            });
            db.SaveChanges();
        }

        if (db.Candidatos.Count() >= 10) return;

        var rand = new Random();
        var hoy = DateTime.Now;
        var nombres = new[] { "Ana", "Carlos", "María", "José", "Daniela", "Luis", "Patricia", "Roberto", "Sofía", "Miguel", "Lucía", "Jorge", "Carmen", "Fernando", "Elena" };
        var apellidos = new[] { "López", "Mendoza", "Ruiz", "Torres", "Aguilar", "Arredondo", "Beltrán", "García", "Martínez", "Sánchez", "Romero", "Vargas" };
        var puestos = new[] { "Gerente de Proyectos TI", "Contador Senior", "Ejecutiva de Ventas", "Desarrollador Full Stack", "Analista de Datos", "Director Comercial", "Diseñador UX/UI", "Asesor Financiero", "Especialista en Marketing" };
        var empresas = new[] { "Grupo Alfa", "Industrias Delta", "Comercial MX", "Consultores BETA", "Tech Solutions", "Finanzas Global", "Global Corp", "Innovación SA" };

        var nuevosCandidatos = new List<Candidato>();
        // Generate 60 candidates
        for (int i = 0; i < 60; i++)
        {
            var diasAtras = rand.Next(0, 360); // Spread across 12 months
            var fechaReg = hoy.AddDays(-diasAtras);
            var isCompletado = rand.NextDouble() > 0.3; // 70% completed, 30% in progress
            
            var nombreCompleto = $"{nombres[rand.Next(nombres.Length)]} {apellidos[rand.Next(apellidos.Length)]} {apellidos[rand.Next(apellidos.Length)]}";
            
            var c = new Candidato
            {
                Nombre = nombreCompleto,
                Email = $"{nombreCompleto.Replace(" ", ".").ToLower()}@ejemplo.com",
                Puesto = puestos[rand.Next(puestos.Length)],
                FechaRegistro = fechaReg,
                Estatus = isCompletado ? "Completado" : "EnProceso"
            };

            int numRefs = rand.Next(2, 5); // 2 to 4 references
            for (int r = 0; r < numRefs; r++)
            {
                var refRespondida = isCompletado || rand.NextDouble() > 0.5; // If completed, all responded. If not, 50% chance.
                var nombreRef = $"{nombres[rand.Next(nombres.Length)]} {apellidos[rand.Next(apellidos.Length)]}";
                var empresaRef = empresas[rand.Next(empresas.Length)];
                var fechaEnvio = fechaReg.AddHours(rand.Next(1, 48));

                if (refRespondida)
                {
                    var fechaRespuesta = fechaEnvio.AddDays(rand.NextDouble() * 5 + 0.5); // Replied between 0.5 and 5 days later
                    var scoreBase = rand.NextDouble() * 3 + 7; // Scores between 7 and 10
                    c.Referencias.Add(RespuestaEjemplo(
                        nombreRef, empresaRef, "Cargo de Referencia", "Jefe directo",
                        $"{nombreRef.Replace(" ", ".").ToLower()}@ejemplo.com", "555-000-0000",
                        fechaEnvio, fechaRespuesta,
                        Math.Min(10, scoreBase + rand.NextDouble() * 2 - 1),
                        Math.Min(10, scoreBase + rand.NextDouble() * 2 - 1),
                        Math.Min(10, scoreBase + rand.NextDouble() * 2 - 1),
                        Math.Min(10, scoreBase + rand.NextDouble() * 2 - 1),
                        Math.Min(10, scoreBase + rand.NextDouble() * 2 - 1),
                        Math.Min(10, scoreBase + rand.NextDouble() * 2 - 1),
                        scoreBase > 8,
                        "2020 - 2023", c.Puesto,
                        "Compromiso, Liderazgo", "Delegación", "Excelente profesional."
                    ));
                }
                else
                {
                    c.Referencias.Add(new Referencia
                    {
                        NombreReferente = nombreRef,
                        Empresa = empresaRef,
                        PuestoReferente = "Cargo de Referencia",
                        Relacion = "Jefe directo",
                        Email = $"{nombreRef.Replace(" ", ".").ToLower()}@ejemplo.com",
                        Telefono = "555-000-0000",
                        FechaEnvio = fechaEnvio,
                        Estatus = "Pendiente",
                        Recordatorios = rand.Next(0, 3)
                    });
                }
            }
            db.Candidatos.Add(c);
            nuevosCandidatos.Add(c);
        }
        db.SaveChanges();

        // ---- Timeline y correos simulados ----
        foreach (var cand in nuevosCandidatos)
        {
            db.Eventos.Add(new EventoTimeline
            {
                CandidatoId = cand.Id,
                Fecha = cand.FechaRegistro,
                Titulo = "Candidato registrado",
                Detalle = $"Vacante: {cand.Puesto}"
            });
            foreach (var r in cand.Referencias)
            {
                db.Eventos.Add(new EventoTimeline
                {
                    CandidatoId = cand.Id,
                    Fecha = r.FechaEnvio.AddMinutes(5),
                    Titulo = "Invitación enviada",
                    Detalle = $"{r.NombreReferente} ({r.Email})"
                });
                db.Correos.Add(Notificaciones.CorreoInvitacion(cand, r));
                if (r.Recordatorios > 0)
                {
                    db.Eventos.Add(new EventoTimeline
                    {
                        CandidatoId = cand.Id,
                        Fecha = r.FechaEnvio.AddDays(1),
                        Titulo = "Recordatorio enviado",
                        Detalle = r.NombreReferente
                    });
                    db.Correos.Add(Notificaciones.CorreoRecordatorio(cand, r));
                }
                if (r.Estatus == "Respondida" && r.FechaRespuesta != null)
                {
                    db.Eventos.Add(new EventoTimeline
                    {
                        CandidatoId = cand.Id,
                        Fecha = r.FechaRespuesta.Value,
                        Titulo = "Referencia respondida",
                        Detalle = r.NombreReferente
                    });
                }
            }
            if (cand.Estatus == "Completado")
            {
                var ultima = cand.Referencias.Max(r => r.FechaRespuesta) ?? cand.FechaRegistro;
                db.Eventos.Add(new EventoTimeline
                {
                    CandidatoId = cand.Id,
                    Fecha = ultima.AddMinutes(10),
                    Titulo = "Proceso completado",
                    Detalle = "Reporte disponible"
                });

                var respondidas = cand.Referencias.Where(r => r.Estatus == "Respondida").ToList();
                double? tiempoPromedio = respondidas.Any() ? Math.Round(respondidas.Average(r => (r.FechaRespuesta!.Value - r.FechaEnvio).TotalDays), 1) : null;
                var baseCalc = cand.Referencias.Select(r => new { r.Responsabilidad, r.TrabajoEquipo, r.Comunicacion, r.Liderazgo, r.Integridad, r.ConocimientoTecnico, r.Recontrataria });
                
                // Score simple para demo (promedio de todos)
                double sum = 0;
                int count = 0;
                foreach(var b in baseCalc)
                {
                    if(b.Responsabilidad.HasValue) { sum += b.Responsabilidad.Value; count++; }
                    if(b.TrabajoEquipo.HasValue) { sum += b.TrabajoEquipo.Value; count++; }
                    if(b.Comunicacion.HasValue) { sum += b.Comunicacion.Value; count++; }
                    if(b.Liderazgo.HasValue) { sum += b.Liderazgo.Value; count++; }
                    if(b.Integridad.HasValue) { sum += b.Integridad.Value; count++; }
                    if(b.ConocimientoTecnico.HasValue) { sum += b.ConocimientoTecnico.Value; count++; }
                }
                
                db.ReportesDashboard.Add(new ReporteDashboard
                {
                    CandidatoId = cand.Id,
                    TotalReferencias = cand.Referencias.Count,
                    ReferenciasRespondidas = respondidas.Count,
                    Avance = 100,
                    ScoreGlobal = count > 0 ? Math.Round(sum / count, 1) : 0,
                    TiempoPromedioDias = tiempoPromedio,
                    FechaGeneracion = ultima.AddMinutes(15)
                });
            }
        }
        db.SaveChanges();
    }

    private static Referencia RespuestaEjemplo(
        string nombre, string empresa, string puesto, string relacion, string email, string tel,
        DateTime envio, DateTime respuesta,
        double resp, double equipo, double com, double lid, double integ, double tec, bool recontrata,
        string periodo, string puestoCand, string fortalezas, string oportunidades, string comentarios)
    {
        return new Referencia
        {
            NombreReferente = nombre,
            Empresa = empresa,
            PuestoReferente = puesto,
            Relacion = relacion,
            Email = email,
            Telefono = tel,
            FechaEnvio = envio,
            FechaRespuesta = respuesta,
            Estatus = "Respondida",
            Responsabilidad = resp,
            TrabajoEquipo = equipo,
            Comunicacion = com,
            Liderazgo = lid,
            Integridad = integ,
            ConocimientoTecnico = tec,
            Recontrataria = recontrata,
            PeriodoTrabajado = periodo,
            PuestoCandidato = puestoCand,
            Fortalezas = fortalezas,
            AreasOportunidad = oportunidades,
            Comentarios = comentarios
        };
    }
}
