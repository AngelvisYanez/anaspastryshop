'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type BridgeResponse = { state?: string; instance?: { state?: string }; qr?: string | null; error?: string };

export default function WhatsAppSettings() {
  const [state, setState] = useState('loading');
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const requestGeneration = useRef(0);
  const switching = useRef(false);

  const refresh = useCallback(async (connect = false) => {
    if (inFlight.current || switching.current) return;
    inFlight.current = true;
    const generation = requestGeneration.current;
    try {
      const response = await fetch(`/api/dashboard/whatsapp${connect ? '?connect=1' : ''}`, { cache: 'no-store' });
      const data: BridgeResponse = await response.json();
      if (generation !== requestGeneration.current) return;
      if (!response.ok) throw new Error(data.error || 'Error de conexión');
      const next = data.instance?.state || data.state || 'close';
      setState(next);
      if (next === 'open') setQr(null);
      else if (data.qr) setQr(data.qr);
      else if (next === 'close' && !connect) setQr(null);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error de conexión');
    } finally { inFlight.current = false; }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => { void refresh(); }, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function disconnect(reconnect = false) {
    requestGeneration.current++;
    inFlight.current = false;
    switching.current = true;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard/whatsapp', { method: 'DELETE' });
      const data: BridgeResponse = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo desvincular');
      setState('close');
      setQr(null);
      switching.current = false;
      if (reconnect) await refresh(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error de conexión');
    } finally { switching.current = false; setBusy(false); }
  }

  const connected = state === 'open';
  const label = connected ? 'Conectado' : state === 'connecting' ? 'Esperando escaneo' : state === 'loading' ? 'Cargando...' : 'Desconectado';

  return <section className="min-w-0 rounded-2xl border border-card-border bg-card p-4 shadow-sm sm:p-6 lg:p-7">
    <h2 className="text-lg font-bold text-foreground sm:text-xl">WhatsApp de notificaciones</h2>
    <p className="mt-2 text-sm text-muted">Vincula el número que enviará los avisos de pagos y las novedades autorizadas.</p>
    <p className="mt-4 text-sm text-foreground" aria-live="polite">Estado: <strong>{label}</strong></p>
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    {qr && !connected && <div className="mt-4 max-w-[280px]">
      <Image src={qr} alt="Código QR para vincular WhatsApp" width={280} height={280} unoptimized className="h-auto w-full rounded-xl bg-white p-2" />
      <p className="mt-2 text-sm text-muted">En WhatsApp: Dispositivos vinculados → Vincular dispositivo.</p>
    </div>}
    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {!connected && <button type="button" disabled={busy} onClick={() => { if (qr) void disconnect(true); else void refresh(true); }} className="min-h-11 rounded-lg bg-accent-solid px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{qr ? 'Generar otro QR' : 'Generar QR'}</button>}
      {connected && <>
        <button type="button" disabled={busy} onClick={() => void disconnect(false)} className="min-h-11 rounded-lg border border-card-border px-4 py-2 text-sm font-bold text-foreground disabled:opacity-50">Desvincular</button>
        <button type="button" disabled={busy} onClick={() => void disconnect(true)} className="min-h-11 rounded-lg bg-accent-solid px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Vincular otro número</button>
      </>}
    </div>
  </section>;
}
