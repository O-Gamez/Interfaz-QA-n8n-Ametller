'use server';

export async function verificarPassword(password) {
  const correcta = process.env.ACCESS_PASSWORD;

  // --- DEBUGGING (MIRA TU TERMINAL DE VS CODE AL DARLE A LOGIN) ---
  console.log("-------------------------------------");
  console.log("🔑 Password escrita por ti:", password);
  console.log("🔒 Password leída del .env:", correcta);
  console.log("-------------------------------------");
  // ----------------------------------------------------------------

  // Pequeña pausa de seguridad
  await new Promise(resolve => setTimeout(resolve, 500));

  // Si 'correcta' es undefined, es que no está leyendo el archivo .env
  if (!correcta) {
    console.error("❌ ERROR: La variable ACCESS_PASSWORD no existe o está vacía.");
    return false;
  }

  if (password === correcta) {
    return true;
  }
  return false;
}