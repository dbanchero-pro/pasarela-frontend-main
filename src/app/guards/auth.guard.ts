import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular'; //NOSONAR

@Injectable({ providedIn: 'root' })
export class AuthGuard extends KeycloakAuthGuard { //NOSONAR
  constructor(private readonly keycloakService: KeycloakService,  //NOSONAR
    router: Router) {
    super(router, keycloakService);
  }

  async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const loggedIn = this.keycloakService.isLoggedIn();

    if (!loggedIn) {
      await this.keycloakService.login({ redirectUri: globalThis.location.origin + state.url });
      return false;
    }

    return true;
  }
}
