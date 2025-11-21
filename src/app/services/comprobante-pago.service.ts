import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

import { ArchivoComprobante } from "../models/archivo-comprobante.model";
import { ComprobantePago } from "../models/comprobante-pago.model";
import { DatosPago } from "../models/datos-pago.model";
import { TransaccionPago } from "../models/transaccion-pago.model";
import { AppConfigService } from "./app-config.service";

@Injectable({
  providedIn: "root"
})
export class ComprobantePagoService {
  constructor(
    private readonly http: HttpClient,
    private readonly configuracion: AppConfigService
  ) {}

  generarComprobante(datosPago: DatosPago): Observable<ComprobantePago> {
    return this.http.post<ComprobantePago>(`${this.apiBaseUrl}/comprobantes`, datosPago);
  }

  obtenerComprobantePorNumero(numero: string): Observable<ComprobantePago | null> {
    const url = `${this.apiBaseUrl}/comprobantes/${encodeURIComponent(numero)}`;
    return this.http.get<ComprobantePago>(url).pipe(catchError(() => of(null)));
  }

  descargarArchivoComprobante(numero: string): Observable<ArchivoComprobante> {
    const url = `${this.apiBaseUrl}/comprobantes/${encodeURIComponent(numero)}/archivo`;
    return this.http.get<ArchivoComprobante>(url);
  }

  iniciarTransaccion(datosPago: DatosPago): Observable<TransaccionPago> {
    return this.http.post<TransaccionPago>(`${this.apiBaseUrl}/transacciones`, datosPago);
  }

  private get apiBaseUrl(): string {
    const base = (this.configuracion.config.apiUrl ?? "").trim().replace(/\/+$/, "");
    return base ? `${base}/api/ui/v1` : "/api/ui/v1";
  }
}
