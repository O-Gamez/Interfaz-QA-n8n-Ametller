export const dynamic = 'force-dynamic';
// 🔴 CAMBIA ESTO POR TU WEBHOOK DE N8N QUE DEVUELVE LA LISTA DE TESTS
const N8N_LIST_URL = "https://phonogramic-supersafe-alfonzo.ngrok-free.dev/webhook/lista-tests";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const device = searchParams.get('device') || 'desktop';

    // Anexamos el parametro ?device=... al webhook de n8n
    const finalUrl = `${N8N_LIST_URL}?device=${device}`;

    const res = await fetch(finalUrl, { cache: 'no-store' });
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json([]);
  }
}