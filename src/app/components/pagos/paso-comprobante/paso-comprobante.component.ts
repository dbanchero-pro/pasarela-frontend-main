import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { ComprobantePago } from "../../../models/comprobante-pago.model";
import { EnvioCorreoService } from "../../../services/envio-correo.service";

@Component({
  selector: "app-paso-comprobante",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./paso-comprobante.component.html",
  styleUrl: "./paso-comprobante.component.scss"
})
export class PasoComprobanteComponent {
  @Input({ required: true }) comprobante!: ComprobantePago;
  @Output() nuevoPago = new EventEmitter<void>();

  estadoCorreo: "idle" | "enviando" | "enviado" | "error" = "idle";
  mensajeCorreo = "";

  constructor(private readonly envioCorreo: EnvioCorreoService) {}

  async enviarComprobantePorEmail(): Promise<void> {
    if (this.estadoCorreo === "enviando" || this.estadoCorreo === "enviado") {
      return;
    }

    this.estadoCorreo = "enviando";
    this.mensajeCorreo = "Enviando comprobante...";

    try {
      await firstValueFrom(this.envioCorreo.enviarCorreoComprobante(this.comprobante));
      this.estadoCorreo = "enviado";
      this.mensajeCorreo = "Comprobante enviado con éxito.";
    } catch {
      this.estadoCorreo = "error";
      this.mensajeCorreo = "No pudimos enviar el correo. Intenta nuevamente.";
    }
  }
}
