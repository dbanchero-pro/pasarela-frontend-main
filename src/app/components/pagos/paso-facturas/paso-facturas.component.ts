import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { Factura } from "../../../models/factura.model";
import { FacturasService } from "../../../services/facturas.service";

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

  facturas: Factura[] = [];
  criterioOrden: CriterioOrden = "vencimiento";
  paginaActual = 1;
  readonly facturasPorPagina = 2;
  cargando = false;
  enviarComprobantePorEmail = true;

  constructor(private readonly facturasServicio: FacturasService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes["conceptoId"] && this.conceptoId) || changes["camposValidadores"]) {
      this.paginaActual = 1;
      void this.cargarFacturas();
      return;
    }

    if (changes["facturasPreseleccionadas"] && !changes["conceptoId"]) {
      this.sincronizarSeleccion();
    }
  }

  get facturasOrdenadas(): Factura[] {
    const copia = [...this.facturas];
    switch (this.criterioOrden) {
      case "numero":
        return copia.sort((a, b) => a.numero.localeCompare(b.numero));
      case "monto":
        return copia.sort((a, b) => b.importeTotal - a.importeTotal);
      case "vencimiento":
      default:
        return copia.sort((a, b) => this.parsearFecha(a.vencimiento) - this.parsearFecha(b.vencimiento));
    }
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.facturasOrdenadas.length / this.facturasPorPagina));
  }

  get facturasVisibles(): Factura[] {
    const inicio = (this.paginaActual - 1) * this.facturasPorPagina;
    return this.facturasOrdenadas.slice(inicio, inicio + this.facturasPorPagina);
  }

  get resumen() {
    return this.facturasServicio.calcularResumen(this.facturas);
  }

  get haySeleccion(): boolean {
    return this.facturas.some((factura) => factura.seleccionada);
  }

  get todasSeleccionadas(): boolean {
    return this.facturas.length > 0 && this.facturas.every((factura) => factura.seleccionada);
  }

  get facturasSeleccionadas(): number {
    return this.facturas.filter((factura) => factura.seleccionada).length;
  }

  cambiarOrden(criterio: CriterioOrden): void {
    this.criterioOrden = criterio;
    this.paginaActual = 1;
  }

  irAPagina(pagina: number | null): void {
    if (pagina === null || pagina < 1 || pagina > this.totalPaginas) {
      return;
    }
    this.paginaActual = pagina;
  }

  toggleFactura(numero: string): void {
    this.facturas = this.facturas.map((factura) => {
      if (factura.numero !== numero) {
        return factura;
      }
      const seleccionada = !factura.seleccionada;
      return {
        ...factura,
        seleccionada,
        lineas: factura.lineas.map((linea) => ({ ...linea, seleccionada }))
      };
    });
  }

  toggleTodas(): void {
    const estado = !this.todasSeleccionadas;
    this.facturas = this.facturas.map((factura) => ({
      ...factura,
      seleccionada: estado,
      lineas: factura.lineas.map((linea) => ({ ...linea, seleccionada: estado }))
    }));
  }

  continuarPaso(): void {
    this.continuar.emit({ facturas: this.facturas, enviarComprobante: this.enviarComprobantePorEmail });
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
      const respuesta = await firstValueFrom(
        this.facturasServicio.obtenerFacturasPorConcepto(this.conceptoId, this.camposValidadores)
      );
      this.facturas = this.aplicarPreseleccion(respuesta);
    } finally {
      this.cargando = false;
    }
  }

  private aplicarPreseleccion(facturas: Factura[]): Factura[] {
    return facturas.map((factura) => {
      const previa = this.facturasPreseleccionadas.find((item) => item.numero === factura.numero);
      if (!previa || !previa.seleccionada) {
        return factura;
      }
      return {
        ...factura,
        seleccionada: true,
        lineas: factura.lineas.map((linea) => ({ ...linea, seleccionada: true }))
      };
    });
  }

  private sincronizarSeleccion(): void {
    if (!this.facturas.length) {
      return;
    }
    this.facturas = this.aplicarPreseleccion(this.facturas);
  }

  private parsearFecha(valor: string): number {
    const [dia, mes, anio] = valor.split("/").map((parte) => Number(parte));
    const fecha = new Date(anio, mes - 1, dia);
    return fecha.getTime();
  }
}
