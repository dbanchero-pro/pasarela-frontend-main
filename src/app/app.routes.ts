import { Routes } from "@angular/router";

import { PagosComponent } from "./components/pagos/pagos/pagos.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { RealizarPagoComponent } from "./components/pagos/realizar-pago/realizar-pago.component";
import { RetornoPagoComponent } from "./components/pagos/retorno-pago/retorno-pago.component";

export const routes: Routes = [
  { path: "", component: PagosComponent, pathMatch: "full" },
  { path: "realizar-pago/:idTransaccion", component: RealizarPagoComponent },
  { path: "retorno-pago/:idTransaccion", component: RetornoPagoComponent },
  { path: "**", component: NotFoundComponent }
];