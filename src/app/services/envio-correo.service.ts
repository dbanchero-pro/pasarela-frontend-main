import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";

import { ComprobantePago } from "../models/comprobante-pago.model";

@Injectable({ providedIn: "root" })
export class EnvioCorreoService {
  enviarCorreoComprobante(_comprobante: ComprobantePago): Observable<void> {
    return of(void 0).pipe(delay(1200));
  }
}
