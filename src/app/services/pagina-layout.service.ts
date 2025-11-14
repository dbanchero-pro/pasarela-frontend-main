import { Injectable, TemplateRef } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface PaginaLayoutConfig {
  titulo: string;
  descripcion?: string;
  mostrarEncabezado: boolean;
  mostrarPie: boolean;
  mostrarAcciones: boolean;
  accionesTemplate: TemplateRef<unknown> | null;
}

const CONFIG_INICIAL: PaginaLayoutConfig = {
  titulo: "",
  descripcion: "",
  mostrarEncabezado: true,
  mostrarPie: true,
  mostrarAcciones: false,
  accionesTemplate: null
};

@Injectable({ providedIn: "root" })
export class PaginaLayoutService {
  private readonly configuracionSubject = new BehaviorSubject<PaginaLayoutConfig>({ ...CONFIG_INICIAL });
  readonly configuracion$ = this.configuracionSubject.asObservable();

  configurar(parcial: Partial<PaginaLayoutConfig>): void {
    const actual = this.configuracionSubject.getValue();
    this.configuracionSubject.next({ ...actual, ...parcial });
  }

  establecerAcciones(template: TemplateRef<unknown> | null): void {
    this.configurar({ accionesTemplate: template });
  }

  reiniciar(): void {
    this.configuracionSubject.next({ ...CONFIG_INICIAL });
  }
}
