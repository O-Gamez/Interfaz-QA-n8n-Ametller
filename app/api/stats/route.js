export const dynamic = 'force-dynamic';
// 🔴 CAMBIA ESTO POR TU WEBHOOK DE N8N QUE DEVUELVE LAS ESTADÍSTICAS
const N8N_STATS_URL = "https://phonogramic-supersafe-alfonzo.ngrok-free.dev/webhook/estadisticas";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const device = searchParams.get('device') || 'desktop';

    // Anexamos el parametro ?device=...
    const finalUrl = `${N8N_STATS_URL}?device=${device}`;

    const res = await fetch(finalUrl, { cache: 'no-store' });
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ ok: 0, ko: 0, bloqueado: 0, pendiente: 0 });
  }
}