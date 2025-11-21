export interface ComprobantePago {
  numeroComprobante: string;
  fechaEmision: string;
  hora: string;
  contribuyente: string;
  codigoMunicipal?: string;
  padron?: string;
  numeroTramite?: string;
  localidad: string;
  tributo: string;
  periodo: string;
  montoPagado: number;
  formaPago: string;
  autorizacion: string;
  estado: 'Pagado' | 'Pendiente' | 'Rechazado';
  fechaVencimiento: string;
  codigoVerificacion: string;
  nombreArchivo: string;
  tipoArchivo: string;
}
