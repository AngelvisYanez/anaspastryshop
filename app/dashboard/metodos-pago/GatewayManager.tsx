"use client";

import { DataView } from "../data-view/DataView";
import { GATEWAYS, type GatewayConfig } from "./gatewayShared";
import { GatewayCard } from "./GatewayCard";

export default function GatewayManager({ configs }: { configs: GatewayConfig[] }) {
  const configMap = Object.fromEntries(configs.map((c) => [c.provider, c]));

  const methods = [...GATEWAYS].sort((a, b) => Number(a.type === "automatic") - Number(b.type === "automatic"));

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h2 className="text-xl font-black text-foreground">Métodos de Pago</h2>
        <p className="text-muted text-sm font-medium mt-1">
          Configura tus cuentas para pagos manuales por verificación de comprobante y pasarelas automáticas. Pago Móvil usa la tasa BCV del euro.
        </p>
      </div>

      <DataView title="Métodos de pago" dateLabel="Fecha de última modificación" items={methods}
        row={(def) => {
          const saved = configMap[def.provider];
          return {
            date: saved?.updatedAt,
            values: [def.label, def.type === "automatic" ? "Automático" : "Manual",
              saved ? (saved.isEnabled ? "Activo" : "Inactivo") : "Sin configurar"],
          };
        }}>
        {(visible) => <div className="dashboard-data-cards">
          {visible.map((def) => <GatewayCard key={def.provider} def={def} initialConfig={configMap[def.provider]} />)}
        </div>}
      </DataView>
    </div>
  );
}
