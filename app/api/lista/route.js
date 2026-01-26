export const dynamic = 'force-dynamic';
// 🔴 CAMBIA ESTO POR TU WEBHOOK DE N8N QUE DEVUELVE LA LISTA DE TESTS
const N8N_LIST_URL = "https://phonogramic-supersafe-alfonzo.ngrok-free.dev/webhook/lista-tests"; 

export async function GET() {
  try {
    const res = await fetch(N8N_LIST_URL, { cache: 'no-store' });
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json([]);
  }
}