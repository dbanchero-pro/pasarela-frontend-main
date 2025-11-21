# Registro de Agente - Frontend Angular

## Decisiones recientes
- El frontend reintenta inicializar Keycloak sin `silent-check-sso` cuando falla el iframe de cookies de terceros para evitar la pantalla en blanco; sólo se registra un warning.

## Integración con el backend de comprobantes (nov 2025)
- `ComprobantePagoService` ahora consume los endpoints `/api/ui/v1/comprobantes` vía `HttpClient`, elimina el PDF local y se apoya en el mock que arma el backend.
- Al seleccionar banco (paso 4) se invoca `ComprobantePagoService.iniciarTransaccion()` para obtener el `idTransaccion` que se envía al home banking antes de finalizar el pago.

## Ejecución local
- Levantá la aplicación con `ng serve` (en paralelo al backend corriendo con el perfil `quanam-desa`).
