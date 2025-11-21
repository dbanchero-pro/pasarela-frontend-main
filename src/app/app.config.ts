import { ApplicationConfig, importProvidersFrom, provideAppInitializer, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { routes } from './app.routes';
import { AppConfigService } from './services/app-config.service';
import { AppConfig } from './models/app-config.model';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(KeycloakAngularModule),
    AppConfigService,
    provideAppInitializer(() => {
      const appConfig = inject(AppConfigService);
      const keycloak = inject(KeycloakService);

      return (async () => {
        const config = await appConfig.load();
        await inicializarKeycloak(keycloak, config);
      })();
    }),
  ],
};

async function inicializarKeycloak(keycloak: KeycloakService, config: AppConfig): Promise<void> {
  const keycloakConfig = {
    url: config.keycloak.url,
    realm: config.keycloak.realm,
    clientId: config.keycloak.clientId,
  };

  const initOptions = {
    onLoad: 'check-sso' as const,
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    checkLoginIframe: false,
  };

  try {
    await keycloak.init({
      config: keycloakConfig,
      initOptions,
      enableBearerInterceptor: true,
    });
    return;
  } catch (error) {
    console.warn('Keycloak no pudo inicializarse usando silent-check-sso; se reintentará sin esa verificación.', error);
  }

  const fallbackInitOptions = {
    ...initOptions,
    silentCheckSsoRedirectUri: undefined,
    silentCheckSsoFallback: false,
  };

  await keycloak.init({
    config: keycloakConfig,
    initOptions: fallbackInitOptions,
    enableBearerInterceptor: true,
  });
}

