import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { IndicadorPasosComponent } from "../indicador-pasos/indicador-pasos.component";
import { PasoSeleccionConceptoComponent } from "../paso-seleccion-concepto/paso-seleccion-concepto.component";
import { PasoFacturasComponent } from "../paso-facturas/paso-facturas.component";
import { PasoSeleccionBancoComponent } from "../paso-seleccion-banco/paso-seleccion-banco.component";
import { ConceptoPago } from "../../../models/concepto-pago.model";
import { Factura } from "../../../models/factura.model";
import { Banco } from "../../../models/banco.model";
import { DatosPago } from "../../../models/datos-pago.model";
import { ComprobantePago } from "../../../models/comprobante-pago.model";
import { ComprobantePagoService } from "../../../services/comprobante-pago.service";
import { AutenticacionService } from "../../../services/autenticacion.service";
import { AppConfigService } from "../../../services/app-config.service";
import { PaginaLayoutService } from "../../../services/pagina-layout.service";

@Component({
  selector: "app-pagos",
  standalone: true,
  imports: [
    CommonModule,
    IndicadorPasosComponent,
    PasoSeleccionConceptoComponent,
    PasoFacturasComponent,
    PasoSeleccionBancoComponent
  ],
  templateUrl: "./pagos.component.html",
  styleUrl: "./pagos.component.scss"
})
export class PagosComponent implements OnInit, OnDestroy {
  @ViewChild("accionesHeader", { static: true }) accionesHeader?: TemplateRef<unknown>;
  pasoActual = 1;
  datosPago: DatosPago = {
    conceptoSeleccionado: null,
    camposValidadores: {},
    facturasSeleccionadas: [],
    bancoSeleccionado: null
  };
  sesionActiva = false;
  cargandoSesion = true;
  autenticando = false;
  errorAutenticacion = "";

  constructor(
    private readonly comprobanteServicio: ComprobantePagoService,
    private readonly autenticacionServicio: AutenticacionService,
    private readonly router: Router,
    private readonly configuracionServicio: AppConfigService,
    private readonly layout: PaginaLayoutService
  ) {}

  ngOnInit(): void {
    this.layout.configurar({
      titulo: "Pagos en Línea",
      descripcion: "",
      mostrarEncabezado: true,
      mostrarPie: true,
      mostrarAcciones: this.sesionActiva
    });
    this.layout.establecerAcciones(this.accionesHeader ?? null);
    void this.verificarSesion();
  }

  ngOnDestroy(): void {
    this.layout.establecerAcciones(null);
    this.layout.reiniciar();
  }

  private async verificarSesion(): Promise<void> {
    this.cargandoSesion = true;
    this.sesionActiva = await this.autenticacionServicio.estaAutenticado();
    this.pasoActual = this.sesionActiva ? 2 : 1;
    this.cargandoSesion = false;
    this.actualizarLayoutAcciones();
  }

  async iniciarSesion(): Promise<void> {
    if (this.autenticando) {
      return;
    }
    this.autenticando = true;
    this.errorAutenticacion = "";
    try {
      await this.autenticacionServicio.iniciarSesion(window.location.href);
    } catch (error) {
      this.errorAutenticacion = "No pudimos iniciar sesión. Intenta nuevamente.";
    } finally {
      this.autenticando = false;
    }
  }

  async cerrarSesion(): Promise<void> {
    await this.autenticacionServicio.cerrarSesion(window.location.origin);
    this.sesionActiva = false;
    this.actualizarLayoutAcciones();
  }

  actualizarPaso(paso: number): void {
    this.pasoActual = paso;
  }

  manejarSeleccionConcepto(evento: { concepto: ConceptoPago; campos: Record<string, string> }): void {
    this.datosPago = {
      ...this.datosPago,
      conceptoSeleccionado: evento.concepto,
      camposValidadores: evento.campos,
      facturasSeleccionadas: [],
      bancoSeleccionado: null
    };
    this.actualizarPaso(3);
  }

  async manejarSeleccionFacturas(facturas: Factura[]): Promise<void> {
    const facturasSeleccionadas = facturas.filter((factura) => factura.seleccionada);
    const totalSeleccionado = facturasSeleccionadas.reduce(
      (total, factura) => total + factura.importeTotal,
      0
    );

    this.datosPago = {
      ...this.datosPago,
      facturasSeleccionadas
    };

    if (totalSeleccionado === 0) {
      const comprobante = await this.generarComprobante({
        ...this.datosPago,
        facturasSeleccionadas,
        bancoSeleccionado: null
      });
      await this.redirigirAlPasoFinal(comprobante.numeroComprobante, false);
      return;
    }

    this.actualizarPaso(4);
  }

  async manejarSeleccionBanco(banco: Banco): Promise<void> {
    const nuevosDatos: DatosPago = {
      ...this.datosPago,
      bancoSeleccionado: banco
    };
    this.datosPago = nuevosDatos;

    const comprobante = await this.generarComprobante(nuevosDatos);
    await this.redirigirAlPasoFinal(comprobante.numeroComprobante, true);
  }

  manejarVolver(): void {
    if (this.pasoActual > 2) {
      this.actualizarPaso(this.pasoActual - 1);
    }
  }

  private async generarComprobante(datosPago: DatosPago): Promise<ComprobantePago> {
    return await firstValueFrom(this.comprobanteServicio.generarComprobante(datosPago));
  }

  private async redirigirAlPasoFinal(idTransaccion: string, requierePago: boolean): Promise<void> {
    if (!requierePago) {
      await this.router.navigate(["/retorno-pago", idTransaccion]);
      return;
    }

    const destino = this.obtenerUrlRealizarPago(idTransaccion);
    if (destino.esExterna) {
      window.location.href = destino.url;
      return;
    }

    await this.router.navigateByUrl(destino.url);
  }

  private obtenerUrlRealizarPago(idTransaccion: string): { url: string; esExterna: boolean } {
    const base = (this.configuracionServicio.config.urlRealizarPago ?? "/realizar-pago/:idTransaccion").trim();
    const incluyeParametro = base.includes(":idTransaccion");
    const baseSinBarraFinal = incluyeParametro ? base : base.replace(/\/+$/, "");
    const destino = incluyeParametro
      ? base.replace(":idTransaccion", idTransaccion)
      : `${baseSinBarraFinal}/${idTransaccion}`;
    const esExterna = /^https?:\/\//i.test(destino);
    const urlNormalizada = esExterna || destino.startsWith("/") ? destino : `/${destino}`;

    return { url: urlNormalizada, esExterna };
  }

  private actualizarLayoutAcciones(): void {
    this.layout.configurar({ mostrarAcciones: this.sesionActiva });
  }
}
