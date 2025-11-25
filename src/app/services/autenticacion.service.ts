import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular'; //NOSONAR


@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  constructor(private readonly keycloak: KeycloakService) {} //NOSONAR


  async estaAutenticado(): Promise<boolean> {
    return this.keycloak.isLoggedIn();
  }

  async iniciarSesion(redirectUri?: string): Promise<void> {
    await this.keycloak.login({ redirectUri: redirectUri ?? globalThis.location.href });
  }

  async cerrarSesion(redirectUri?: string): Promise<void> {
    await this.keycloak.logout(redirectUri);
  }
}
