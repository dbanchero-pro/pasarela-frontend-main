import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";

import { ConceptoPago } from "../models/concepto-pago.model";
import { conceptosPagoMock } from "./mock-data";

@Injectable({
  providedIn: "root"
})
export class ConceptosPagoService {
  obtenerConceptos(): Observable<ConceptoPago[]> {
    return of(conceptosPagoMock).pipe(
      delay(150),
      map((conceptos) => conceptos.map((concepto) => ({ ...concepto })))
    );
  }
}
