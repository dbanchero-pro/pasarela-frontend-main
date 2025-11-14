import { AsyncPipe, NgIf, NgTemplateOutlet } from "@angular/common";
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { PaginaLayoutService } from "./services/pagina-layout.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NgIf, AsyncPipe, NgTemplateOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss"
})
export class AppComponent {
  readonly configuracion$;

  constructor(private readonly layout: PaginaLayoutService) {
    this.configuracion$ = this.layout.configuracion$;
  }
}
