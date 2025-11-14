import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";

import { Factura, ResumenDeuda } from "../models/factura.model";
import { facturasPorConceptoMock } from "./mock-data";

@Injectable({
  providedIn: "root"
})
export class FacturasService {
  obtenerFacturasPorConcepto(
    conceptoId: string,
    camposValidadores: Record<string, string>
  ): Observable<Factura[]> {
    const facturas = facturasPorConceptoMock[conceptoId] ?? [];

    return of(facturas).pipe(
      delay(250),
      map((lista) => lista.map((factura) => this.clonarFactura(factura)))
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
}
