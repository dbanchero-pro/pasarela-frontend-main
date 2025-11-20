import { ConceptoPago } from "../models/concepto-pago.model";
import { Factura } from "../models/factura.model";
import { Banco } from "../models/banco.model";

export const conceptosPagoMock: ConceptoPago[] = [
  {
    id: "contribucion-inmobiliaria",
    nombre: "Contribución inmobiliaria (urbana, suburbana y rural)",
    campos: [
      { id: "codigoMunicipal", nombre: "Código Municipal", tipo: "texto", requerido: true },
      { id: "padron", nombre: "Padrón", tipo: "texto", requerido: true }
    ]
  },
  {
    id: "convenios",
    nombre: "Convenios",
    campos: [{ id: "codigoMunicipal", nombre: "Código Municipal", tipo: "texto", requerido: true }]
  },
  {
    id: "semovientes",
    nombre: "Semovientes",
    campos: [{ id: "codigoMunicipal", nombre: "Código Municipal", tipo: "texto", requerido: true }]
  },
  {
    id: "impuesto-venta-carne",
    nombre: "Impuesto a la Venta de Carne",
    campos: [{ id: "codigoMunicipal", nombre: "Código Municipal", tipo: "texto", requerido: true }]
  },
  {
    id: "necropolis",
    nombre: "Necrópolis",
    campos: [{ id: "codigoMunicipal", nombre: "Código Municipal", tipo: "texto", requerido: true }]
  },
  {
    id: "ferias",
    nombre: "Ferias",
    campos: [{ id: "codigoMunicipal", nombre: "Código Municipal", tipo: "texto", requerido: true }]
  },
  {
    id: "facturador",
    nombre: "Facturador",
    campos: [{ id: "codigoMunicipal", nombre: "Código Municipal", tipo: "texto", requerido: true }]
  },
  {
    id: "extraccion-materiales",
    nombre: "Extracción de Materiales",
    campos: [{ id: "codigoMunicipal", nombre: "Código Municipal", tipo: "texto", requerido: true }]
  },
  {
    id: "tramites",
    nombre: "Trámites (tributos varios)",
    campos: [{ id: "numeroTramite", nombre: "Nro. de Trámite", tipo: "texto", requerido: true }]
  }
];

const facturasBase: Factura[] = [
  {
    numero: "342408080001",
    padron: "PAD:43 Der: Bis:\nCant. solares: 18",
    anio: 2024,
    auxiliar: "69759268",
    emision: "08/08/2024",
    vencimiento: "08/09/2024",
    importeTotal: 812.5,
    seleccionada: false,
    lineas: [
      {
        id: "0001-4",
        codigo: "0001-4",
        descripcion: "SERVICIO URBANA (4/6)",
        importe: 629.32,
        seleccionada: false
      },
      {
        id: "0004-1004",
        codigo: "0004-1004",
        descripcion: "SERVICIO URBANA AJUSTE IPC (4/6)",
        importe: 19.78,
        seleccionada: false
      },
      {
        id: "0005-10",
        codigo: "0005-10",
        descripcion: "RECARGO POR MORA CIU",
        importe: 83,
        seleccionada: false
      },
      {
        id: "0006-10",
        codigo: "0006-10",
        descripcion: "MULTA POR MORA CIU",
        importe: 81.98,
        seleccionada: false
      }
    ]
  },
  {
    numero: "342408080007",
    padron: "PAD:43 Der: Bis:\nLoc:CANELONES",
    anio: 2024,
    auxiliar: "69759268",
    emision: "08/08/2024",
    vencimiento: "08/09/2024",
    importeTotal: 2054.63,
    seleccionada: false,
    lineas: [
      {
        id: "0001-5",
        codigo: "0001-5",
        descripcion: "SERVICIO URBANA (5/6)",
        importe: 1854.32,
        seleccionada: false
      },
      {
        id: "0002-5",
        codigo: "0002-5",
        descripcion: "RECARGO POR MORA CIU",
        importe: 200.31,
        seleccionada: false
      }
    ]
  },
  {
    numero: "342408080008",
    padron: "PAD:43 Der: Bis:\nLoc:CANELONES",
    anio: 2024,
    auxiliar: "69759268",
    emision: "08/08/2024",
    vencimiento: "08/10/2024",
    importeTotal: 0,
    seleccionada: false,
    lineas: [
      {
        id: "0001-6",
        codigo: "0001-6",
        descripcion: "SIN DEUDA",
        importe: 0,
        seleccionada: false
      }
    ]
  }
];

const clonarFactura = (factura: Factura): Factura => ({
  ...factura,
  seleccionada: false,
  lineas: factura.lineas.map((linea) => ({ ...linea, seleccionada: false }))
});

export const facturasPorConceptoMock: Record<string, Factura[]> = conceptosPagoMock.reduce(
  (acumulado, concepto) => {
    acumulado[concepto.id] = facturasBase.map((factura) => clonarFactura(factura));
    return acumulado;
  },
  {} as Record<string, Factura[]>
);

export const bancosMock: Banco[] = [
  { id: "ebrou", nombre: "eBROU", logo: "assets/logos/bancos/ebrou.svg" },
  {
    id: "banque-heritage",
    nombre: "BANQUE HERITAGE",
    logo: "assets/logos/bancos/banque-heritage.svg"
  },
  { id: "hsbc", nombre: "HSBC", logo: "assets/logos/bancos/hsbc.svg" },
  { id: "scotiabank", nombre: "Scotiabank", logo: "assets/logos/bancos/scotiabank.svg" },
  { id: "bbva", nombre: "BBVA", logo: "assets/logos/bancos/bbva.svg" }
];
