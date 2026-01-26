import { NextResponse } from 'next/server';

export async function POST(request) {
  const TARGET_URL = "https://phonogramic-supersafe-alfonzo.ngrok-free.dev/webhook/caso-prueba/resultado";
  try {
    let body;
    try { body = await request.json(); } 
    catch (e) { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

    const res = await fetch(TARGET_URL, {
      method: "POST",
      headers: { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const responseText = await res.text();
    if (!res.ok) throw new Error(`Error remoto n8n (${res.status}): ${responseText}`);

    let data;
    try { data = JSON.parse(responseText); } 
    catch (e) { data = { message: "Recibido correctamente", n8n_response: responseText }; }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}