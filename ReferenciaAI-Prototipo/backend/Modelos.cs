namespace ReferenciaAI.Api;

// ===================== Entidades =====================

public class Candidato
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string Email { get; set; } = "";
    public string Puesto { get; set; } = "";
    public DateTime FechaRegistro { get; set; } = DateTime.Now;
    public string Estatus { get; set; } = "EnProceso"; // EnProceso | Completado
    public List<Referencia> Referencias { get; set; } = new();
    public ReporteDashboard? Reporte { get; set; }
}

public class ReporteDashboard
{
    public int Id { get; set; }
    public int CandidatoId { get; set; }
    public Candidato? Candidato { get; set; }
    
    public int TotalReferencias { get; set; }
    public int ReferenciasRespondidas { get; set; }
    public int Avance { get; set; }
    public double? ScoreGlobal { get; set; }
    public double? TiempoPromedioDias { get; set; }
    public DateTime FechaGeneracion { get; set; } = DateTime.Now;
}

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public DateTime FechaRegistro { get; set; } = DateTime.Now;
}

public class Referencia
{
    public int Id { get; set; }
    public int CandidatoId { get; set; }
    public Candidato? Candidato { get; set; }
    public string NombreReferente { get; set; } = "";
    public string Empresa { get; set; } = "";
    public string PuestoReferente { get; set; } = "";
    public string Relacion { get; set; } = ""; // Jefe directo, Colega, RH, etc.
    public string Email { get; set; } = "";
    public string Telefono { get; set; } = "";
    public string Token { get; set; } = Guid.NewGuid().ToString("N");
    public string Estatus { get; set; } = "Pendiente"; // Pendiente | Respondida
    public DateTime FechaEnvio { get; set; } = DateTime.Now;
    public DateTime? FechaRespuesta { get; set; }
    public int Recordatorios { get; set; }

    // ----- Respuesta del cuestionario (escala 0 a 10) -----
    public double? Responsabilidad { get; set; }
    public double? TrabajoEquipo { get; set; }
    public double? Comunicacion { get; set; }
    public double? Liderazgo { get; set; }
    public double? Integridad { get; set; }
    public double? ConocimientoTecnico { get; set; }
    public bool? Recontrataria { get; set; }
    public string? PeriodoTrabajado { get; set; }
    public string? PuestoCandidato { get; set; }
    public string? Fortalezas { get; set; }
    public string? AreasOportunidad { get; set; }
    public string? Comentarios { get; set; }
}

public class EventoTimeline
{
    public int Id { get; set; }
    public int CandidatoId { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;
    public string Titulo { get; set; } = "";
    public string Detalle { get; set; } = "";
}

public class CorreoSimulado
{
    public int Id { get; set; }
    public string Para { get; set; } = "";
    public string Asunto { get; set; } = "";
    public string Cuerpo { get; set; } = "";
    public DateTime Fecha { get; set; } = DateTime.Now;
    public string Tipo { get; set; } = "Invitacion"; // Invitacion | Recordatorio
    public int? CandidatoId { get; set; }
    public int? ReferenciaId { get; set; }
}

// ===================== DTOs =====================

public record RegistroDto(string Nombre, string Email, string Password);
public record LoginDto(string Email, string Password);

public record NuevaReferenciaDto(
    string NombreReferente,
    string Empresa,
    string PuestoReferente,
    string Relacion,
    string Email,
    string Telefono);

public record NuevoCandidatoDto(
    string Nombre,
    string Email,
    string Puesto,
    List<NuevaReferenciaDto> Referencias);

public record RespuestaDto(
    double Responsabilidad,
    double TrabajoEquipo,
    double Comunicacion,
    double Liderazgo,
    double Integridad,
    double ConocimientoTecnico,
    bool Recontrataria,
    string? PeriodoTrabajado,
    string? PuestoCandidato,
    string? Fortalezas,
    string? AreasOportunidad,
    string? Comentarios);

public record DashboardStatsDto(
    int TotalCandidatos,
    int ProcesosEnCurso,
    int ProcesosConcluidos,
    int ReferenciasEnviadas,
    int ReferenciasRecibidas,
    int ReferenciasPendientes,
    double? TiempoPromedioDias,
    double PromedioGeneral,
    int RiesgoBajo,
    int RiesgoMedio,
    int RiesgoAlto,
    int PorcentajeRecontratacion
);

public record ScoreResult(
    bool disponible,
    double? general,
    string? semaforo,
    string etiqueta,
    List<object> competencias,
    int recontratarian,
    int totalRespuestas
);
