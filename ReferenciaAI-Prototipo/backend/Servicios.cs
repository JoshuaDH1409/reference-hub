namespace ReferenciaAI.Api;

public static class Calculos
{
    /// <summary>Calcula promedios por competencia, score general y semáforo de riesgo.</summary>
    public static ScoreResult ScoreCandidato(Candidato c)
    {
        var respondidas = c.Referencias.Where(r => r.Estatus == "Respondida").ToList();
        if (respondidas.Count == 0)
        {
            return new ScoreResult(
                disponible: false,
                general: null,
                semaforo: null,
                etiqueta: "Sin respuestas aún",
                competencias: new List<object>(),
                recontratarian: 0,
                totalRespuestas: 0
            );
        }

        double Prom(Func<Referencia, double?> sel) =>
            Math.Round(respondidas.Where(r => sel(r).HasValue).Select(r => sel(r)!.Value).DefaultIfEmpty(0).Average(), 1);

        var competencias = new List<object>
        {
            new { nombre = "Responsabilidad",      valor = Prom(r => r.Responsabilidad) },
            new { nombre = "Trabajo en equipo",    valor = Prom(r => r.TrabajoEquipo) },
            new { nombre = "Comunicación",         valor = Prom(r => r.Comunicacion) },
            new { nombre = "Liderazgo",            valor = Prom(r => r.Liderazgo) },
            new { nombre = "Integridad",           valor = Prom(r => r.Integridad) },
            new { nombre = "Conocimiento técnico", valor = Prom(r => r.ConocimientoTecnico) },
        };

        var valores = respondidas.SelectMany(r => new[]
        {
            r.Responsabilidad, r.TrabajoEquipo, r.Comunicacion,
            r.Liderazgo, r.Integridad, r.ConocimientoTecnico
        }).Where(v => v.HasValue).Select(v => v!.Value).ToList();

        var general = Math.Round(valores.DefaultIfEmpty(0).Average(), 1);

        var (semaforo, etiqueta) = general switch
        {
            >= 9.0 => ("verde",   "Muy recomendable"),
            >= 7.5 => ("amarillo","Recomendable"),
            >= 6.0 => ("naranja", "Requiere validación"),
            _      => ("rojo",    "No recomendable")
        };

        // Regla de Alerta (RF-07.3 - Crítico): 
        // Si hay una alerta por falta de integridad o no recontratación, forzar a ROJO.
        bool alertaCritica = respondidas.Any(r => r.Recontrataria == false || (r.Integridad.HasValue && r.Integridad < 6.0));
        if (alertaCritica)
        {
            semaforo = "rojo";
            etiqueta = "No recomendable (Alerta de Integridad / Recontratación)";
        }

        var recontratarian = respondidas.Count(r => r.Recontrataria == true);

        return new ScoreResult(
            disponible: true,
            general: general,
            semaforo: semaforo,
            etiqueta: etiqueta,
            competencias: competencias,
            recontratarian: recontratarian,
            totalRespuestas: respondidas.Count
        );
    }

    /// <summary>Resume los textos libres (fortalezas / áreas de oportunidad) en los temas más mencionados.</summary>
    public static List<string> ResumenTemas(IEnumerable<string?> textos, int maximo = 6)
    {
        var conteo = new Dictionary<string, (string Original, int Veces)>();
        foreach (var texto in textos)
        {
            if (string.IsNullOrWhiteSpace(texto)) continue;
            var partes = texto.Split(new[] { ',', ';', '\n', '·', '•' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var parte in partes)
            {
                var limpio = parte.Trim().TrimEnd('.');
                if (limpio.Length < 3) continue;
                var clave = limpio.ToLowerInvariant();
                if (conteo.TryGetValue(clave, out var actual))
                    conteo[clave] = (actual.Original, actual.Veces + 1);
                else
                    conteo[clave] = (Capitalizar(limpio), 1);
            }
        }
        return conteo.Values
            .OrderByDescending(v => v.Veces)
            .Take(maximo)
            .Select(v => v.Veces > 1 ? $"{v.Original} (mencionado {v.Veces} veces)" : v.Original)
            .ToList();
    }

    private static string Capitalizar(string s) =>
        s.Length == 0 ? s : char.ToUpperInvariant(s[0]) + s[1..];
}

public static class Notificaciones
{
    public const string UrlBaseFrontend = "http://localhost:5173";

    public static CorreoSimulado CorreoInvitacion(Candidato c, Referencia r)
    {
        var enlace = $"{UrlBaseFrontend}/responder/{r.Token}";
        return new CorreoSimulado
        {
            Para = r.Email,
            Tipo = "Invitacion",
            CandidatoId = c.Id,
            ReferenciaId = r.Id,
            Fecha = r.FechaEnvio.AddMinutes(5),
            Asunto = $"Solicitud de referencia laboral — {c.Nombre}",
            Cuerpo =
$@"Estimado(a) {r.NombreReferente}:

{c.Nombre} lo(a) ha señalado como referencia laboral dentro de un proceso de evaluación para la vacante de {c.Puesto}.

Le agradeceremos responder un breve cuestionario (menos de 5 minutos) en el siguiente enlace seguro:

{enlace}

Sus respuestas serán tratadas de manera confidencial y utilizadas exclusivamente para este proceso.

Gracias por su tiempo.

Referencia AI — EstrategIA Tecnológica"
        };
    }

    public static CorreoSimulado CorreoRecordatorio(Candidato c, Referencia r)
    {
        var enlace = $"{UrlBaseFrontend}/responder/{r.Token}";
        return new CorreoSimulado
        {
            Para = r.Email,
            Tipo = "Recordatorio",
            CandidatoId = c.Id,
            ReferenciaId = r.Id,
            Asunto = $"Recordatorio: referencia laboral pendiente — {c.Nombre}",
            Cuerpo =
$@"Estimado(a) {r.NombreReferente}:

Le recordamos amablemente que tiene pendiente responder el cuestionario de referencia laboral de {c.Nombre}.

Puede hacerlo en el siguiente enlace seguro:

{enlace}

Gracias por su apoyo.

Referencia AI — EstrategIA Tecnológica"
        };
    }
}
