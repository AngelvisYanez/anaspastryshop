'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

type BridgeResponse = { state?: string; instance?: { state?: string }; qr?: string; error?: string };

export default function WhatsAppSettings() {
  const [status, setStatus] = useState('Cargando...');
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async (connect = false) => {
    try {
      const response = await fetch(`/api/dashboard/whatsapp${connect ? '?connect=1' : ''}`, { cache: 'no-store' });
      const data: BridgeResponse = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error de conexión');
      const next = data.instance?.state || data.state || 'close';
      setStatus(next === 'open' ? 'Conectado' : next === 'connecting' ? 'Esperando escaneo' : 'Desconectado');
      setQr(data.qr || null);
      setError(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Error de conexión'); }
  }, []);
  useEffect(() => {
    void refresh();
    const interval = setInterval(() => { void refresh(qr !== null || status === 'Esperando escaneo'); }, 5000);
    return () => clearInterval(interval);
  }, [refresh, qr, status]);
  async function disconnect() {
    setBusy(true);
    try {
      const response = await fetch('/api/dashboard/whatsapp', { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo desconectar');
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Error de conexión'); }
    finally { setBusy(false); }
  }
  return <section className="bg-card border border-card-border rounded-2xl p-5 sm:p-6 lg:p-7 shadow-sm">
    <h2 className="text-xl font-semibold">WhatsApp de notificaciones</h2>
    <p className="mt-2 text-sm opacity-75">Conecta el número de Ana’s Pastry Shop para avisar sobre pagos de workshops y cursos, y enviar novedades a clientes que aceptaron recibirlas.</p>
    <p className="mt-4 text-sm">Estado: <strong>{status}</strong></p>
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    {qr && <div className="mt-4"><Image src={qr} alt="Código QR para vincular WhatsApp" width={280} height={280} unoptimized /><p className="mt-2 text-sm">En WhatsApp: Dispositivos vinculados → Vincular dispositivo.</p></div>}
    <div className="mt-4 flex gap-3">
      {status !== 'Conectado' && <button type="button" disabled={busy} onClick={() => void refresh(true)} className="rounded-lg bg-foreground px-4 py-2 text-background disabled:opacity-50">Generar QR</button>}
      {status === 'Conectado' && <button type="button" disabled={busy} onClick={() => void disconnect()} className="rounded-lg border px-4 py-2 disabled:opacity-50">Desconectar</button>}
    </div>
  </section>;
}
