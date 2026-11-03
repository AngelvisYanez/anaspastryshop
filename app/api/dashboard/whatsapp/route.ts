import { auth } from '@/lib/auth';

async function proxy(method: 'GET' | 'DELETE', path: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return Response.json({ error: 'No autorizado' }, { status: 403 });
  const base = process.env.WA_BRIDGE_URL;
  const key = process.env.WA_BRIDGE_API_KEY;
  if (!base || !key) return Response.json({ error: 'Configura WA_BRIDGE_URL y WA_BRIDGE_API_KEY en Vercel.' }, { status: 503 });
  try {
    const response = await fetch(`${base.replace(/\/+$/, '')}${path}`, {
      method, headers: { apikey: key }, signal: AbortSignal.timeout(25000), cache: 'no-store',
    });
    const data = await response.json();
    return Response.json(data, { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'No se pudo conectar con el servicio QR de Render.' }, { status: 503 });
  }
}

export async function GET(request: Request) {
  const connect = new URL(request.url).searchParams.get('connect') === '1';
  return proxy('GET', connect ? '/instance/connect/default' : '/instance/connectionState/default');
}

export async function DELETE() { return proxy('DELETE', '/instance/logout/default'); }
