import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 🔴 Asegúrate de que esta es la URL de tu Webhook "Iniciar" de n8n
const N8N_WEBHOOK_URL = "https://phonogramic-supersafe-alfonzo.ngrok-free.dev/webhook/iniciar";

export async function GET(request) {
  try {
    // 1. Capturamos el parámetro ID que viene del Frontend
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const device = searchParams.get('device') || 'desktop';

    // 2. Construimos la URL final para llamar a n8n
    // Si hay ID, se lo pegamos a la URL de n8n (?id=CP001&device=mobile)
    const params = new URLSearchParams();
    if (id) params.append('id', id);
    params.append('device', device);

    const urlConParametros = `${N8N_WEBHOOK_URL}?${params.toString()}`;

    console.log("📡 Llamando a n8n:", urlConParametros); // Para depurar en consola del servidor

    // 3. Llamamos a n8n
    const res = await fetch(urlConParametros, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Error n8n: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("❌ Error en API Iniciar:", error);
    return NextResponse.json({ error: "Fallo al conectar con n8n" }, { status: 500 });
  }
}