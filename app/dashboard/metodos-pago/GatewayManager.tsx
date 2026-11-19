"use client";

import { DataView } from "../data-view/DataView";
import SectionTabs from "../SectionTabs";
import { GATEWAYS, type GatewayConfig } from "./gatewayShared";
import { GatewayCard } from "./GatewayCard";

export default function GatewayManager({ configs }: { configs: GatewayConfig[] }) {
  const configMap = Object.fromEntries(configs.map((c) => [c.provider, c]));

  const groups = [
    { type: "manual", label: "Métodos manuales" },
    { type: "automatic", label: "Pasarelas automáticas" },
  ] as const;

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h2 className="text-xl font-black text-foreground">Métodos de Pago</h2>
        <p className="text-muted text-sm font-medium mt-1">
          Configura tus cuentas para pagos manuales por verificación de comprobante y pasarelas automáticas. Pago Móvil usa la tasa BCV del euro.
        </p>
      </div>

      <SectionTabs label="Tipos de método de pago" tabs={groups.map(({ type, label }) => ({
        label,
        content: <DataView title={label} dateLabel="Fecha de última modificación" items={GATEWAYS.filter((def) => def.type === type)}
          row={(def) => {
            const saved = configMap[def.provider];
            return {
              date: saved?.updatedAt,
              values: [def.label, saved ? (saved.isEnabled ? "Activo" : "Inactivo") : "Sin configurar"],
            };
          }}>
          {(visible) => <div className="dashboard-data-cards">
            {visible.map((def) => <GatewayCard key={def.provider} def={def} initialConfig={configMap[def.provider]} />)}
          </div>}
        </DataView>,
      }))} />
    </div>
  );
}
