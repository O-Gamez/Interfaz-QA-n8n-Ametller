import { NextResponse } from 'next/server';

export async function POST(request) {
  // OJO: Esta URL es la de tu Webhook de subida
  const N8N_UPLOAD_URL = "https://oskitas03.qamezia.com/webhook/upload-imagen"; 

  try {
    const formData = await request.formData();
    // fetch gestiona el boundary del multipart automáticamente
    const res = await fetch(N8N_UPLOAD_URL, {
      method: "POST",
      headers: { "ngrok-skip-browser-warning": "true" },
      body: formData
    });

    if (!res.ok) throw new Error("Error subiendo a n8n");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}