import { ConceptoPago } from './concepto-pago.model';
import { Factura } from './factura.model';
import { Banco } from './banco.model';

export interface DatosPago {
  conceptoSeleccionado: ConceptoPago | null;
  camposValidadores: Record<string, string>;
  facturasSeleccionadas: Factura[];
  bancoSeleccionado: Banco | null;
  enviarComprobantePorEmail: boolean;
}
