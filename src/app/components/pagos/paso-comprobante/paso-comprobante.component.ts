import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { ArchivoComprobante } from "../../../models/archivo-comprobante.model";
import { ComprobantePago } from "../../../models/comprobante-pago.model";
import { ComprobantePagoService } from "../../../services/comprobante-pago.service";

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

  descargandoArchivo = false;
  errorDescarga = false;

  constructor(private readonly comprobanteServicio: ComprobantePagoService) {}

  async descargarComprobante(): Promise<void> {
    if (!this.comprobante) {
      return;
    }
    this.errorDescarga = false;
    this.descargandoArchivo = true;
    try {
      const archivo = await firstValueFrom(
        this.comprobanteServicio.descargarArchivoComprobante(this.comprobante.numeroComprobante)
      );
      this.descargarDesdeBase64(archivo);
    } catch (error) {
      console.error("Error al descargar comprobante", error);
      this.errorDescarga = true;
    } finally {
      this.descargandoArchivo = false;
    }
  }

  private descargarDesdeBase64(archivo: ArchivoComprobante): void {
    if (!archivo?.archivoBase64) {
      throw new Error("Archivo de comprobante vacío");
    }
    const tipo = archivo.tipoArchivo || "application/octet-stream";
    const nombre = archivo.nombreArchivo || `${archivo.numeroComprobante}.pdf`;
    const enlace = document.createElement("a");
    enlace.href = `data:${tipo};base64,${archivo.archivoBase64}`;
    enlace.download = nombre;
    enlace.click();
  }
}
