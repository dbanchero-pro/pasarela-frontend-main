import { CommonModule } from "@angular/common";
import { Component, DestroyRef, EventEmitter, OnInit, Output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { Banco } from "../../../models/banco.model";
import { BancosService } from "../../../services/bancos.service";

@Component({
  selector: "app-paso-seleccion-banco",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./paso-seleccion-banco.component.html",
  styleUrl: "./paso-seleccion-banco.component.scss"
})
export class PasoSeleccionBancoComponent implements OnInit {
  @Output() continuar = new EventEmitter<Banco>();
  @Output() volver = new EventEmitter<void>();

  bancos: Banco[] = [];
  bancoSeleccionado: Banco | null = null;
  cargando = false;

  constructor(
    private readonly bancosServicio: BancosService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.cargarBancos();
  }

  seleccionarBanco(banco: Banco): void {
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
      .obtenerBancos()
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
