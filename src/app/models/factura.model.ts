export interface Factura {
  numero: string;
  padron: string;
  anio: number;
  auxiliar: string;
  emision: string;
  vencimiento: string;
  importeTotal: number;
  lineas: LineaFactura[];
  seleccionada: boolean;
}

export interface LineaFactura {
  id: string;
  codigo: string;
  descripcion: string;
  importe: number;
  seleccionada: boolean;
}

export interface ResumenDeuda {
  conceptos: ConceptoDeuda[];
  total: number;
}

export interface ConceptoDeuda {
  nombre: string;
  importe: number;
}
