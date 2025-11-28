import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Factura, FacturasPaginadas, ResumenDeuda } from "../models/factura.model";
import { AppConfigService } from "./app-config.service";
import { obtenerUrl } from "../utils/utils";

@Injectable({
  providedIn: "root"
})
export class FacturaService {
  constructor(
    private readonly http: HttpClient,
    private readonly configuracion: AppConfigService
  ) {}

  obtenerFacturasPorConcepto(
    conceptoId: string,
    camposValidadores: Record<string, string>,
    opciones: FacturasQuery
  ): Observable<FacturasPaginadas> {
    const params = new HttpParams()
      .set("page", opciones.pagina.toString())
      .set("size", opciones.tamanio.toString())
      .append("sort", `${opciones.ordenCampo},${opciones.ordenDireccion}`);

    const payload = {
      conceptoId,
      camposValidadores
    };

    return this.http
      .post<FacturasPaginadas>(`${this.apiBaseUrl}/facturas/buscar`, payload, { params })
      .pipe(
        map((respuesta) => ({
          ...respuesta,
          content: respuesta.content.map((factura) => this.clonarFactura(factura))
        }))
      );
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
    const base = obtenerUrl(this.configuracion.config.apiUrl);
    return base ? `${base}/api/ui/v1` : "/api/ui/v1";
  }
}

export interface FacturasQuery {
  pagina: number;
  tamanio: number;
  ordenCampo: string;
  ordenDireccion: "asc" | "desc";
}
