import { AsyncPipe, NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter } from "rxjs/operators";

import { PaginaLayoutService } from "./services/pagina-layout.service";
import { AutenticacionService } from "./services/autenticacion.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NgIf, AsyncPipe],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss"
})
export class AppComponent implements OnInit {
  readonly configuracion$;
  sesionActiva = false;
  cargandoSesion = true;
  ocultarLayout = false;

  constructor(
    private readonly layout: PaginaLayoutService,
    private readonly autenticacionServicio: AutenticacionService,
    private readonly router: Router
  ) {
    this.configuracion$ = this.layout.configuracion$;
  }

  async ngOnInit(): Promise<void> {
    await this.verificarSesion();
    this.actualizarOcultarLayout(this.router.url);
    this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe((evento) => this.actualizarOcultarLayout(evento.urlAfterRedirects));
  }

  async cerrarSesion(): Promise<void> {
    await this.autenticacionServicio.cerrarSesion(window.location.origin);
    await this.verificarSesion();
  }

  private async verificarSesion(): Promise<void> {
    this.cargandoSesion = true;
    this.sesionActiva = await this.autenticacionServicio.estaAutenticado();
    this.cargandoSesion = false;
  }

  private actualizarOcultarLayout(url: string): void {
    this.ocultarLayout = /\/realizar-pago\//.test(url);
  }
}
