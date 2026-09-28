"use client";

import { GATEWAYS, type GatewayConfig } from "./gatewayShared";
import { GatewayCard } from "./GatewayCard";

export default function GatewayManager({ configs }: { configs: GatewayConfig[] }) {
  const configMap = Object.fromEntries(configs.map((c) => [c.provider, c]));

  const automatic = GATEWAYS.filter((g) => g.type === "automatic");
  const manual = GATEWAYS.filter((g) => g.type === "manual");

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h2 className="text-xl font-black text-foreground">Métodos de Pago</h2>
        <p className="text-muted text-sm font-medium mt-1">
          Configura tus cuentas para pagos manuales por verificación de comprobante (Pago Móvil con tasa BCV, Zelle con QR, Binance Pay con QR) y pasarelas automáticas.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4 ml-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-xs font-black uppercase tracking-widest text-muted">
              Métodos Manuales con Verificación de Comprobante
            </p>
          </div>
          <div className="space-y-4">
            {manual.map((def) => (
              <GatewayCard key={def.provider} def={def} initialConfig={configMap[def.provider]} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4 ml-1">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <p className="text-xs font-black uppercase tracking-widest text-muted">
              Pasarelas Automáticas
            </p>
          </div>
          <div className="space-y-4">
            {automatic.map((def) => (
              <GatewayCard key={def.provider} def={def} initialConfig={configMap[def.provider]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
