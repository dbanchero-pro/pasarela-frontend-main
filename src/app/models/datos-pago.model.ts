import { ConceptoPago } from './concepto-pago.model';
import { Factura } from './factura.model';
import { MedioPago } from './medio-pago.model';

export interface DatosPago {
  conceptoSeleccionado: ConceptoPago | null;
  camposValidadores: Record<string, string>;
  facturasSeleccionadas: Factura[];
  bancoSeleccionado: MedioPago | null;
  enviarComprobantePorEmail: boolean;
}
