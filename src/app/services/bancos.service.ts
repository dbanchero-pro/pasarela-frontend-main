import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Banco } from "../models/banco.model";
import { AppConfigService } from "./app-config.service";

@Injectable({
  providedIn: "root"
})
export class BancosService {
  constructor(
    private readonly http: HttpClient,
    private readonly configuracion: AppConfigService
  ) {}

  obtenerBancos(): Observable<Banco[]> {
    return this.http.get<Banco[]>(`${this.apiBaseUrl}/bancos`);
  }

  private get apiBaseUrl(): string {
    const base = (this.configuracion.config.apiUrl ?? "").trim().replace(/\/+$/, "");
    return base ? `${base}/api/ui/v1` : "/api/ui/v1";
  }
}
