import { TipoMedioPago } from "../enums/tipo-medio-pago.enum";

export interface MedioPago {
  id: string;
  nombre: string;
  logo?: string;
  tipo: TipoMedioPago;
}