using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ReferenciaAI.Api;

public interface IPdfReportService
{
    byte[] GenerateReport(Candidato candidato);
    byte[] GenerateGlobalReport(DashboardStatsDto stats);
}

public class PdfReportService : IPdfReportService
{
    public PdfReportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateReport(Candidato candidato)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0); // Removing margin to allow full-width header
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily(Fonts.Arial));

                page.Header().Element(c => ComposeHeader(c, candidato));
                page.Content().Padding(2, Unit.Centimetre).Element(c => ComposeContent(c, candidato));
                page.Footer().PaddingHorizontal(2, Unit.Centimetre).PaddingBottom(1, Unit.Centimetre).AlignCenter().Text(x =>
                {
                    x.Span("Página ").FontColor(Colors.Grey.Medium);
                    x.CurrentPageNumber().FontColor(Colors.Grey.Medium);
                    x.Span(" de ").FontColor(Colors.Grey.Medium);
                    x.TotalPages().FontColor(Colors.Grey.Medium);
                });
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container, Candidato candidato)
    {
        container.Background(Colors.Blue.Darken3).Padding(2, Unit.Centimetre).PaddingVertical(1.5f, Unit.Centimetre).Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text($"Reporte de Referencias Laborales").FontSize(24).SemiBold().FontColor(Colors.White);
                column.Item().PaddingTop(5).Text(candidato.Nombre).FontSize(18).FontColor(Colors.White);
                column.Item().Text($"Vacante: {candidato.Puesto}").FontSize(14).FontColor(Colors.Blue.Lighten4);
            });

            row.ConstantItem(150).AlignRight().Column(column => 
            {
                column.Item().Text("Generado el:").FontSize(10).FontColor(Colors.Blue.Lighten4).AlignRight();
                column.Item().Text(DateTime.Now.ToString("dd/MM/yyyy")).FontSize(12).SemiBold().FontColor(Colors.White).AlignRight();
                
                var score = Calculos.ScoreCandidato(candidato);
                if (score.disponible)
                {
                    var colorSemaforo = score.semaforo switch {
                        "verde" => Colors.Green.Darken1,
                        "amarillo" => Colors.Yellow.Darken2,
                        "naranja" => Colors.Orange.Darken1,
                        "rojo" => Colors.Red.Darken1,
                        _ => Colors.Grey.Lighten2
                    };
                    column.Item().PaddingTop(10)
                          .Background(colorSemaforo)
                          .PaddingVertical(5).PaddingHorizontal(10)
                          .Text($"{score.general:0.0} / 10")
                          .FontSize(14).SemiBold().FontColor(Colors.White).AlignCenter();
                          
                    column.Item().PaddingTop(2)
                          .Text(score.etiqueta)
                          .FontSize(10).SemiBold().FontColor(colorSemaforo).AlignRight();
                }
            });
        });
    }

    private void ComposeContent(IContainer container, Candidato candidato)
    {
        var respondidas = candidato.Referencias.Where(r => r.Estatus == "Respondida").ToList();
        
        container.Column(column =>
        {
            column.Spacing(25);

            // KPI Cards (Resumen Ejecutivo)
            column.Item().Text("Resumen Ejecutivo").FontSize(16).SemiBold().FontColor(Colors.Blue.Darken3);
            
            column.Item().Row(row =>
            {
                row.Spacing(15);
                
                // KPI 1
                row.RelativeItem().Background(Colors.Grey.Lighten4).BorderTop(4).BorderColor(Colors.Blue.Darken2).Padding(15).Column(c =>
                {
                    c.Item().Text("Total Referencias").FontSize(11).FontColor(Colors.Grey.Darken2);
                    c.Item().Text(candidato.Referencias.Count.ToString()).FontSize(22).SemiBold().FontColor(Colors.Blue.Darken3);
                });

                // KPI 2
                row.RelativeItem().Background(Colors.Grey.Lighten4).BorderTop(4).BorderColor(Colors.Green.Darken2).Padding(15).Column(c =>
                {
                    c.Item().Text("Respondidas").FontSize(11).FontColor(Colors.Grey.Darken2);
                    c.Item().Text(respondidas.Count.ToString()).FontSize(22).SemiBold().FontColor(Colors.Green.Darken3);
                });

                // KPI 3
                var avance = candidato.Referencias.Count == 0 ? 0 : (int)Math.Round(100.0 * respondidas.Count / candidato.Referencias.Count);
                row.RelativeItem().Background(Colors.Grey.Lighten4).BorderTop(4).BorderColor(Colors.Orange.Darken2).Padding(15).Column(c =>
                {
                    c.Item().Text("Avance").FontSize(11).FontColor(Colors.Grey.Darken2);
                    c.Item().Text($"{avance}%").FontSize(22).SemiBold().FontColor(Colors.Orange.Darken3);
                });
            });

            // Detalle por referencia
            column.Item().Text("Detalle de Referencias").FontSize(16).SemiBold().FontColor(Colors.Blue.Darken3);

            if(respondidas.Count == 0)
            {
                column.Item().Background(Colors.Grey.Lighten4).Padding(15).Text("Aún no hay referencias respondidas para generar el detalle.").Italic().FontColor(Colors.Grey.Darken1);
            }

            foreach (var r in respondidas)
            {
                var recon = (r.Recontrataria ?? false) ? "Sí" : "No";
                var reconColor = (r.Recontrataria ?? false) ? Colors.Green.Darken2 : Colors.Red.Darken2;

                column.Item().Background(Colors.White).Border(1).BorderColor(Colors.Grey.Lighten2).Column(refCol =>
                {
                    // Card Header
                    refCol.Item().Background(Colors.Grey.Lighten4).Padding(12).Row(rRow => 
                    {
                        rRow.RelativeItem().Text(text =>
                        {
                            text.Span(r.NombreReferente).SemiBold().FontSize(13).FontColor(Colors.Black);
                            text.Span($" — {r.PuestoReferente}, {r.Empresa}").FontSize(11).FontColor(Colors.Grey.Darken2);
                        });
                        rRow.ConstantItem(120).AlignRight().Text($"Relación: {r.Relacion}").FontSize(10).FontColor(Colors.Grey.Darken1).AlignRight();
                    });

                    // Card Body
                    refCol.Item().Padding(12).Column(body => 
                    {
                        body.Spacing(8);
                        
                        // Calificaciones en grid
                        body.Item().Row(grid => 
                        {
                            grid.Spacing(10);
                            grid.RelativeItem().Column(c => { c.Item().Text("Responsabilidad").FontSize(9).FontColor(Colors.Grey.Medium); c.Item().Text($"{r.Responsabilidad:0.0}/10").SemiBold(); });
                            grid.RelativeItem().Column(c => { c.Item().Text("Trabajo en Equipo").FontSize(9).FontColor(Colors.Grey.Medium); c.Item().Text($"{r.TrabajoEquipo:0.0}/10").SemiBold(); });
                            grid.RelativeItem().Column(c => { c.Item().Text("Comunicación").FontSize(9).FontColor(Colors.Grey.Medium); c.Item().Text($"{r.Comunicacion:0.0}/10").SemiBold(); });
                            grid.RelativeItem().Column(c => { c.Item().Text("Liderazgo").FontSize(9).FontColor(Colors.Grey.Medium); c.Item().Text($"{r.Liderazgo:0.0}/10").SemiBold(); });
                            grid.RelativeItem().Column(c => { c.Item().Text("Integridad").FontSize(9).FontColor(Colors.Grey.Medium); c.Item().Text($"{r.Integridad:0.0}/10").SemiBold(); });
                            grid.RelativeItem().Column(c => { c.Item().Text("Técnico").FontSize(9).FontColor(Colors.Grey.Medium); c.Item().Text($"{r.ConocimientoTecnico:0.0}/10").SemiBold(); });
                        });

                        body.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten3);

                        // Textos
                        if (!string.IsNullOrEmpty(r.Fortalezas))
                        {
                            body.Item().Text(text => { text.Span("Fortalezas: ").SemiBold().FontSize(10); text.Span(r.Fortalezas).FontSize(10); });
                        }
                        if (!string.IsNullOrEmpty(r.AreasOportunidad))
                        {
                            body.Item().Text(text => { text.Span("Áreas de Oportunidad: ").SemiBold().FontSize(10); text.Span(r.AreasOportunidad).FontSize(10); });
                        }
                        if (!string.IsNullOrEmpty(r.Comentarios))
                        {
                            body.Item().Text(text => { text.Span("Comentarios adicionales: ").SemiBold().FontSize(10); text.Span($"\"{r.Comentarios}\"").Italic().FontSize(10).FontColor(Colors.Grey.Darken2); });
                        }
                        
                        body.Item().PaddingTop(4).Text(text => { 
                            text.Span("¿Lo volvería a contratar?: ").SemiBold().FontSize(11); 
                            text.Span(recon).SemiBold().FontSize(11).FontColor(reconColor); 
                        });
                    });
                });
            }
        });
    }

    public byte[] GenerateGlobalReport(DashboardStatsDto stats)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily(Fonts.Arial));

                page.Header().Element(ComposeGlobalHeader);
                page.Content().Padding(2, Unit.Centimetre).Element(c => ComposeGlobalContent(c, stats));
                page.Footer().PaddingHorizontal(2, Unit.Centimetre).PaddingBottom(1, Unit.Centimetre).AlignCenter().Text(x =>
                {
                    x.Span("Página ").FontColor(Colors.Grey.Medium);
                    x.CurrentPageNumber().FontColor(Colors.Grey.Medium);
                    x.Span(" de ").FontColor(Colors.Grey.Medium);
                    x.TotalPages().FontColor(Colors.Grey.Medium);
                });
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeGlobalHeader(IContainer container)
    {
        container.Background(Colors.Blue.Darken3).Padding(2, Unit.Centimetre).PaddingVertical(1.5f, Unit.Centimetre).Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text("Reporte Consolidado Global").FontSize(24).SemiBold().FontColor(Colors.White);
                column.Item().PaddingTop(5).Text("Métricas y Análisis de Referencias").FontSize(14).FontColor(Colors.Blue.Lighten4);
            });
            row.ConstantItem(150).AlignRight().Column(column => 
            {
                column.Item().Text("Generado el:").FontSize(10).FontColor(Colors.Blue.Lighten4).AlignRight();
                column.Item().Text(DateTime.Now.ToString("dd/MM/yyyy")).FontSize(12).SemiBold().FontColor(Colors.White).AlignRight();
            });
        });
    }

    private void ComposeGlobalContent(IContainer container, DashboardStatsDto stats)
    {
        container.Column(column =>
        {
            column.Spacing(25);

            // Row 1: KPI Cards
            column.Item().Row(row =>
            {
                row.Spacing(15);
                
                // KPI 1
                row.RelativeItem().Background(Colors.Grey.Lighten4).BorderTop(4).BorderColor(Colors.Blue.Darken2).Padding(15).Column(c =>
                {
                    c.Item().Text("Promedio Global").FontSize(12).FontColor(Colors.Grey.Darken2);
                    c.Item().Text($"{stats.PromedioGeneral:0.0} / 10").FontSize(26).SemiBold().FontColor(Colors.Blue.Darken3);
                    c.Item().PaddingTop(5).Text($"{stats.TotalCandidatos} candidatos").FontSize(10).FontColor(Colors.Grey.Medium);
                });

                // KPI 2
                row.RelativeItem().Background(Colors.Grey.Lighten4).BorderTop(4).BorderColor(Colors.Green.Darken2).Padding(15).Column(c =>
                {
                    c.Item().Text("Índice Recontratación").FontSize(12).FontColor(Colors.Grey.Darken2);
                    c.Item().Text($"{stats.PorcentajeRecontratacion}%").FontSize(26).SemiBold().FontColor(Colors.Green.Darken3);
                    c.Item().PaddingTop(5).Text("De los que tienen score").FontSize(10).FontColor(Colors.Grey.Medium);
                });

                // KPI 3
                row.RelativeItem().Background(Colors.Grey.Lighten4).BorderTop(4).BorderColor(Colors.Orange.Darken2).Padding(15).Column(c =>
                {
                    c.Item().Text("Tiempo Promedio").FontSize(12).FontColor(Colors.Grey.Darken2);
                    var dias = stats.TiempoPromedioDias.HasValue ? $"{stats.TiempoPromedioDias.Value:0.0} días" : "N/A";
                    c.Item().Text(dias).FontSize(26).SemiBold().FontColor(Colors.Orange.Darken3);
                    c.Item().PaddingTop(5).Text("De respuesta").FontSize(10).FontColor(Colors.Grey.Medium);
                });
            });

            // Risk Distribution
            column.Item().Text("Análisis de Riesgo General").FontSize(16).SemiBold().FontColor(Colors.Blue.Darken3);
            
            column.Item().Row(row => 
            {
                row.Spacing(15);
                var total = stats.RiesgoBajo + stats.RiesgoMedio + stats.RiesgoAlto;
                total = total > 0 ? total : 1;

                row.RelativeItem().Background(Colors.Green.Lighten5).Border(1).BorderColor(Colors.Green.Lighten3).Padding(15).Column(c =>
                {
                    c.Item().Text("Bajo Riesgo").FontSize(13).SemiBold().FontColor(Colors.Green.Darken3);
                    c.Item().PaddingTop(5).Text($"{stats.RiesgoBajo} candidatos").FontSize(18).SemiBold().FontColor(Colors.Green.Darken2);
                    c.Item().Text($"{Math.Round(100.0 * stats.RiesgoBajo / total)}% del total").FontSize(11).FontColor(Colors.Green.Darken1);
                });

                row.RelativeItem().Background(Colors.Yellow.Lighten5).Border(1).BorderColor(Colors.Yellow.Lighten3).Padding(15).Column(c =>
                {
                    c.Item().Text("Riesgo Medio").FontSize(13).SemiBold().FontColor(Colors.Orange.Darken3);
                    c.Item().PaddingTop(5).Text($"{stats.RiesgoMedio} candidatos").FontSize(18).SemiBold().FontColor(Colors.Orange.Darken2);
                    c.Item().Text($"{Math.Round(100.0 * stats.RiesgoMedio / total)}% del total").FontSize(11).FontColor(Colors.Orange.Darken1);
                });

                row.RelativeItem().Background(Colors.Red.Lighten5).Border(1).BorderColor(Colors.Red.Lighten3).Padding(15).Column(c =>
                {
                    c.Item().Text("Alto Riesgo").FontSize(13).SemiBold().FontColor(Colors.Red.Darken3);
                    c.Item().PaddingTop(5).Text($"{stats.RiesgoAlto} candidatos").FontSize(18).SemiBold().FontColor(Colors.Red.Darken2);
                    c.Item().Text($"{Math.Round(100.0 * stats.RiesgoAlto / total)}% del total").FontSize(11).FontColor(Colors.Red.Darken1);
                });
            });

            // Promedio por Competencias y Funnel
            column.Item().Row(row => 
            {
                row.Spacing(20);

                // Columna izquierda: Eficiencia
                row.RelativeItem().Column(c => 
                {
                    c.Item().Text("Eficiencia de Referencias").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken3);
                    c.Item().PaddingTop(10).Background(Colors.Grey.Lighten4).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(15).Column(inner => 
                    {
                        inner.Item().Text("Tasa de Conversión (Enviadas vs Recibidas)").SemiBold().FontSize(11);
                        inner.Item().PaddingTop(10).Row(r => 
                        {
                            var conversion = stats.ReferenciasEnviadas > 0 ? (float)stats.ReferenciasRecibidas / stats.ReferenciasEnviadas : 0f;
                            if (conversion > 0)
                                r.RelativeItem(conversion).Height(15).Background(Colors.Green.Medium);
                            if (conversion < 1)
                                r.RelativeItem(1f - conversion).Height(15).Background(Colors.Grey.Lighten2);
                        });
                        inner.Item().PaddingTop(8).Text($"Enviadas: {stats.ReferenciasEnviadas} | Recibidas: {stats.ReferenciasRecibidas}").FontSize(10).FontColor(Colors.Grey.Darken2);
                        inner.Item().Text($"Pendientes: {stats.ReferenciasPendientes}").FontSize(10).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Columna derecha: Top competencias
                row.RelativeItem().Column(c => 
                {
                    if (stats.CompetenciasGlobales != null && stats.CompetenciasGlobales.Any())
                    {
                        c.Item().Text("Top Competencias").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken3);
                        c.Item().PaddingTop(10).Background(Colors.White).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(15).Column(compCol =>
                        {
                            compCol.Spacing(10);
                            var top3 = stats.CompetenciasGlobales.Take(3).ToList();
                            foreach (var comp in top3)
                            {
                                compCol.Item().Row(r =>
                                {
                                    r.RelativeItem().Text(comp.Nombre).FontSize(11).SemiBold().FontColor(Colors.Grey.Darken3);
                                    r.ConstantItem(40).AlignRight().Text($"{comp.Promedio:0.0}").FontSize(11).SemiBold().FontColor(Colors.Blue.Darken2);
                                });
                                compCol.Item().Height(6).Background(Colors.Grey.Lighten3).Row(r =>
                                {
                                    r.RelativeItem((float)(comp.Promedio)).Background(Colors.Blue.Darken2);
                                    r.RelativeItem((float)(10.0 - comp.Promedio)).Background(Colors.Transparent);
                                });
                            }
                        });
                    }
                });
            });

            // Overall Funnel
            column.Item().Text("Estado de los Procesos").FontSize(16).SemiBold().FontColor(Colors.Blue.Darken3);
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn();
                    columns.RelativeColumn();
                    columns.RelativeColumn();
                });

                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Total Candidatos");
                    header.Cell().Element(CellStyle).Text("Procesos en Curso");
                    header.Cell().Element(CellStyle).Text("Procesos Concluidos");

                    static IContainer CellStyle(IContainer container) => container.Background(Colors.Blue.Darken3).Padding(8).DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White));
                });

                table.Cell().Element(CellStyle).Text(stats.TotalCandidatos.ToString());
                table.Cell().Element(CellStyle).Text(stats.ProcesosEnCurso.ToString());
                table.Cell().Element(CellStyle).Text(stats.ProcesosConcluidos.ToString());

                static IContainer CellStyle(IContainer container) => container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(8);
            });
        });
    }
}
