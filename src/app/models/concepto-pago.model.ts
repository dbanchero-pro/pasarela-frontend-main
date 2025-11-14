export interface ConceptoPago {
  id: string;
  nombre: string;
  campos: CampoValidador[];
}

export interface CampoValidador {
  id: string;
  nombre: string;
  tipo: 'texto' | 'numero';
  requerido: boolean;
}
