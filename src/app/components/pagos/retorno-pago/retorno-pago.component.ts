import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { IndicadorPasosComponent } from "../indicador-pasos/indicador-pasos.component";
import { PasoComprobanteComponent } from "../paso-comprobante/paso-comprobante.component";
import { ComprobantePago } from "../../../models/comprobante-pago.model";
import { ComprobantePagoService } from "../../../services/comprobante-pago.service";
import { PaginaLayoutService } from "../../../services/pagina-layout.service";
import { AutenticacionService } from "../../../services/autenticacion.service";

@Component({
  selector: "app-retorno-pago",
  standalone: true,
  imports: [CommonModule, RouterModule, IndicadorPasosComponent, PasoComprobanteComponent],
  templateUrl: "./retorno-pago.component.html",
  styleUrl: "./retorno-pago.component.scss"
})
export class RetornoPagoComponent implements OnInit, OnDestroy {
  @ViewChild("accionesHeader", { static: true }) accionesHeader?: TemplateRef<unknown>;
  comprobante: ComprobantePago | null = null;
  cargando = true;
  mensajeError = "";
  private idTransaccion = "";
  sesionActiva = false;

  constructor(
    private readonly ruta: ActivatedRoute,
    private readonly router: Router,
    private readonly comprobanteServicio: ComprobantePagoService,
    private readonly layout: PaginaLayoutService,
    private readonly autenticacionServicio: AutenticacionService
  ) {}

  async ngOnInit(): Promise<void> {
    this.layout.establecerAcciones(null);
    await this.verificarSesion();
    this.layout.configurar({
      titulo: "Comprobante del pago",
      descripcion: "Revisa el detalle del paso final.",
      mostrarEncabezado: true,
      mostrarPie: true,
      mostrarAcciones: this.sesionActiva
    });
    if (this.sesionActiva) {
      this.layout.establecerAcciones(this.accionesHeader ?? null);
    }
    this.idTransaccion = this.ruta.snapshot.paramMap.get("idTransaccion") ?? "";
    if (!this.idTransaccion) {
      this.cargando = false;
      this.mensajeError = "No pudimos identificar la transacción.";
      return;
    }

    await this.cargarComprobante(this.idTransaccion);
  }

  ngOnDestroy(): void {
    this.layout.reiniciar();
  }

  async cerrarSesion(): Promise<void> {
    await this.autenticacionServicio.cerrarSesion(window.location.origin);
    this.sesionActiva = false;
    this.layout.establecerAcciones(null);
    this.layout.configurar({ mostrarAcciones: false });
  }

  async recargar(): Promise<void> {
    if (!this.idTransaccion) {
      return;
    }
    await this.cargarComprobante(this.idTransaccion);
  }

  iniciarNuevoPago(): void {
    void this.router.navigate(["/"]);
  }

  private async cargarComprobante(id: string): Promise<void> {
    this.cargando = true;
    this.comprobante = await firstValueFrom(this.comprobanteServicio.obtenerComprobantePorNumero(id));
    this.cargando = false;

    if (!this.comprobante) {
      this.mensajeError = "No encontramos el comprobante generado para esta transacción.";
    } else {
      this.mensajeError = "";
    }
  }

  private async verificarSesion(): Promise<void> {
    this.sesionActiva = await this.autenticacionServicio.estaAutenticado();
  }
}
