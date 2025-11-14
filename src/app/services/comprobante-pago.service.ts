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

    const comprobante: ComprobantePago = {
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
      estado: "Pagado",
      fechaVencimiento: "20/10/2025",
      codigoVerificacion: this.generarCodigoVerificacion()
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
}
