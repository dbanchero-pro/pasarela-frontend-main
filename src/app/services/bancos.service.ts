import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";

import { Banco } from "../models/banco.model";
import { bancosMock } from "./mock-data";

@Injectable({
  providedIn: "root"
})
export class BancosService {
  obtenerBancos(): Observable<Banco[]> {
    return of(bancosMock).pipe(
      delay(150),
      map((bancos) => bancos.map((banco) => ({ ...banco })))
    );
  }
}
