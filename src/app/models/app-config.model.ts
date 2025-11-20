export interface AppConfig {
  apiUrl?: string;
  extensionesPermitidas?: string;
  urlBaseFrontEnd?: string;
  loggingLevel?: string;
  archivosTamanoMaxBytes?: number;
  archivosCantidadMax?: number;
  urlRealizarPago?: string;
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
  };
}