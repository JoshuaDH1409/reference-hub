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
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily(Fonts.Arial));

                page.Header().Element(c => ComposeHeader(c, candidato));
                page.Content().Element(c => ComposeContent(c, candidato));
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Página ");
                    x.CurrentPageNumber();
                    x.Span(" de ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container, Candidato candidato)
    {
        var titleStyle = TextStyle.Default.FontSize(20).SemiBold().FontColor(Colors.Blue.Darken2);

        container.Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text($"Reporte de Referencias: {candidato.Nombre}").Style(titleStyle);
                column.Item().Text(text =>
                {
                    text.Span("Puesto: ").SemiBold();
                    text.Span(candidato.Puesto);
                });
                column.Item().Text(text =>
                {
                    text.Span("Fecha de Generación: ").SemiBold();
                    text.Span(DateTime.Now.ToString("dd/MM/yyyy"));
                });
            });

            row.ConstantItem(100).Height(50).Placeholder(); // Placeholder para logo de la empresa (White-labeling futuro)
        });
    }

    private void ComposeContent(IContainer container, Candidato candidato)
    {
        var respondidas = candidato.Referencias.Where(r => r.Estatus == "Respondida").ToList();
        
        container.PaddingVertical(1, Unit.Centimetre).Column(column =>
        {
            column.Spacing(20);

            // Resumen Ejecutivo
            column.Item().Text("Resumen Ejecutivo").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);
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
                    header.Cell().Element(CellStyle).Text("Total Referencias");
                    header.Cell().Element(CellStyle).Text("Respondidas");
                    header.Cell().Element(CellStyle).Text("Avance");

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                    }
                });

                table.Cell().Element(CellStyle).Text(candidato.Referencias.Count.ToString());
                table.Cell().Element(CellStyle).Text(respondidas.Count.ToString());
                var avance = candidato.Referencias.Count == 0 ? 0 : (int)Math.Round(100.0 * respondidas.Count / candidato.Referencias.Count);
                table.Cell().Element(CellStyle).Text($"{avance}%");

                static IContainer CellStyle(IContainer container)
                {
                    return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                }
            });

            // Detalle por referencia
            column.Item().Text("Detalle de Referencias").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);

            foreach (var r in respondidas)
            {
                column.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Column(refCol =>
                {
                    refCol.Spacing(5);
                    refCol.Item().Text(text =>
                    {
                        text.Span(r.NombreReferente).SemiBold().FontSize(12);
                        text.Span($" - {r.Empresa} ({r.Relacion})");
                    });

                    refCol.Item().Text(text => { text.Span("Responsabilidad: ").SemiBold(); text.Span($"{r.Responsabilidad}/10"); });
                    refCol.Item().Text(text => { text.Span("Trabajo en Equipo: ").SemiBold(); text.Span($"{r.TrabajoEquipo}/10"); });
                    refCol.Item().Text(text => { text.Span("Liderazgo: ").SemiBold(); text.Span($"{r.Liderazgo}/10"); });
                    
                    if (!string.IsNullOrEmpty(r.Fortalezas))
                    {
                        refCol.Item().PaddingTop(5).Text(text => { text.Span("Fortalezas: ").SemiBold(); text.Span(r.Fortalezas); });
                    }
                    if (!string.IsNullOrEmpty(r.AreasOportunidad))
                    {
                        refCol.Item().Text(text => { text.Span("Áreas de Oportunidad: ").SemiBold(); text.Span(r.AreasOportunidad); });
                    }
                    
                    var recon = (r.Recontrataria ?? false) ? "Sí" : "No";
                    refCol.Item().PaddingTop(5).Text(text => { text.Span("¿Recontrataría?: ").SemiBold().FontColor(Colors.Orange.Darken2); text.Span(recon); });
                });
            }
            
            if(respondidas.Count == 0)
            {
                column.Item().Text("Aún no hay referencias respondidas para generar el detalle.").Italic();
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
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily(Fonts.Arial));

                page.Header().Element(ComposeGlobalHeader);
                page.Content().Element(c => ComposeGlobalContent(c, stats));
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Página ");
                    x.CurrentPageNumber();
                    x.Span(" de ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeGlobalHeader(IContainer container)
    {
        var titleStyle = TextStyle.Default.FontSize(20).SemiBold().FontColor(Colors.Blue.Darken2);
        container.Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text("Reporte Consolidado Global").Style(titleStyle);
                column.Item().Text(text =>
                {
                    text.Span("Fecha de Generación: ").SemiBold();
                    text.Span(DateTime.Now.ToString("dd/MM/yyyy"));
                });
            });
            row.ConstantItem(100).Height(50).Placeholder(); // Placeholder para logo de la empresa
        });
    }

    private void ComposeGlobalContent(IContainer container, DashboardStatsDto stats)
    {
        container.PaddingVertical(1, Unit.Centimetre).Column(column =>
        {
            column.Spacing(20);

            // Row 1: KPI Cards (Candidatos, Recontratacion, Tiempo)
            column.Item().Row(row =>
            {
                row.Spacing(15);
                
                // KPI 1
                row.RelativeItem().Background(Colors.Grey.Lighten4).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(15).Column(c =>
                {
                    c.Item().Text("Promedio Global").FontSize(12).FontColor(Colors.Grey.Darken2);
                    c.Item().Text($"{stats.PromedioGeneral:0.0} / 10").FontSize(24).SemiBold().FontColor(Colors.Blue.Darken2);
                    c.Item().PaddingTop(5).Text($"{stats.TotalCandidatos} candidatos").FontSize(10).FontColor(Colors.Grey.Medium);
                });

                // KPI 2
                row.RelativeItem().Background(Colors.Grey.Lighten4).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(15).Column(c =>
                {
                    c.Item().Text("Índice de Recontratación").FontSize(12).FontColor(Colors.Grey.Darken2);
                    c.Item().Text($"{stats.PorcentajeRecontratacion}%").FontSize(24).SemiBold().FontColor(Colors.Blue.Darken2);
                    c.Item().PaddingTop(5).Text("De los que tienen score").FontSize(10).FontColor(Colors.Grey.Medium);
                });

                // KPI 3
                row.RelativeItem().Background(Colors.Grey.Lighten4).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(15).Column(c =>
                {
                    c.Item().Text("Tiempo Promedio").FontSize(12).FontColor(Colors.Grey.Darken2);
                    var dias = stats.TiempoPromedioDias.HasValue ? $"{stats.TiempoPromedioDias.Value:0.0} días" : "N/A";
                    c.Item().Text(dias).FontSize(24).SemiBold().FontColor(Colors.Orange.Darken1);
                    c.Item().PaddingTop(5).Text("De respuesta").FontSize(10).FontColor(Colors.Grey.Medium);
                });
            });

            // Risk Distribution
            column.Item().PaddingTop(10).Text("Análisis de Riesgo General").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);
            
            column.Item().Row(row => 
            {
                row.Spacing(15);
                var total = stats.RiesgoBajo + stats.RiesgoMedio + stats.RiesgoAlto;
                total = total > 0 ? total : 1;

                row.RelativeItem().Background(Colors.Green.Lighten5).Border(1).BorderColor(Colors.Green.Lighten2).Padding(10).Column(c =>
                {
                    c.Item().Text("Bajo Riesgo").FontSize(12).SemiBold().FontColor(Colors.Green.Darken3);
                    c.Item().Text($"{stats.RiesgoBajo} candidatos").FontSize(16).FontColor(Colors.Green.Darken2);
                    c.Item().Text($"{Math.Round(100.0 * stats.RiesgoBajo / total)}%").FontSize(10).FontColor(Colors.Grey.Darken1);
                });

                row.RelativeItem().Background(Colors.Yellow.Lighten5).Border(1).BorderColor(Colors.Yellow.Lighten2).Padding(10).Column(c =>
                {
                    c.Item().Text("Riesgo Medio").FontSize(12).SemiBold().FontColor(Colors.Orange.Darken2);
                    c.Item().Text($"{stats.RiesgoMedio} candidatos").FontSize(16).FontColor(Colors.Orange.Darken2);
                    c.Item().Text($"{Math.Round(100.0 * stats.RiesgoMedio / total)}%").FontSize(10).FontColor(Colors.Grey.Darken1);
                });

                row.RelativeItem().Background(Colors.Red.Lighten5).Border(1).BorderColor(Colors.Red.Lighten2).Padding(10).Column(c =>
                {
                    c.Item().Text("Alto Riesgo").FontSize(12).SemiBold().FontColor(Colors.Red.Darken2);
                    c.Item().Text($"{stats.RiesgoAlto} candidatos").FontSize(16).FontColor(Colors.Red.Darken2);
                    c.Item().Text($"{Math.Round(100.0 * stats.RiesgoAlto / total)}%").FontSize(10).FontColor(Colors.Grey.Darken1);
                });
            });

            // Promedio por Competencias
            if (stats.CompetenciasGlobales != null && stats.CompetenciasGlobales.Any())
            {
                column.Item().PaddingTop(10).Text("Promedio de Competencias (Top 3)").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);
                column.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(15).Column(compCol =>
                {
                    compCol.Spacing(10);
                    var top3 = stats.CompetenciasGlobales.Take(3).ToList();
                    foreach (var c in top3)
                    {
                        compCol.Item().Row(r =>
                        {
                            r.RelativeItem().Text(c.Nombre).FontSize(12).SemiBold().FontColor(Colors.Grey.Darken3);
                            r.ConstantItem(50).AlignRight().Text($"{c.Promedio:0.0}/10").FontSize(12).SemiBold().FontColor(Colors.Blue.Darken2);
                        });
                        compCol.Item().Height(8).Background(Colors.Grey.Lighten3).Row(r =>
                        {
                            r.RelativeItem((float)(c.Promedio)).Background(Colors.Blue.Darken2);
                            r.RelativeItem((float)(10.0 - c.Promedio)).Background(Colors.Transparent);
                        });
                    }
                });
            }

            // Conversion and Funnel
            column.Item().PaddingTop(10).Text("Eficiencia de Referencias").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);
            column.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(15).Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("Tasa de Conversión (Enviadas vs Recibidas)").SemiBold();
                    c.Item().PaddingTop(10).Row(r => 
                    {
                        var conversion = stats.ReferenciasEnviadas > 0 ? (float)stats.ReferenciasRecibidas / stats.ReferenciasEnviadas : 0f;
                        if (conversion > 0)
                            r.RelativeItem(conversion).Height(15).Background(Colors.Orange.Medium);
                        if (conversion < 1)
                            r.RelativeItem(1f - conversion).Height(15).Background(Colors.Grey.Lighten2);
                    });
                    c.Item().PaddingTop(5).Text($"Enviadas: {stats.ReferenciasEnviadas} | Recibidas: {stats.ReferenciasRecibidas} | Pendientes: {stats.ReferenciasPendientes}").FontSize(10).FontColor(Colors.Grey.Darken2);
                });
            });

            // Overall Funnel
            column.Item().PaddingTop(10).Text("Estado de los Procesos").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);
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

                    static IContainer CellStyle(IContainer container) => container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                });

                table.Cell().Element(CellStyle).Text(stats.TotalCandidatos.ToString());
                table.Cell().Element(CellStyle).Text(stats.ProcesosEnCurso.ToString());
                table.Cell().Element(CellStyle).Text(stats.ProcesosConcluidos.ToString());

                static IContainer CellStyle(IContainer container) => container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
            });
        });
    }
}
