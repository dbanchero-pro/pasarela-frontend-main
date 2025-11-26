import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { IndicadorPasosComponent } from "../indicador-pasos/indicador-pasos.component";
import { PasoSeleccionConceptoComponent } from "../paso-seleccion-concepto/paso-seleccion-concepto.component";
import { PasoFacturasComponent } from "../paso-facturas/paso-facturas.component";
import { PasoSeleccionBancoComponent } from "../paso-seleccion-banco/paso-seleccion-banco.component";
import { ConceptoPago } from "../../../models/concepto-pago.model";
import { Factura } from "../../../models/factura.model";
import { MedioPago } from "../../../models/medio-pago.model";
import { DatosPago } from "../../../models/datos-pago.model";
import { ComprobantePagoService } from "../../../services/comprobante-pago.service";
import { AutenticacionService } from "../../../services/autenticacion.service";
import { AppConfigService } from "../../../services/app-config.service";
import { PaginaLayoutService } from "../../../services/pagina-layout.service";
import { obtenerUrl } from "../../../utils/utils";

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
  pasoActual = 1;
  datosPago: DatosPago = {
    conceptoSeleccionado: null,
    camposValidadores: {},
    facturasSeleccionadas: [],
    bancoSeleccionado: null,
    enviarComprobantePorEmail: true
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
      descripcion: "",
      mostrarAcciones: true
    });
    void this.verificarSesion();
  }

  ngOnDestroy(): void {
    this.layout.reiniciar();
  }

  private async verificarSesion(): Promise<void> {
    this.cargandoSesion = true;
    this.sesionActiva = await this.autenticacionServicio.estaAutenticado();
    this.pasoActual = this.sesionActiva ? 2 : 1;
    this.cargandoSesion = false;
  }

  async iniciarSesion(): Promise<void> {
    if (this.autenticando) {
      return;
    }
    this.autenticando = true;
    this.errorAutenticacion = "";
    try {
      await this.autenticacionServicio.iniciarSesion(globalThis.location.href);
    } catch (error) {
      console.error(error);
      this.errorAutenticacion = "No pudimos iniciar sesión. Intenta nuevamente.";
    } finally {
      this.autenticando = false;
    }
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

  async manejarSeleccionFacturas(evento: { facturas: Factura[]; enviarComprobante: boolean }): Promise<void> {
    const { facturas, enviarComprobante } = evento;
    const facturasSeleccionadas = facturas.filter((factura) => factura.seleccionada);
    const totalSeleccionado = facturasSeleccionadas.reduce(
      (total, factura) => total + factura.importeTotal,
      0
    );

    this.datosPago = {
      ...this.datosPago,
      facturasSeleccionadas,
      enviarComprobantePorEmail: enviarComprobante,
      bancoSeleccionado: null
    };

    if (totalSeleccionado === 0 && facturasSeleccionadas.length > 0) {
      await this.redirigirPagoSinImporte();
      return;
    }

    this.actualizarPaso(4);
  }

  async manejarSeleccionBanco(banco: MedioPago): Promise<void> {
    const nuevosDatos: DatosPago = {
      ...this.datosPago,
      bancoSeleccionado: banco
    };
    this.datosPago = nuevosDatos;

    const idTransaccion = await this.iniciarTransaccion(nuevosDatos);
    await this.navegarAHomeBanking(idTransaccion);
  }

  manejarVolver(): void {
    if (this.pasoActual > 2) {
      this.actualizarPaso(this.pasoActual - 1);
    }
  }

  private async iniciarTransaccion(datosPago: DatosPago): Promise<string> {
    const respuesta = await firstValueFrom(this.comprobanteServicio.iniciarTransaccion(datosPago));
    return respuesta.idTransaccion;
  }

  private async redirigirPagoSinImporte(): Promise<void> {
    const idTransaccion = await this.iniciarTransaccion(this.datosPago);
    await this.redirigirAUrlRealizarPago(idTransaccion);
  }

  private async redirigirAUrlRealizarPago(idTransaccion: string): Promise<void> {
    const destino = this.obtenerUrlRealizarPago(idTransaccion);
    if (destino.esExterna) {
      window.location.href = destino.url;
      return;
    }

    await this.router.navigateByUrl(destino.url);
  }

  private async navegarAHomeBanking(idTransaccion: string): Promise<void> {
    await this.router.navigate(["/realizar-pago", idTransaccion]);
  }

  private obtenerUrlRealizarPago(idTransaccion: string): { url: string; esExterna: boolean } {
    const base = (this.configuracionServicio.config.urlRealizarPago ?? "/realizar-pago/:idTransaccion").trim();
    const incluyeParametro = base.includes(":idTransaccion");
    const baseSinBarraFinal = obtenerUrl(base,incluyeParametro);
    const destino = incluyeParametro
      ? base.replace(":idTransaccion", idTransaccion)
      : `${baseSinBarraFinal}/${idTransaccion}`;
    const esExterna = /^https?:\/\//i.test(destino);
    const urlNormalizada = esExterna || destino.startsWith("/") ? destino : `/${destino}`;

    return { url: urlNormalizada, esExterna };
  }

}
