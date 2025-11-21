import { TestBed } from "@angular/core/testing";
import { KeycloakService } from "keycloak-angular";

import { AppComponent } from "./app.component";

describe("AppComponent", () => {
  let keycloakServiceMock: Partial<KeycloakService>;

  beforeEach(async () => {
    keycloakServiceMock = {
      isLoggedIn: jasmine.createSpy("isLoggedIn").and.returnValue(Promise.resolve(false)),
      login: jasmine.createSpy("login").and.returnValue(Promise.resolve()),
      logout: jasmine.createSpy("logout").and.returnValue(Promise.resolve())
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: KeycloakService, useValue: keycloakServiceMock }]
    }).compileComponents();
  });

  it("debería crearse", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
