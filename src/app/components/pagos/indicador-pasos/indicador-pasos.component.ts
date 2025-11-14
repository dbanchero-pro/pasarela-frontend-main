import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-indicador-pasos",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./indicador-pasos.component.html",
  styleUrl: "./indicador-pasos.component.scss"
})
export class IndicadorPasosComponent {
  @Input({ required: true }) pasoActual!: number;

  readonly pasos = [
    "Autenticación",
    "Sel. de concepto pago",
    "Facturas a pagar",
    "Seleccionar banco/red",
    "Comprobante de pago"
  ];
}
