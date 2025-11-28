import { CommonModule } from "@angular/common";
import { Component, DestroyRef, EventEmitter, OnInit, Output } from "@angular/core";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { finalize } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { ConceptoPago } from "../../../models/concepto-pago.model";
import { ConceptoPagoService } from "../../../services/concepto-pago.service";

interface EventoContinuarConcepto {
  concepto: ConceptoPago;
  campos: Record<string, string>;
}

type FormularioConcepto = FormGroup<{ conceptoId: FormControl<string> }>;

type FormularioCampos = FormGroup<Record<string, FormControl<string>>>;

@Component({
  selector: "app-paso-seleccion-concepto",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./paso-seleccion-concepto.component.html",
  styleUrl: "./paso-seleccion-concepto.component.scss"
})
export class PasoSeleccionConceptoComponent implements OnInit {
  @Output() continuar = new EventEmitter<EventoContinuarConcepto>();

  conceptos: ConceptoPago[] = [];
  conceptoSeleccionado: ConceptoPago | null = null;

  formularioConcepto: FormularioConcepto;
  formularioCampos: FormularioCampos;

  cargandoConceptos = false;

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly conceptosServicio: ConceptoPagoService,
    private readonly destroyRef: DestroyRef
  ) {
    this.formularioConcepto = this.fb.group({
      conceptoId: ["", Validators.required]
    });

    this.formularioCampos = this.fb.group({}) as FormularioCampos;
  }

  ngOnInit(): void {
    this.cargarConceptos();
    this.formularioConcepto.controls.conceptoId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((conceptoId) => {
        const concepto = this.conceptos.find((item) => item.id === conceptoId) ?? null;
        this.conceptoSeleccionado = concepto;
        this.crearFormularioCampos(concepto);
      });
  }

  get puedeContinuar(): boolean {
    return Boolean(this.conceptoSeleccionado) && this.formularioCampos.valid;
  }

  enviar(): void {
    if (!this.conceptoSeleccionado || !this.puedeContinuar) {
      return;
    }

    this.continuar.emit({
      concepto: this.conceptoSeleccionado,
      campos: this.formularioCampos.getRawValue()
    });
  }

  private cargarConceptos(): void {
    this.cargandoConceptos = true;
    this.conceptosServicio
      .obtenerConceptos()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.cargandoConceptos = false))
      )
      .subscribe((conceptos) => {
        this.conceptos = conceptos;
      });
  }

  private crearFormularioCampos(concepto: ConceptoPago | null): void {
    if (!concepto) {
      this.formularioCampos = this.fb.group({}) as FormularioCampos;
      return;
    }

    const grupoControles: Record<string, FormControl<string>> = {};
    concepto.campos.forEach((campo) => {
      grupoControles[campo.id] = this.fb.control("", campo.requerido ? Validators.required : []);
    });

    this.formularioCampos = this.fb.group(grupoControles);
  }
}
