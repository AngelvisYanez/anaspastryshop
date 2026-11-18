import { auth } from '@/lib/auth';

async function proxy(method: 'GET' | 'POST' | 'DELETE', path: string, body?: { phone: string }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return Response.json({ error: 'No autorizado' }, { status: 403 });
  const base = process.env.WA_BRIDGE_URL;
  const key = process.env.WA_BRIDGE_API_KEY;
  if (!base || !key) return Response.json({ error: 'Configura WA_BRIDGE_URL y WA_BRIDGE_API_KEY en Vercel.' }, { status: 503 });
  try {
    const response = await fetch(`${base.replace(/\/+$/, '')}${path}`, {
      method, headers: { apikey: key, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(25000), cache: 'no-store',
    });
    const data = await response.json();
    return Response.json(data, { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'No se pudo conectar con el servicio de WhatsApp.' }, { status: 503 });
  }
}

export async function GET(request: Request) {
  const connect = new URL(request.url).searchParams.get('connect') === '1';
  return proxy('GET', connect ? '/instance/connect/default' : '/instance/connectionState/default');
}

export async function DELETE() { return proxy('DELETE', '/instance/logout/default'); }

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return Response.json({ error: 'No autorizado' }, { status: 403 });
  let phone: unknown;
  try { ({ phone } = await request.json()); }
  catch { return Response.json({ error: 'Número de teléfono inválido.' }, { status: 400 }); }
  if (typeof phone !== 'string' || !/^\+?[1-9]\d{7,14}$/.test(phone.replace(/[\s()-]/g, ''))) {
    return Response.json({ error: 'Escribe el número con código de país.' }, { status: 400 });
  }
  return proxy('POST', '/instance/pairing-code/default', { phone });
}
