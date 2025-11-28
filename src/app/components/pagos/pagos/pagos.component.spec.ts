import { PagosComponent } from "./pagos.component";
import { ComprobantePagoService } from "../../../services/comprobante-pago.service";
import { AutenticacionService } from "../../../services/autenticacion.service";
import { Router } from "@angular/router";
import { AppConfigService } from "../../../services/app-config.service";
import { PaginaLayoutService } from "../../../services/pagina-layout.service";
import { Factura } from "../../../models/factura.model";
import { DatosPago } from "../../../models/datos-pago.model";

function crearFactura(importeTotal: number, seleccionada = true): Factura {
  return {
    numero: "F-001",
    padron: "P-001",
    anio: 2025,
    auxiliar: "",
    emision: "2025-01-01",
    vencimiento: "2025-01-15",
    importeTotal,
    seleccionada,
    lineas: []
  };
}

describe("PagosComponent", () => {
  let component: PagosComponent;

  beforeEach(() => {
    const comprobanteServicio = {} as ComprobantePagoService;
    const autenticacionServicio = {} as AutenticacionService;
    const router = {} as Router;
    const configuracionServicio = { config: { urlRealizarPago: "/realizar-pago/:idTransaccion" } } as AppConfigService;
    const layout = { configurar: () => {}, reiniciar: () => {} } as unknown as PaginaLayoutService;

    component = new PagosComponent(
      comprobanteServicio,
      autenticacionServicio,
      router,
      configuracionServicio,
      layout
    );
  });

  it("redirige a la URL de pago cuando el total seleccionado es cero", async () => {
    const iniciarTransaccionSpy = spyOn<any>(component, "iniciarTransaccion").and.returnValue(
      Promise.resolve("TX-123")
    );
    const redirigirSpy = spyOn<any>(component, "redirigirAUrlRealizarPago").and.returnValue(Promise.resolve());

    await component.manejarSeleccionFacturas({
      facturas: [crearFactura(0)],
      enviarComprobante: false
    });

    expect(iniciarTransaccionSpy).toHaveBeenCalledTimes(1);
    const datosInvocados = iniciarTransaccionSpy.calls.mostRecent().args[0] as DatosPago;
    expect(datosInvocados.facturasSeleccionadas.length).toBe(1);
    expect(datosInvocados.bancoSeleccionado).toBeNull();
    expect(datosInvocados.enviarComprobantePorEmail).toBeFalse();
    expect(redirigirSpy).toHaveBeenCalledWith("TX-123");
  });

  it("avanza al paso de bancos cuando existe importe pendiente", async () => {
    const iniciarTransaccionSpy = spyOn<any>(component, "iniciarTransaccion");
    const redirigirPagoCeroSpy = spyOn<any>(component, "redirigirAUrlRealizarPago");
    const homeBankingSpy = spyOn<any>(component, "navegarAHomeBanking");

    await component.manejarSeleccionFacturas({
      facturas: [crearFactura(1500)],
      enviarComprobante: true
    });

    expect(component["pasoActual"]).toBe(4);
    expect(iniciarTransaccionSpy).not.toHaveBeenCalled();
    expect(redirigirPagoCeroSpy).not.toHaveBeenCalled();
    expect(homeBankingSpy).not.toHaveBeenCalled();
  });
});
