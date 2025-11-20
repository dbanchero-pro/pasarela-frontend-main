import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ComprobantePago } from "../../../models/comprobante-pago.model";

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

  descargarComprobante(): void {
    if (!this.comprobante?.archivoBase64) {
      return;
    }
    const tipo = this.comprobante.tipoArchivo || "application/octet-stream";
    const nombre = this.comprobante.nombreArchivo || "comprobante.txt";
    const enlace = document.createElement("a");
    enlace.href = `data:${tipo};base64,${this.comprobante.archivoBase64}`;
    enlace.download = nombre;
    enlace.click();
  }
}
