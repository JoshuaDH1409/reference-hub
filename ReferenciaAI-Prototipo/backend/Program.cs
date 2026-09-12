using Microsoft.EntityFrameworkCore;
using ReferenciaAI.Api;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Hangfire;
using Hangfire.SqlServer;
using Hangfire.MemoryStorage;

// ... (top of file remains) ...

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddDbContext<AppDb>(o => o.UseSqlite("Data Source=referencia_ai.db"));
}
else
{
    builder.Services.AddDbContext<AppDb>(o => o.UseSqlServer(connectionString));
}
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var key = Encoding.ASCII.GetBytes("ESTA_ES_UNA_CLAVE_SECRETA_MUY_LARGA_Y_SEGURA_12345");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(x =>
    {
        x.RequireHttpsMetadata = false;
        x.SaveToken = true;
        x.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<IPdfReportService, PdfReportService>();

// Configuración de Hangfire
builder.Services.AddHangfire(configuration => {
    configuration
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings();

    if (builder.Environment.IsDevelopment())
    {
        configuration.UseMemoryStorage();
    }
    else
    {
        configuration.UseSqlServerStorage(connectionString);
    }
});

// Iniciar el servidor de Hangfire
builder.Services.AddHangfireServer();

var app = builder.Build();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Crear base de datos (Migraciones) y sembrar datos
using (var alcance = app.Services.CreateScope())
{
    var db = alcance.ServiceProvider.GetRequiredService<AppDb>();
    db.Database.Migrate();
    DatosIniciales.Sembrar(db, app.Environment.IsDevelopment());
}

// Configurar el Dashboard de Hangfire en la ruta /hangfire
app.UseHangfireDashboard("/hangfire");

// Registrar el trabajo recurrente (CRON)
// Se ejecutará cada hora (0 * * * *)
RecurringJob.AddOrUpdate<ReminderAgentService>(
    "agente-recordatorios",
    agente => agente.ProcessRemindersAsync(),
    Cron.Hourly);

// ===================== Auth =====================

app.MapPost("/api/auth/registro", async (AppDb db, RegistroDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        return Results.BadRequest(new { error = "Email y password son obligatorios" });
        
    if (await db.Usuarios.AnyAsync(u => u.Email == dto.Email))
        return Results.BadRequest(new { error = "El usuario ya existe" });

    var u = new Usuario
    {
        Nombre = dto.Nombre,
        Email = dto.Email,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
    };
    db.Usuarios.Add(u);
    await db.SaveChangesAsync();
    return Results.Ok(new { mensaje = "Registrado correctamente" });
});

app.MapPost("/api/auth/login", async (AppDb db, LoginDto dto) =>
{
    var u = await db.Usuarios.FirstOrDefaultAsync(x => x.Email == dto.Email);
    if (u == null || !BCrypt.Net.BCrypt.Verify(dto.Password, u.PasswordHash))
        return Results.Unauthorized();

    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.ASCII.GetBytes("ESTA_ES_UNA_CLAVE_SECRETA_MUY_LARGA_Y_SEGURA_12345");
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[] {
            new Claim(ClaimTypes.Name, u.Id.ToString()),
            new Claim(ClaimTypes.Email, u.Email)
        }),
        Expires = DateTime.UtcNow.AddDays(7),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };
    var token = tokenHandler.CreateToken(tokenDescriptor);
    return Results.Ok(new { 
        token = tokenHandler.WriteToken(token),
        usuario = new { u.Id, u.Nombre, u.Email }
    });
});

// ===================== Dashboard =====================

app.MapGet("/api/dashboard", async (AppDb db) =>
{
    var candidatos = await db.Candidatos.Include(c => c.Referencias).Include(c => c.Reporte).ToListAsync();
    var referencias = candidatos.SelectMany(c => c.Referencias).ToList();
    var respondidas = referencias.Where(r => r.Estatus == "Respondida").ToList();

    double? tiempoPromedio = null;
    var conRespuesta = respondidas.Where(r => r.FechaRespuesta.HasValue).ToList();
    if (conRespuesta.Count > 0)
        tiempoPromedio = Math.Round(conRespuesta
            .Average(r => (r.FechaRespuesta!.Value - r.FechaEnvio).TotalDays), 1);

    var lista = candidatos
        .OrderByDescending(c => c.FechaRegistro)
        .Select(c => new
        {
            c.Id,
            c.Nombre,
            c.Puesto,
            c.Estatus,
            c.FechaRegistro,
            totalReferencias = c.Reporte?.TotalReferencias ?? c.Referencias.Count,
            respondidas = c.Reporte?.ReferenciasRespondidas ?? c.Referencias.Count(r => r.Estatus == "Respondida"),
            avance = c.Reporte?.Avance ?? (c.Referencias.Count == 0 ? 0 : (int)Math.Round(100.0 * c.Referencias.Count(r => r.Estatus == "Respondida") / c.Referencias.Count)),
            score = Calculos.ScoreCandidato(c)
        });

    return Results.Ok(new
    {
        totalCandidatos = candidatos.Count,
        procesosEnCurso = candidatos.Count(c => c.Estatus == "EnProceso"),
        procesosConcluidos = candidatos.Count(c => c.Estatus == "Completado"),
        referenciasEnviadas = referencias.Count,
        referenciasRecibidas = respondidas.Count,
        referenciasPendientes = referencias.Count - respondidas.Count,
        tiempoPromedioDias = tiempoPromedio,
        competencias = Calculos.GetCompetenciasGlobales(respondidas),
        candidatos = lista
    });
});

app.MapGet("/api/dashboard/reporte/pdf", async (AppDb db, IPdfReportService pdfService) =>
{
    var candidatos = await db.Candidatos.Include(c => c.Referencias).ToListAsync();
    var referencias = candidatos.SelectMany(c => c.Referencias).ToList();
    var respondidas = referencias.Where(r => r.Estatus == "Respondida").ToList();

    double? tiempoPromedio = null;
    var conRespuesta = respondidas.Where(r => r.FechaRespuesta.HasValue).ToList();
    if (conRespuesta.Count > 0)
        tiempoPromedio = Math.Round(conRespuesta.Average(r => (r.FechaRespuesta!.Value - r.FechaEnvio).TotalDays), 1);

    var scoresValidos = candidatos
        .Select(c => Calculos.ScoreCandidato(c))
        .Where(s => s.disponible)
        .ToList();

    var stats = new DashboardStatsDto(
        TotalCandidatos: candidatos.Count,
        ProcesosEnCurso: candidatos.Count(c => c.Estatus == "EnProceso"),
        ProcesosConcluidos: candidatos.Count(c => c.Estatus == "Completado"),
        ReferenciasEnviadas: referencias.Count,
        ReferenciasRecibidas: respondidas.Count,
        ReferenciasPendientes: referencias.Count - respondidas.Count,
        TiempoPromedioDias: tiempoPromedio,
        PromedioGeneral: Math.Round(scoresValidos.Any() ? scoresValidos.Average(s => s.general ?? 0) : 0, 1),
        RiesgoBajo: scoresValidos.Count(s => s.semaforo == "verde"),
        RiesgoMedio: scoresValidos.Count(s => s.semaforo == "amarillo" || s.semaforo == "naranja"),
        RiesgoAlto: scoresValidos.Count(s => s.semaforo == "rojo"),
        PorcentajeRecontratacion: (int)Math.Round(scoresValidos.Any() ? 100.0 * scoresValidos.Count(s => s.general >= 7) / scoresValidos.Count : 0),
        CompetenciasGlobales: Calculos.GetCompetenciasGlobales(respondidas)
    );

    var pdfBytes = pdfService.GenerateGlobalReport(stats);
    return Results.File(pdfBytes, "application/pdf", $"Reporte_Global_{DateTime.Now:yyyyMMdd}.pdf");
});

// ===================== Candidatos =====================

app.MapPost("/api/candidatos", async (AppDb db, IEmailService emailService, IConfiguration config, NuevoCandidatoDto dto) =>
{
    var baseUrl = config["FRONTEND_URL"] ?? "http://localhost:5173";
    if (string.IsNullOrWhiteSpace(dto.Nombre))
        return Results.BadRequest(new { error = "El nombre del candidato es obligatorio." });
    if (dto.Referencias is null || dto.Referencias.Count == 0)
        return Results.BadRequest(new { error = "Registra al menos una referencia laboral." });

    var candidato = new Candidato
    {
        Nombre = dto.Nombre.Trim(),
        Email = dto.Email?.Trim() ?? "",
        Puesto = dto.Puesto?.Trim() ?? ""
    };
    foreach (var r in dto.Referencias)
    {
        candidato.Referencias.Add(new Referencia
        {
            NombreReferente = r.NombreReferente?.Trim() ?? "",
            Empresa = r.Empresa?.Trim() ?? "",
            PuestoReferente = r.PuestoReferente?.Trim() ?? "",
            Relacion = r.Relacion?.Trim() ?? "",
            Email = r.Email?.Trim() ?? "",
            Telefono = r.Telefono?.Trim() ?? ""
        });
    }
    db.Candidatos.Add(candidato);
    await db.SaveChangesAsync();

    // Timeline + envío automático de invitaciones (simulado)
    db.Eventos.Add(new EventoTimeline
    {
        CandidatoId = candidato.Id,
        Titulo = "Candidato registrado",
        Detalle = $"Vacante: {candidato.Puesto}"
    });
    foreach (var r in candidato.Referencias)
    {
        var correo = Notificaciones.CorreoInvitacion(candidato, r, baseUrl);
        db.Correos.Add(correo);
        try { await emailService.EnviarCorreoAsync(correo); } catch { /* Ignore email sending errors for prototype */ }

        db.Eventos.Add(new EventoTimeline
        {
            CandidatoId = candidato.Id,
            Titulo = "Invitación enviada",
            Detalle = $"{r.NombreReferente} ({r.Email})"
        });
    }
    await db.SaveChangesAsync();

    return Results.Created($"/api/candidatos/{candidato.Id}", new { candidato.Id });
});

app.MapGet("/api/candidatos/importar/plantilla", () =>
{
    using var workbook = new ClosedXML.Excel.XLWorkbook();
    var ws = workbook.Worksheets.Add("Candidatos");
    
    var headers = new[] { "Candidato_Nombre", "Candidato_Email", "Candidato_Puesto", "Referencia_Nombre", "Referencia_Empresa", "Referencia_Puesto", "Referencia_Relacion", "Referencia_Email", "Referencia_Telefono" };
    for (int i = 0; i < headers.Length; i++)
    {
        var cell = ws.Cell(1, i + 1);
        cell.Value = headers[i];
        cell.Style.Font.Bold = true;
        cell.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;
    }
    
    // Fila de ejemplo
    ws.Cell(2, 1).Value = "Juan Perez";
    ws.Cell(2, 2).Value = "juan@example.com";
    ws.Cell(2, 3).Value = "Desarrollador";
    ws.Cell(2, 4).Value = "Maria Lopez";
    ws.Cell(2, 5).Value = "Acme Corp";
    ws.Cell(2, 6).Value = "Gerente IT";
    ws.Cell(2, 7).Value = "Jefe directo";
    ws.Cell(2, 8).Value = "maria@example.com";
    ws.Cell(2, 9).Value = "555-1234";

    ws.Columns().AdjustToContents();
    
    using var stream = new MemoryStream();
    workbook.SaveAs(stream);
    return Results.File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Plantilla_Candidatos.xlsx");
});

app.MapPost("/api/candidatos/importar", async (AppDb db, IEmailService emailService, IConfiguration config, IFormFile file) =>
{
    var baseUrl = config["FRONTEND_URL"] ?? "http://localhost:5173";
    if (file == null || file.Length == 0)
        return Results.BadRequest(new { error = "No se subió ningún archivo." });

    if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
        return Results.BadRequest(new { error = "El archivo debe ser un documento Excel (.xlsx)." });

    try
    {
        using var stream = new MemoryStream();
        await file.CopyToAsync(stream);
        using var workbook = new ClosedXML.Excel.XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1);
        var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // Skip header

        var candidatosDict = new Dictionary<string, Candidato>();

        foreach (var row in rows)
        {
            var nombreCandidato = row.Cell(1).GetString().Trim();
            var emailCandidato = row.Cell(2).GetString().Trim();
            var puestoCandidato = row.Cell(3).GetString().Trim();
            
            var nombreReferente = row.Cell(4).GetString().Trim();
            var empresa = row.Cell(5).GetString().Trim();
            var puestoReferente = row.Cell(6).GetString().Trim();
            var relacion = row.Cell(7).GetString().Trim();
            var emailReferente = row.Cell(8).GetString().Trim();
            var telefono = row.Cell(9).GetString().Trim();

            if (string.IsNullOrEmpty(nombreCandidato) || string.IsNullOrEmpty(nombreReferente) || string.IsNullOrEmpty(emailReferente))
                continue;

            var key = !string.IsNullOrEmpty(emailCandidato) ? emailCandidato.ToLower() : nombreCandidato.ToLower();

            if (!candidatosDict.TryGetValue(key, out var candidato))
            {
                candidato = new Candidato
                {
                    Nombre = nombreCandidato,
                    Email = emailCandidato,
                    Puesto = puestoCandidato
                };
                candidatosDict[key] = candidato;
                db.Candidatos.Add(candidato);
            }

            candidato.Referencias.Add(new Referencia
            {
                NombreReferente = nombreReferente,
                Empresa = empresa,
                PuestoReferente = puestoReferente,
                Relacion = relacion,
                Email = emailReferente,
                Telefono = telefono
            });
        }

        await db.SaveChangesAsync();

        int totalReferencias = 0;
        foreach (var c in candidatosDict.Values)
        {
            db.Eventos.Add(new EventoTimeline
            {
                CandidatoId = c.Id,
                Titulo = "Candidato registrado (Importación Excel)",
                Detalle = $"Vacante: {c.Puesto}"
            });

            foreach (var r in c.Referencias)
            {
                var correo = Notificaciones.CorreoInvitacion(c, r, baseUrl);
                db.Correos.Add(correo);
                try { await emailService.EnviarCorreoAsync(correo); } catch { }

                db.Eventos.Add(new EventoTimeline
                {
                    CandidatoId = c.Id,
                    Titulo = "Invitación enviada",
                    Detalle = $"{r.NombreReferente} ({r.Email})"
                });
                totalReferencias++;
            }
        }

        await db.SaveChangesAsync();

        return Results.Ok(new { mensaje = $"Se importaron exitosamente {candidatosDict.Count} candidatos con {totalReferencias} referencias en total." });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = $"Error procesando el archivo Excel: {ex.Message}" });
    }
})
.DisableAntiforgery();

app.MapGet("/api/candidatos/{id:int}", async (AppDb db, int id) =>
{
    var c = await db.Candidatos.Include(x => x.Referencias)
        .FirstOrDefaultAsync(x => x.Id == id);
    if (c is null) return Results.NotFound();

    var eventos = await db.Eventos
        .Where(e => e.CandidatoId == id)
        .OrderBy(e => e.Fecha)
        .ToListAsync();

    var respondidas = c.Referencias.Where(r => r.Estatus == "Respondida").ToList();

    return Results.Ok(new
    {
        c.Id,
        c.Nombre,
        c.Email,
        c.Puesto,
        c.Estatus,
        c.FechaRegistro,
        avance = c.Referencias.Count == 0 ? 0 :
            (int)Math.Round(100.0 * respondidas.Count / c.Referencias.Count),
        score = Calculos.ScoreCandidato(c),
        fortalezas = Calculos.ResumenTemas(respondidas.Select(r => r.Fortalezas)),
        areasOportunidad = Calculos.ResumenTemas(respondidas.Select(r => r.AreasOportunidad)),
        referencias = c.Referencias.Select(r => new
        {
            r.Id, r.NombreReferente, r.Empresa, r.PuestoReferente, r.Relacion,
            r.Email, r.Telefono, r.Token, r.Estatus, r.FechaEnvio, r.FechaRespuesta,
            r.Recordatorios,
            r.Responsabilidad, r.TrabajoEquipo, r.Comunicacion, r.Liderazgo,
            r.Integridad, r.ConocimientoTecnico, r.Recontrataria,
            r.PeriodoTrabajado, r.PuestoCandidato,
            r.Fortalezas, r.AreasOportunidad, r.Comentarios
        }),
        timeline = eventos.Select(e => new { e.Fecha, e.Titulo, e.Detalle })
    });
});

app.MapGet("/api/candidatos/{id:int}/reporte/pdf", async (AppDb db, IPdfReportService pdfService, int id) =>
{
    var c = await db.Candidatos.Include(x => x.Referencias)
        .FirstOrDefaultAsync(x => x.Id == id);
    if (c is null) return Results.NotFound();

    var pdfBytes = pdfService.GenerateReport(c);
    return Results.File(pdfBytes, "application/pdf", $"Reporte_{c.Nombre.Replace(" ", "_")}.pdf");
});

// ===================== Recordatorios =====================

app.MapPost("/api/referencias/{id:int}/recordatorio", async (AppDb db, IEmailService emailService, IConfiguration config, int id) =>
{
    var baseUrl = config["FRONTEND_URL"] ?? "http://localhost:5173";
    var r = await db.Referencias.FindAsync(id);
    if (r is null) return Results.NotFound();
    if (r.Estatus == "Respondida")
        return Results.BadRequest(new { error = "Esta referencia ya respondió el cuestionario." });

    var c = await db.Candidatos.FindAsync(r.CandidatoId);
    if (c is null) return Results.NotFound();

    r.Recordatorios++;
    var correo = Notificaciones.CorreoRecordatorio(c, r, r.Recordatorios, baseUrl);
    db.Correos.Add(correo);
    try { await emailService.EnviarCorreoAsync(correo); } catch { /* Ignore error */ }

    db.Eventos.Add(new EventoTimeline
    {
        CandidatoId = c.Id,
        Titulo = "Recordatorio enviado",
        Detalle = r.NombreReferente
    });
    await db.SaveChangesAsync();
    return Results.Ok(new { mensaje = $"Recordatorio enviado a {r.NombreReferente}." });
});

// ===================== Cuestionario público =====================

app.MapGet("/api/v1/publico/cuestionario/{token}", async (AppDb db, string token) =>
{
    var r = await db.Referencias.FirstOrDefaultAsync(x => x.Token == token);
    if (r is null) return Results.Json(new { error = "Enlace no válido." }, statusCode: 403);
    var c = await db.Candidatos.FindAsync(r.CandidatoId);
    if (c is null) return Results.NotFound(new { error = "Enlace no válido." });

    return Results.Ok(new
    {
        yaRespondida = r.Estatus == "Respondida",
        referente = r.NombreReferente,
        empresa = r.Empresa,
        candidato = c.Nombre,
        puesto = c.Puesto
    });
});

app.MapPost("/api/v1/publico/cuestionario/{token}", async (AppDb db, string token, RespuestaDto dto) =>
{
    var r = await db.Referencias.FirstOrDefaultAsync(x => x.Token == token);
    if (r is null) return Results.Json(new { error = "Enlace no válido o expirado." }, statusCode: 403);
    if (r.Estatus == "Respondida")
        return Results.Json(new { error = "Este cuestionario ya fue respondido." }, statusCode: 403);

    double[] valores = { dto.Responsabilidad, dto.TrabajoEquipo, dto.Comunicacion,
                         dto.Liderazgo, dto.Integridad, dto.ConocimientoTecnico };
    if (valores.Any(v => v < 0 || v > 10))
        return Results.BadRequest(new { error = "Las calificaciones deben estar entre 0 y 10." });

    r.Responsabilidad = dto.Responsabilidad;
    r.TrabajoEquipo = dto.TrabajoEquipo;
    r.Comunicacion = dto.Comunicacion;
    r.Liderazgo = dto.Liderazgo;
    r.Integridad = dto.Integridad;
    r.ConocimientoTecnico = dto.ConocimientoTecnico;
    r.Recontrataria = dto.Recontrataria;
    r.PeriodoTrabajado = dto.PeriodoTrabajado;
    r.PuestoCandidato = dto.PuestoCandidato;
    r.Fortalezas = dto.Fortalezas;
    r.AreasOportunidad = dto.AreasOportunidad;
    r.Comentarios = dto.Comentarios;
    r.Estatus = "Respondida";
    r.FechaRespuesta = DateTime.Now;

    db.Eventos.Add(new EventoTimeline
    {
        CandidatoId = r.CandidatoId,
        Titulo = "Referencia respondida",
        Detalle = r.NombreReferente
    });

    // Si todas las referencias respondieron, el proceso se marca como completado
    var candidato = await db.Candidatos.Include(x => x.Referencias)
        .FirstAsync(x => x.Id == r.CandidatoId);
    if (candidato.Referencias.All(x => x.Estatus == "Respondida"))
    {
        candidato.Estatus = "Completado";
        var ultima = candidato.Referencias.Max(x => x.FechaRespuesta) ?? DateTime.Now;
        db.Eventos.Add(new EventoTimeline
        {
            CandidatoId = candidato.Id,
            Titulo = "Proceso completado",
            Detalle = "Reporte disponible",
            Fecha = ultima.AddMinutes(10)
        });

        var respondidas = candidato.Referencias.Where(refRes => refRes.Estatus == "Respondida").ToList();
        double? tiempoPromedio = respondidas.Any() ? Math.Round(respondidas.Average(refRes => (refRes.FechaRespuesta!.Value - refRes.FechaEnvio).TotalDays), 1) : null;
        var baseCalc = candidato.Referencias.Select(refRes => new { refRes.Responsabilidad, refRes.TrabajoEquipo, refRes.Comunicacion, refRes.Liderazgo, refRes.Integridad, refRes.ConocimientoTecnico });
        
        double sum = 0; int count = 0;
        foreach(var b in baseCalc) {
            if(b.Responsabilidad.HasValue) { sum += b.Responsabilidad.Value; count++; }
            if(b.TrabajoEquipo.HasValue) { sum += b.TrabajoEquipo.Value; count++; }
            if(b.Comunicacion.HasValue) { sum += b.Comunicacion.Value; count++; }
            if(b.Liderazgo.HasValue) { sum += b.Liderazgo.Value; count++; }
            if(b.Integridad.HasValue) { sum += b.Integridad.Value; count++; }
            if(b.ConocimientoTecnico.HasValue) { sum += b.ConocimientoTecnico.Value; count++; }
        }

        db.ReportesDashboard.Add(new ReporteDashboard
        {
            CandidatoId = candidato.Id,
            TotalReferencias = candidato.Referencias.Count,
            ReferenciasRespondidas = respondidas.Count,
            Avance = 100,
            ScoreGlobal = count > 0 ? Math.Round(sum / count, 1) : 0,
            TiempoPromedioDias = tiempoPromedio,
            FechaGeneracion = ultima.AddMinutes(15)
        });
    }

    await db.SaveChangesAsync();
    return Results.Ok(new { mensaje = "¡Gracias! Su respuesta fue registrada correctamente." });
});

// ===================== Preguntas =====================

app.MapGet("/api/v1/preguntas/{area}", async (AppDb db, string area) =>
{
    var preguntas = await db.Preguntas
        .Where(p => p.Area.ToLower() == area.ToLower())
        .Select(p => new PreguntaDto(p.Id, p.Area, p.TextoPregunta, p.Tipo, p.Activa))
        .ToListAsync();
        
    return Results.Ok(preguntas);
});

app.MapPut("/api/v1/preguntas/{id:int}/toggle", async (AppDb db, int id) =>
{
    var pregunta = await db.Preguntas.FindAsync(id);
    if (pregunta is null) return Results.NotFound();

    pregunta.Activa = !pregunta.Activa;
    await db.SaveChangesAsync();

    return Results.Ok(new PreguntaDto(pregunta.Id, pregunta.Area, pregunta.TextoPregunta, pregunta.Tipo, pregunta.Activa));
});

// ===================== Bandeja de correos simulados =====================

app.MapGet("/api/correos", async (AppDb db) =>
    Results.Ok(await db.Correos.OrderByDescending(c => c.Fecha).ToListAsync()));

// ===================== Agente IA =====================

app.MapGet("/api/agente/config", async (AppDb db) =>
{
    var config = await db.ConfiguracionAgente.FirstOrDefaultAsync();
    if (config == null) return Results.NotFound();
    
    return Results.Ok(new ConfiguracionAgenteDto(
        config.Frecuencia,
        config.MaxIntentos,
        config.DiasHabiles,
        config.NombreAgente,
        config.Tono,
        config.ResumenAutomatico,
        config.DeteccionBanderasRojas,
        config.AgradecimientoReferente
    ));
});

app.MapPost("/api/agente/config", async (AppDb db, ConfiguracionAgenteDto dto) =>
{
    var config = await db.ConfiguracionAgente.FirstOrDefaultAsync();
    if (config == null)
    {
        config = new ConfiguracionAgente();
        db.ConfiguracionAgente.Add(config);
    }
    
    config.Frecuencia = dto.Frecuencia;
    config.MaxIntentos = dto.MaxIntentos;
    config.DiasHabiles = dto.DiasHabiles;
    config.NombreAgente = dto.NombreAgente;
    config.Tono = dto.Tono;
    config.ResumenAutomatico = dto.ResumenAutomatico;
    config.DeteccionBanderasRojas = dto.DeteccionBanderasRojas;
    config.AgradecimientoReferente = dto.AgradecimientoReferente;
    
    await db.SaveChangesAsync();
    return Results.Ok(new { mensaje = "Configuración del agente guardada correctamente." });
});

app.Run();
