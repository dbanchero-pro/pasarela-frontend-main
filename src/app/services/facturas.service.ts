import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Factura, ResumenDeuda } from "../models/factura.model";
import { AppConfigService } from "./app-config.service";

@Injectable({
  providedIn: "root"
})
export class FacturasService {
  constructor(
    private readonly http: HttpClient,
    private readonly configuracion: AppConfigService
  ) {}

  obtenerFacturasPorConcepto(
    conceptoId: string,
    camposValidadores: Record<string, string>
  ): Observable<Factura[]> {
    return this.http
      .post<Factura[]>(`${this.apiBaseUrl}/facturas/buscar`, {
        conceptoId,
        camposValidadores
      })
      .pipe(map((lista) => lista.map((factura) => this.clonarFactura(factura))));
  }

  calcularResumen(facturas: Factura[]): ResumenDeuda {
    const conceptos = new Map<string, number>();

    facturas.forEach((factura) => {
      if (!factura.seleccionada) {
        return;
      }

      factura.lineas.forEach((linea) => {
        if (!linea.seleccionada) {
          return;
        }

        const acumulado = conceptos.get(linea.descripcion) ?? 0;
        conceptos.set(linea.descripcion, acumulado + linea.importe);
      });
    });

    const conceptosResumen = Array.from(conceptos.entries()).map(([nombre, importe]) => ({
      nombre,
      importe,
    }));

    const total = conceptosResumen.reduce((suma, concepto) => suma + concepto.importe, 0);

    return { conceptos: conceptosResumen, total };
  }

  private clonarFactura(factura: Factura): Factura {
    return {
      ...factura,
      lineas: factura.lineas.map((linea) => ({ ...linea })),
    };
  }

  private get apiBaseUrl(): string {
    const base = (this.configuracion.config.apiUrl ?? "").trim().replace(/\/+$/, "");
    return base ? `${base}/api/ui/v1` : "/api/ui/v1";
  }
}
