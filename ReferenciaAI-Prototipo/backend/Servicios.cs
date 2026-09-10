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
            Cuerpo = GenerarPlantillaHtml(
                r.NombreReferente,
                $"<strong>{c.Nombre}</strong> lo(a) ha señalado como referencia laboral dentro de un proceso de evaluación para la vacante de <strong>{c.Puesto}</strong>.",
                "Le agradeceremos responder un breve cuestionario confidencial (le tomará menos de 5 minutos).",
                enlace,
                "Completar Referencia"
            )
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
            Asunto = $"Recordatorio urgente: Referencia laboral pendiente — {c.Nombre}",
            Cuerpo = GenerarPlantillaHtml(
                r.NombreReferente,
                $"Le recordamos amablemente que tiene pendiente responder el cuestionario de referencia laboral de <strong>{c.Nombre}</strong>.",
                "Su respuesta es muy importante para que el candidato pueda continuar con su proceso de selección. Le tomará menos de 5 minutos.",
                enlace,
                "Completar Referencia Ahora"
            )
        };
    }

    private static string GenerarPlantillaHtml(string nombre, string parrafo1, string parrafo2, string enlace, string textoBoton)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
</head>
<body style=""font-family: Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #334155;"">
    <div style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);"">
        <div style=""background-color: #0b1f38; color: #ffffff; padding: 20px; text-align: center;"">
            <h1 style=""margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;"">Referencia AI</h1>
        </div>
        <div style=""padding: 30px; line-height: 1.6;"">
            <p style=""font-size: 16px; margin-top: 0;"">Estimado(a) <strong>{nombre}</strong>,</p>
            <p style=""font-size: 16px;"">{parrafo1}</p>
            <p style=""font-size: 16px;"">{parrafo2}</p>
            
            <div style=""text-align: center; margin: 30px 0;"">
                <a href=""{enlace}"" style=""display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px;"">{textoBoton}</a>
            </div>
            
            <p style=""font-size: 14px; color: #64748b;"">
                Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:<br>
                <a href=""{enlace}"" style=""color: #0b1f38; word-break: break-all;"">{enlace}</a>
            </p>
            <p style=""font-size: 16px; margin-bottom: 0;"">Gracias por su tiempo e inestimable apoyo.</p>
        </div>
        <div style=""background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;"">
            Este es un correo automático, por favor no responda a este mensaje.<br>
            &copy; {DateTime.Now.Year} EstrategIA Tecnológica &middot; Todos los derechos reservados
        </div>
    </div>
</body>
</html>";
    }
}
