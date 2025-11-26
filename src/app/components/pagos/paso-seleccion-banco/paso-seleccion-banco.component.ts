import { CommonModule } from "@angular/common";
import { Component, DestroyRef, EventEmitter, OnInit, Output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { MedioPago } from "../../../models/medio-pago.model";
import { MedioPagoService } from "../../../services/medio-pago.service";

@Component({
  selector: "app-paso-seleccion-banco",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./paso-seleccion-banco.component.html",
  styleUrl: "./paso-seleccion-banco.component.scss"
})
export class PasoSeleccionBancoComponent implements OnInit {
  @Output() continuar = new EventEmitter<MedioPago>();
  @Output() volver = new EventEmitter<void>();

  bancos: MedioPago[] = [];
  bancoSeleccionado: MedioPago | null = null;
  cargando = false;

  constructor(
    private readonly bancosServicio: MedioPagoService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.cargarBancos();
  }

  seleccionarBanco(banco: MedioPago): void {
    this.bancoSeleccionado = banco;
  }

  continuarPaso(): void {
    if (this.bancoSeleccionado) {
      this.continuar.emit(this.bancoSeleccionado);
    }
  }

  private cargarBancos(): void {
    this.cargando = true;
    this.bancosServicio
      .obtenerMediosPago()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (bancos) => {
          this.bancos = bancos;
        },
        complete: () => {
          this.cargando = false;
        }
      });
  }
}
