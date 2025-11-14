import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay, tap } from "rxjs/operators";

import { ComprobantePago } from "../models/comprobante-pago.model";
import { DatosPago } from "../models/datos-pago.model";
import { FacturasService } from "./facturas.service";

@Injectable({
  providedIn: "root"
})
export class ComprobantePagoService {
  private comprobantes = new Map<string, ComprobantePago>();

  constructor(private readonly facturasServicio: FacturasService) {}

  generarComprobante(datosPago: DatosPago): Observable<ComprobantePago> {
    const ahora = new Date();
    const resumen = this.facturasServicio.calcularResumen(datosPago.facturasSeleccionadas);
    const numeroAleatorio = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(9, "0");

    const numeroComprobante = "IC-" + ahora.getFullYear() + "-" + numeroAleatorio;

    const baseComprobante = {
      numeroComprobante,
      fechaEmision: ahora.toLocaleDateString("es-UY"),
      hora: ahora.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" }),
      contribuyente: "Usuario Ejemplo",
      codigoMunicipal: datosPago.camposValidadores["codigoMunicipal"],
      padron: datosPago.camposValidadores["padron"],
      numeroTramite: datosPago.camposValidadores["numeroTramite"],
      localidad: "Canelones",
      tributo: datosPago.conceptoSeleccionado?.nombre ?? "",
      periodo: "Cuota 4 - Año 2025",
      montoPagado: resumen.total,
      formaPago: datosPago.bancoSeleccionado?.nombre ?? "Desconocido",
      autorizacion: Math.floor(Math.random() * 1_000_000_000).toString(),
      estado: "Pagado" as const,
      fechaVencimiento: "20/10/2025",
      codigoVerificacion: this.generarCodigoVerificacion()
    } satisfies Omit<ComprobantePago, "archivoBase64" | "nombreArchivo" | "tipoArchivo">;

    const archivo = this.crearArchivoComprobante(baseComprobante);
    const comprobante: ComprobantePago = {
      ...baseComprobante,
      archivoBase64: archivo.base64,
      nombreArchivo: archivo.nombre,
      tipoArchivo: archivo.tipo
    };

    return of(comprobante).pipe(
      delay(200),
      tap((comp) => this.comprobantes.set(comp.numeroComprobante, comp))
    );
  }

  obtenerComprobantePorNumero(numero: string): Observable<ComprobantePago | null> {
    return of(this.comprobantes.get(numero) ?? null);
  }

  private generarCodigoVerificacion(): string {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const partes: string[] = [];

    for (let i = 0; i < 3; i += 1) {
      let segmento = "";
      for (let j = 0; j < 4; j += 1) {
        segmento += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      partes.push(segmento);
    }

    return "CNL-" + partes.join("-");
  }

  private crearArchivoComprobante(
    comprobante: Omit<ComprobantePago, "archivoBase64" | "nombreArchivo" | "tipoArchivo">
  ): { base64: string; nombre: string; tipo: string } {
    const lineas = [
      "Comprobante de Pago - Intendencia de Canelones",
      `Número: ${comprobante.numeroComprobante}`,
      `Fecha: ${comprobante.fechaEmision} ${comprobante.hora}`,
      `Contribuyente: ${comprobante.contribuyente}`,
      `Monto pagado: $${comprobante.montoPagado.toFixed(2)}`,
      `Estado: ${comprobante.estado}`,
      `Código de verificación: ${comprobante.codigoVerificacion}`
    ];
    const pdf = this.crearPdf(lineas);
    return {
      base64: this.codificarABase64(pdf),
      nombre: `${comprobante.numeroComprobante}.pdf`,
      tipo: "application/pdf"
    };
  }

  private crearPdf(lineas: string[]): string {
    const escapeTexto = (valor: string) => valor.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const contenidoTexto = lineas
      .map((linea, indice) => `${indice === 0 ? "" : "T* "}(${escapeTexto(linea)}) Tj`)
      .join("\n");
    const stream = `BT /F1 12 Tf 14 TL 72 750 Td ${contenidoTexto} ET`;

    const objetos: string[] = [];
    objetos.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
    objetos.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
    objetos.push(
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj"
    );
    objetos.push(`4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`);
    objetos.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica >>\nendobj");

    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [];
    for (const objeto of objetos) {
      offsets.push(pdf.length);
      pdf += `${objeto}\n`;
    }

    const inicioXref = pdf.length;
    let xref = `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets) {
      xref += `${offset.toString().padStart(10, "0")} 00000 n \n`;
    }

    pdf += xref;
    pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`;
    return pdf;
  }

  private codificarABase64(valor: string): string {
    try {
      return btoa(unescape(encodeURIComponent(valor)));
    } catch {
      return "";
    }
  }
}
