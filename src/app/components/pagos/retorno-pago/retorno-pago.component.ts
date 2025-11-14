import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { IndicadorPasosComponent } from "../indicador-pasos/indicador-pasos.component";
import { PasoComprobanteComponent } from "../paso-comprobante/paso-comprobante.component";
import { ComprobantePago } from "../../../models/comprobante-pago.model";
import { ComprobantePagoService } from "../../../services/comprobante-pago.service";
import { PaginaLayoutService } from "../../../services/pagina-layout.service";

@Component({
  selector: "app-retorno-pago",
  standalone: true,
  imports: [CommonModule, RouterModule, IndicadorPasosComponent, PasoComprobanteComponent],
  templateUrl: "./retorno-pago.component.html",
  styleUrl: "./retorno-pago.component.scss"
})
export class RetornoPagoComponent implements OnInit, OnDestroy {
  comprobante: ComprobantePago | null = null;
  cargando = true;
  mensajeError = "";
  private idTransaccion = "";

  constructor(
    private readonly ruta: ActivatedRoute,
    private readonly router: Router,
    private readonly comprobanteServicio: ComprobantePagoService,
    private readonly layout: PaginaLayoutService
  ) {}

  async ngOnInit(): Promise<void> {
    this.layout.configurar({
      titulo: "Comprobante del pago",
      descripcion: "Revisa el detalle del paso final.",
      mostrarEncabezado: true,
      mostrarPie: true,
      mostrarAcciones: false
    });
    this.layout.establecerAcciones(null);
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
}
