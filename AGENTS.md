# Registro de Agente - Frontend Angular

## Decisiones recientes
- El frontend reintenta inicializar Keycloak sin `silent-check-sso` cuando falla el iframe de cookies de terceros para evitar la pantalla en blanco; sólo se registra un warning.

## Integración con el backend de comprobantes (nov 2025)
- `ComprobantePagoService` ahora consume los endpoints `/api/ui/v1/comprobantes` vía `HttpClient`, elimina el PDF local y se apoya en el mock que arma el backend.
- Al seleccionar banco (paso 4) se invoca `ComprobantePagoService.iniciarTransaccion()` para obtener el `idTransaccion` que se envía al home banking antes de finalizar el pago.
- El paso de facturas consume `/api/ui/v1/facturas/buscar` con `Pageable` (`page`,`size`,`sort`) y muestra cada página server-side, manteniendo en memoria sólo la selección local para enviarla al siguiente paso.
- El paso de facturas consume `/api/ui/v1/facturas/buscar` con parámetros de página/orden; la tabla se actualiza server-side y sólo envía las facturas seleccionadas al continuar.
- Si la suma seleccionada es 0, `PagosComponent` inicia la transacción y redirige directo a `urlRealizarPago` con el `idTransaccion`; cuando el total es mayor a 0 continúa hacia el paso de bancos/home banking.

## Ejecución local
- Levantá la aplicación con `ng serve`; dejala corriendo en un proceso aparte y asegurate de que el backend con perfil `quanam-desa` ya esté disponible.
- El dev-server usa el puerto 4200: si el comando avisa `Port 4200 is already in use`, finalizá el `node.exe` anterior o elegí otro puerto explícitamente.
- Validá que `http://localhost:4200` responda 200 en no más de 30 segundos y revisá `frontend-run.log`/`frontend-server.err.log` ante cualquier error de arranque.

## Estado actual (nov 2025)
- `npm test -- --watch=false --browsers=ChromeHeadless` queda en verde gracias al mock de `KeycloakService` agregado en `app.component.spec.ts`; si modificás la autenticación asegurate de mantener/actualizar ese stub para no romper Karma.
