import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface PaginaLayoutConfig {
  titulo: string;
  descripcion?: string;
  mostrarEncabezado: boolean;
  mostrarPie: boolean;
  mostrarAcciones: boolean;
}

const CONFIG_INICIAL: PaginaLayoutConfig = {
  titulo: "",
  descripcion: "",
  mostrarEncabezado: true,
  mostrarPie: true,
  mostrarAcciones: false
};

@Injectable({ providedIn: "root" })
export class PaginaLayoutService {
  private readonly configuracionSubject = new BehaviorSubject<PaginaLayoutConfig>({ ...CONFIG_INICIAL });
  readonly configuracion$ = this.configuracionSubject.asObservable();

  configurar(parcial: Partial<PaginaLayoutConfig>): void {
    const actual = this.configuracionSubject.getValue();
    this.configuracionSubject.next({ ...actual, ...parcial });
  }

  reiniciar(): void {
    this.configuracionSubject.next({ ...CONFIG_INICIAL });
  }
}
