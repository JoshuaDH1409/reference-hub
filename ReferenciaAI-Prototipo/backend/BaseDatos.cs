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
    public DbSet<Pregunta> Preguntas => Set<Pregunta>();

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
    public static void Sembrar(AppDb db, bool isDevelopment = false)
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

        if (!db.Preguntas.Any())
        {
            var preguntasBase = new List<Pregunta>
            {
                // General
                new Pregunta { Area = "General", TextoPregunta = "¿Qué calificación le otorgaría a la puntualidad y cumplimiento de compromisos del candidato?" },
                new Pregunta { Area = "General", TextoPregunta = "¿Cómo califica la capacidad del candidato para adaptarse a cambios inesperados o nuevas directrices?" },
                new Pregunta { Area = "General", TextoPregunta = "¿En qué nivel evalúa la disposición del candidato para colaborar y hacer equipo con sus compañeros?" },
                new Pregunta { Area = "General", TextoPregunta = "¿Qué calificación le daría al nivel de ética profesional y honestidad demostrado por el candidato en el día a día?" },
                new Pregunta { Area = "General", TextoPregunta = "¿Cómo evalúa la actitud y capacidad del candidato para recibir retroalimentación constructiva y aplicarla?" },

                // Ventas
                new Pregunta { Area = "Ventas", TextoPregunta = "¿Cómo califica la habilidad del candidato para persuadir, manejar objeciones y cerrar negociaciones exitosamente?" },
                new Pregunta { Area = "Ventas", TextoPregunta = "¿Qué nivel de resiliencia y manejo de frustración demostró el candidato frente a rechazos o metas difíciles?" },
                new Pregunta { Area = "Ventas", TextoPregunta = "¿Cómo evalúa la proactividad del candidato para buscar nuevos prospectos y expandir la cartera de clientes?" },
                new Pregunta { Area = "Ventas", TextoPregunta = "¿En qué medida el candidato lograba construir y mantener relaciones de confianza a largo plazo con los clientes?" },
                new Pregunta { Area = "Ventas", TextoPregunta = "¿Qué calificación le daría a la habilidad del candidato para entender rápidamente las necesidades del cliente y ofrecer la solución adecuada?" },

                // Tecnología
                new Pregunta { Area = "Tecnología", TextoPregunta = "¿Cómo califica la capacidad analítica del candidato para diagnosticar y resolver problemas técnicos complejos?" },
                new Pregunta { Area = "Tecnología", TextoPregunta = "¿Qué nivel de calidad, orden y buenas prácticas mantenía el candidato en sus entregables?" },
                new Pregunta { Area = "Tecnología", TextoPregunta = "¿En qué medida el candidato demostró autonomía para investigar y aprender nuevas tecnologías por su cuenta?" },
                new Pregunta { Area = "Tecnología", TextoPregunta = "¿Cómo evalúa la capacidad del candidato para explicar conceptos técnicos de manera clara a personas de otras áreas?" },
                new Pregunta { Area = "Tecnología", TextoPregunta = "¿Qué calificación le otorgaría a la eficiencia del candidato para trabajar bajo presión en situaciones críticas?" },

                // Atención al Cliente
                new Pregunta { Area = "Atención al Cliente", TextoPregunta = "¿Cómo califica el nivel de empatía y paciencia del candidato al tratar con clientes molestos o situaciones tensas?" },
                new Pregunta { Area = "Atención al Cliente", TextoPregunta = "¿Qué nivel de claridad y asertividad demostró el candidato en su comunicación verbal y escrita con los usuarios?" },
                new Pregunta { Area = "Atención al Cliente", TextoPregunta = "¿En qué medida el candidato era resolutivo y capaz de solucionar quejas o problemas en el primer contacto?" },
                new Pregunta { Area = "Atención al Cliente", TextoPregunta = "¿Cómo evalúa la actitud del candidato para mantener la calidad del servicio bajo un alto volumen de solicitudes?" },
                new Pregunta { Area = "Atención al Cliente", TextoPregunta = "¿Qué calificación le daría a la vocación de servicio general y la disposición para exceder las expectativas del cliente?" },

                // Finanzas
                new Pregunta { Area = "Finanzas", TextoPregunta = "¿Cómo califica el nivel de atención al detalle y precisión del candidato en el manejo de cifras, presupuestos o reportes?" },
                new Pregunta { Area = "Finanzas", TextoPregunta = "¿Qué nivel de discreción e integridad demostró el candidato al trabajar con información financiera confidencial?" },
                new Pregunta { Area = "Finanzas", TextoPregunta = "¿En qué medida el candidato era capaz de organizar su tiempo para cumplir estrictamente con fechas límite críticas?" },
                new Pregunta { Area = "Finanzas", TextoPregunta = "¿Cómo evalúa la capacidad analítica del candidato para identificar riesgos, discrepancias o áreas de ahorro?" },
                new Pregunta { Area = "Finanzas", TextoPregunta = "¿Qué calificación le otorgaría a la rigurosidad del candidato para apegarse a políticas, normativas internas y procesos de cumplimiento?" }
            };
            db.Preguntas.AddRange(preguntasBase);
            db.SaveChanges();
        }

        // Nuevas Preguntas por Área (Escala 1 a 10)
        var nuevasPreguntas = new List<Pregunta>
        {
            // General
            new Pregunta { Area = "General", TextoPregunta = "¿En qué medida el candidato demuestra iniciativa para resolver problemas sin esperar a recibir instrucciones detalladas?" },
            new Pregunta { Area = "General", TextoPregunta = "¿Cómo califica la capacidad del candidato para mantener la calma y la claridad mental en situaciones de alta presión?" },
            new Pregunta { Area = "General", TextoPregunta = "¿Qué nivel de compromiso y lealtad mostró el candidato hacia los objetivos y valores de la empresa?" },
            new Pregunta { Area = "General", TextoPregunta = "¿En qué grado el candidato asume la responsabilidad de sus propios errores sin culpar a terceros ni buscar excusas?" },
            new Pregunta { Area = "General", TextoPregunta = "¿Cómo evalúa la capacidad del candidato para organizar sus prioridades y cumplir con múltiples tareas simultáneas de manera eficiente?" },

            // Ventas
            new Pregunta { Area = "Ventas", TextoPregunta = "¿Qué calificación le daría al conocimiento del candidato sobre el mercado, los competidores y el producto o servicio que estaba vendiendo?" },
            new Pregunta { Area = "Ventas", TextoPregunta = "¿En qué medida el candidato lograba cumplir o superar consistentemente sus cuotas y objetivos comerciales fijados?" },
            new Pregunta { Area = "Ventas", TextoPregunta = "¿Cómo evalúa la capacidad del candidato para realizar un seguimiento efectivo (follow-up) con los clientes sin llegar a ser invasivo?" },
            new Pregunta { Area = "Ventas", TextoPregunta = "¿Qué calificación le otorgaría a la habilidad del candidato para identificar oportunidades de upselling o ventas cruzadas?" },
            new Pregunta { Area = "Ventas", TextoPregunta = "¿Cómo califica la seguridad y eficacia del candidato al realizar presentaciones comerciales ante tomadores de decisiones?" },

            // Tecnología
            new Pregunta { Area = "Tecnología", TextoPregunta = "¿En qué grado el candidato se aseguraba de realizar pruebas adecuadas (testing) antes de liberar un desarrollo, cambio o implementación?" },
            new Pregunta { Area = "Tecnología", TextoPregunta = "¿Cómo evalúa la capacidad del candidato para documentar su código, sistemas o procesos de manera clara para el resto del equipo?" },
            new Pregunta { Area = "Tecnología", TextoPregunta = "¿Qué calificación le daría a la habilidad del candidato para integrarse y aportar valor dentro de marcos de trabajo ágiles (ej. Scrum)?" },
            new Pregunta { Area = "Tecnología", TextoPregunta = "¿Cómo califica la proactividad del candidato para identificar deuda técnica o sugerir mejoras arquitectónicas en los sistemas?" },
            new Pregunta { Area = "Tecnología", TextoPregunta = "¿En qué medida el candidato compartía su conocimiento técnico y servía como apoyo para desarrolladores de menor seniority?" },

            // Atención al Cliente
            new Pregunta { Area = "Atención al Cliente", TextoPregunta = "¿Qué calificación le daría a la habilidad del candidato para leer las emociones del cliente y ajustar su tono o discurso en consecuencia?" },
            new Pregunta { Area = "Atención al Cliente", TextoPregunta = "¿En qué medida el candidato lograba transformar una queja grave o mala experiencia en una situación de satisfacción y retención del cliente?" },
            new Pregunta { Area = "Atención al Cliente", TextoPregunta = "¿Cómo califica la agilidad del candidato para navegar por los sistemas internos mientras resolvía una consulta en vivo?" },
            new Pregunta { Area = "Atención al Cliente", TextoPregunta = "¿Qué nivel de precisión demostraba el candidato al proporcionar información sobre políticas, garantías o servicios, evitando dar datos erróneos?" },
            new Pregunta { Area = "Atención al Cliente", TextoPregunta = "¿Cómo evalúa la disciplina del candidato para dejar un registro claro, detallado y útil de cada interacción en el sistema de tickets o CRM?" },

            // Finanzas
            new Pregunta { Area = "Finanzas", TextoPregunta = "¿En qué grado el candidato lograba comunicar reportes o hallazgos financieros complejos de forma comprensible a directivos no financieros?" },
            new Pregunta { Area = "Finanzas", TextoPregunta = "¿Cómo califica la habilidad del candidato para optimizar procesos contables, reduciendo tiempos muertos o errores manuales?" },
            new Pregunta { Area = "Finanzas", TextoPregunta = "¿Qué calificación le otorgaría a la precisión y fiabilidad del candidato al realizar proyecciones de flujo de caja o análisis de rentabilidad?" },
            new Pregunta { Area = "Finanzas", TextoPregunta = "¿En qué medida el candidato se mantenía actualizado y aplicaba correctamente los cambios en la legislación fiscal, tributaria o contable?" },
            new Pregunta { Area = "Finanzas", TextoPregunta = "¿Cómo evalúa la capacidad y criterio del candidato para custodiar los recursos de la empresa y detectar posibles fugas de capital o gastos innecesarios?" }
        };

        foreach (var np in nuevasPreguntas)
        {
            if (!db.Preguntas.Any(p => p.TextoPregunta == np.TextoPregunta))
            {
                db.Preguntas.Add(np);
            }
        }
        db.SaveChanges();

        if (db.Candidatos.Count() >= 10) return;

        var rand = new Random();
        var hoy = DateTime.Now;
        var nombres = new[] { "Ana", "Carlos", "María", "José", "Daniela", "Luis", "Patricia", "Roberto", "Sofía", "Miguel", "Lucía", "Jorge", "Carmen", "Fernando", "Elena", "Diego", "Valeria", "Ricardo", "Camila", "Javier" };
        var apellidos = new[] { "López", "Mendoza", "Ruiz", "Torres", "Aguilar", "Arredondo", "Beltrán", "García", "Martínez", "Sánchez", "Romero", "Vargas", "Gómez", "Flores", "Díaz", "Morales", "Ramírez", "Cruz" };
        var puestos = new[] { "Gerente de Proyectos TI", "Contador Senior", "Ejecutiva de Ventas", "Desarrollador Full Stack", "Analista de Datos", "Director Comercial", "Diseñador UX/UI", "Asesor Financiero", "Especialista en Marketing", "Ingeniero DevOps", "Scrum Master", "HR Business Partner" };
        var empresas = new[] { "Grupo Alfa", "Industrias Delta", "Comercial MX", "Consultores BETA", "Tech Solutions", "Finanzas Global", "Global Corp", "Innovación SA", "Latam Tech", "Servicios Omega" };

        var nuevosCandidatos = new List<Candidato>();
        // Generate 150 candidates for a rich realistic graph
        for (int i = 0; i < 150; i++)
        {
            var weight = rand.NextDouble();
            // 50% in last 30 days, 30% in 30-90 days, 20% in 90-360 days (creates peaks and valleys)
            int diasAtras = weight > 0.5 ? rand.Next(0, 30) : (weight > 0.2 ? rand.Next(30, 90) : rand.Next(90, 360));
            var fechaReg = hoy.AddDays(-diasAtras);
            
            // Completion rate changes slightly based on time (older are more likely completed)
            double completionChance = diasAtras > 30 ? 0.85 : 0.4;
            var isCompletado = rand.NextDouble() < completionChance; 
            
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
