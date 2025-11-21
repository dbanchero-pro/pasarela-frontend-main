import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { ConceptoPago } from "../models/concepto-pago.model";
import { AppConfigService } from "./app-config.service";

@Injectable({
  providedIn: "root"
})
export class ConceptosPagoService {
  constructor(
    private readonly http: HttpClient,
    private readonly configuracion: AppConfigService
  ) {}

  obtenerConceptos(): Observable<ConceptoPago[]> {
    return this.http.get<ConceptoPago[]>(`${this.apiBaseUrl}/conceptos`);
  }

  private get apiBaseUrl(): string {
    const base = (this.configuracion.config.apiUrl ?? "").trim().replace(/\/+$/, "");
    return base ? `${base}/api/ui/v1` : "/api/ui/v1";
  }
}
