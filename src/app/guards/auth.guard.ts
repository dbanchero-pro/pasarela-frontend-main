import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthGuard extends KeycloakAuthGuard {
  constructor(private readonly keycloakService: KeycloakService, router: Router) {
    super(router, keycloakService);
  }

  async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const loggedIn = await this.keycloakService.isLoggedIn();

    if (!loggedIn) {
      await this.keycloakService.login({ redirectUri: window.location.origin + state.url });
      return false;
    }

    return true;
  }
}
