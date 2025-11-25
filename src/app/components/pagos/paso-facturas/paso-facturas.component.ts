import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { Factura } from "../../../models/factura.model";
import { FacturasQuery, FacturasService } from "../../../services/facturas.service";

export type CriterioOrden = "numero" | "vencimiento" | "monto";

@Component({
  selector: "app-paso-facturas",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./paso-facturas.component.html",
  styleUrl: "./paso-facturas.component.scss"
})
export class PasoFacturasComponent implements OnChanges {
  @Input({ required: true }) conceptoId!: string;
  @Input({ required: true }) camposValidadores: Record<string, string> = {};
  @Input() facturasPreseleccionadas: Factura[] = [];

  @Output() continuar = new EventEmitter<{ facturas: Factura[]; enviarComprobante: boolean }>();
  @Output() volver = new EventEmitter<void>();

  facturasPagina: Factura[] = [];
  totalFacturas = 0;
  criterioOrden: CriterioOrden = "vencimiento";
  ordenDireccion: "asc" | "desc" = "asc";
  paginaActual = 1;
  readonly facturasPorPagina = 2;
  cargando = false;
  enviarComprobantePorEmail = true;

  private readonly seleccion = new Map<string, Factura>();

  constructor(private readonly facturasServicio: FacturasService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes["conceptoId"] && this.conceptoId) || changes["camposValidadores"]) {
      this.paginaActual = 1;
      this.actualizarSeleccionDesdePreseleccion();
      void this.cargarFacturas();
      return;
    }

    if (changes["facturasPreseleccionadas"] && !changes["conceptoId"]) {
      this.actualizarSeleccionDesdePreseleccion();
      this.facturasPagina = this.aplicarSeleccionPagina(this.facturasPagina);
    }
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalFacturas / this.facturasPorPagina));
  }

  get resumen() {
    return this.facturasServicio.calcularResumen(Array.from(this.seleccion.values()));
  }

  get haySeleccion(): boolean {
    return this.seleccion.size > 0;
  }

  get todasSeleccionadas(): boolean {
    return this.facturasPagina.length > 0 && this.facturasPagina.every((factura) => this.seleccion.has(factura.numero));
  }

  get facturasSeleccionadas(): number {
    return this.seleccion.size;
  }

  cambiarOrden(criterio: CriterioOrden): void {
    this.criterioOrden = criterio;
    this.ordenDireccion = criterio === "monto" ? "desc" : "asc";
    this.paginaActual = 1;
    void this.cargarFacturas();
  }

  irAPagina(pagina: number | null): void {
    if (pagina === null || pagina < 1 || pagina > this.totalPaginas) {
      return;
    }
    this.paginaActual = pagina;
    void this.cargarFacturas();
  }

  toggleFactura(numero: string): void {
    this.facturasPagina = this.facturasPagina.map((factura) => {
      if (factura.numero !== numero) {
        return factura;
      }
      const estabaSeleccionada = this.seleccion.has(numero);
      if (estabaSeleccionada) {
        this.seleccion.delete(numero);
      } else {
        this.seleccion.set(numero, this.clonarFactura(factura, true));
      }
      return this.clonarFactura(factura, !estabaSeleccionada);
    });
  }

  toggleTodas(): void {
    const estado = !this.todasSeleccionadas;
    this.facturasPagina = this.facturasPagina.map((factura) => {
      if (estado) {
        this.seleccion.set(factura.numero, this.clonarFactura(factura, true));
      } else {
        this.seleccion.delete(factura.numero);
      }
      return this.clonarFactura(factura, estado);
    });
  }

  continuarPaso(): void {
    this.continuar.emit({ facturas: Array.from(this.seleccion.values()), enviarComprobante: this.enviarComprobantePorEmail });
  }

  actualizarPreferenciaCorreo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.enviarComprobantePorEmail = input.checked;
  }

  generarNumerosPagina(): (number | null)[] {
    const paginas: (number | null)[] = [];

    if (this.totalPaginas <= 5) {
      for (let i = 1; i <= this.totalPaginas; i += 1) {
        paginas.push(i);
      }
      return paginas;
    }

    paginas.push(1);

    const mostrarInicio = Math.max(2, this.paginaActual - 1);
    const mostrarFin = Math.min(this.totalPaginas - 1, this.paginaActual + 1);

    if (mostrarInicio > 2) {
      paginas.push(null);
    }

    for (let i = mostrarInicio; i <= mostrarFin; i += 1) {
      paginas.push(i);
    }

    if (mostrarFin < this.totalPaginas - 1) {
      paginas.push(null);
    }

    paginas.push(this.totalPaginas);

    return paginas;
  }

  private async cargarFacturas(): Promise<void> {
    this.cargando = true;
    try {
      const opciones: FacturasQuery = {
        pagina: Math.max(this.paginaActual - 1, 0),
        tamanio: this.facturasPorPagina,
        ordenCampo: this.criterioOrden,
        ordenDireccion: this.ordenDireccion
      };
      const respuesta = await firstValueFrom(
        this.facturasServicio.obtenerFacturasPorConcepto(this.conceptoId, this.camposValidadores, opciones)
      );
      this.totalFacturas = respuesta.page.totalElements;
      this.paginaActual = respuesta.page.number + 1;
      this.facturasPagina = this.aplicarSeleccionPagina(respuesta.content);
    } finally {
      this.cargando = false;
    }
  }

  private aplicarSeleccionPagina(facturas: Factura[]): Factura[] {
    return facturas.map((factura) => this.clonarFactura(factura, this.seleccion.has(factura.numero)));
  }

  private actualizarSeleccionDesdePreseleccion(): void {
    this.seleccion.clear();
    this.facturasPreseleccionadas
      .filter((factura) => factura.seleccionada)
      .forEach((factura) => this.seleccion.set(factura.numero, this.clonarFactura(factura, true)));
  }

  private clonarFactura(factura: Factura, seleccionada: boolean): Factura {
    return {
      ...factura,
      seleccionada,
      lineas: factura.lineas.map((linea) => ({ ...linea, seleccionada }))
    };
  }
}
