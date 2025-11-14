import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";

import { PaginaLayoutService } from "../../../services/pagina-layout.service";

@Component({
  selector: "app-realizar-pago",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./realizar-pago.component.html",
  styleUrl: "./realizar-pago.component.scss"
})
export class RealizarPagoComponent implements OnInit, OnDestroy {
  idTransaccion = "";
  procesando = false;

  constructor(
    private readonly ruta: ActivatedRoute,
    private readonly router: Router,
    private readonly layout: PaginaLayoutService
  ) {}

  ngOnInit(): void {
    this.idTransaccion = this.ruta.snapshot.paramMap.get("idTransaccion") ?? "";
    this.layout.configurar({
      titulo: "Home Banking",
      descripcion: "Revisa los datos y confirma para continuar.",
      mostrarEncabezado: false,
      mostrarPie: false,
      mostrarAcciones: false
    });
    this.layout.establecerAcciones(null);
  }

  ngOnDestroy(): void {
    this.layout.reiniciar();
  }

  async pagar(): Promise<void> {
    if (!this.idTransaccion || this.procesando) {
      return;
    }
    this.procesando = true;
    await this.router.navigate(["/retorno-pago", this.idTransaccion]);
  }
}
