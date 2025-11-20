import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  constructor(private readonly keycloak: KeycloakService) {}

  async estaAutenticado(): Promise<boolean> {
    return await this.keycloak.isLoggedIn();
  }

  async iniciarSesion(redirectUri?: string): Promise<void> {
    await this.keycloak.login({ redirectUri: redirectUri ?? window.location.href });
  }

  async cerrarSesion(redirectUri?: string): Promise<void> {
    await this.keycloak.logout(redirectUri);
  }
}
