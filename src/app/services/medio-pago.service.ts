import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { MedioPago } from "../models/medio-pago.model";
import { AppConfigService } from "./app-config.service";
import { obtenerUrl } from "../utils/utils";

@Injectable({
  providedIn: "root"
})
export class MedioPagoService {
  constructor(
    private readonly http: HttpClient,
    private readonly configuracion: AppConfigService
  ) {}

  obtenerMediosPago(): Observable<MedioPago[]> {
    return this.http.get<MedioPago[]>(`${this.apiBaseUrl}/medios-pago`);
  }

  private get apiBaseUrl(): string {
    const base = obtenerUrl(this.configuracion.config.apiUrl);
    return base ? `${base}/api/ui/v1` : "/api/ui/v1";
  }
}
