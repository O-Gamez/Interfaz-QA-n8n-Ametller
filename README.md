Documentación Técnica: QA Case Reviewer & AI AssistantVersión: 2.2Fecha: 12/01/2026Tecnologías: Next.js (React), n8n, Google Gemini AI, Google Workspace.1. Resumen EjecutivoEl QA Case Reviewer es una aplicación web progresiva diseñada para optimizar el proceso de Pruebas de Aceptación de Usuario (UAT). El sistema orquesta la asignación de casos de prueba desde una hoja de cálculo, enriquece la información con consejos generados por Inteligencia Artificial (Google Gemini) y gestiona la subida de evidencias (imágenes) a Google Drive de forma automatizada, devolviendo enlaces públicos para el reporte final.2. Arquitectura del SistemaEl sistema sigue una arquitectura Serverless / Low-Code híbrida:Frontend: Next.js (App Router) alojado en Netlify. Actúa como interfaz de usuario y Proxy API para evitar problemas de CORS.Backend / Orquestador: n8n (Self-hosted/Cloud) expuesto vía Ngrok. Gestiona la lógica de negocio.Base de Datos: Google Sheets (Lectura y Escritura de casos).Almacenamiento: Google Drive (Evidencias multimedia).Inteligencia: Google Gemini (PaLM/Gemini Pro) para análisis de casos y generación de consejos.Diagrama de Flujo de DatosFragmento de códigograph TD

    User[Tester QA] -->|Frontend| NextJS[Next.js App]
    NextJS -->|Proxy API| Ngrok
    Ngrok -->|Webhooks| N8N[n8n Workflow]
    
    subgraph "N8N Logic"
        N8N -->|Lee/Escribe| GSheets[Google Sheets]
        N8N -->|Sube Imágenes| GDrive[Google Drive]
        N8N -->|Consulta| AI[Google Gemini AI]
    end
    
    AI -->|Consejo| N8N
    GDrive -->|URL Pública| N8N
    N8N -->|JSON Response| NextJS

3. Especificaciones del Frontend (Next.js)3.1. Diseño e InterfazEstilo: Glassmorphism con paleta Cyberpunk (Dark Mode).UX: * Carga asíncrona de casos.Drag & Drop para subida múltiple de imágenes.Feedback visual mediante notificaciones "Toast" y spinners de carga.Persistencia de sesión local (localStorage) para evitar pérdida de datos al recargar.3.2. Estructura de Rutas API (Proxy)El frontend incluye rutas API intermedias para enmascarar la URL de n8n/Ngrok y gestionar cabeceras CORS.Ruta Next.jsMétodoDestino (n8n Webhook)Función/api/iniciarGET.../webhook-test/iniciarObtiene el siguiente caso pendiente + Consejo IA./api/resultadoPOST.../webhook-test/caso-prueba/resultadoEnvía el reporte final del tester./api/uploadPOST.../webhook-test/upload-imagenSube binarios a Drive y retorna URL.4. Orquestación de Flujos (n8n)Basado en el archivo JSON del proyecto, el workflow de n8n se divide en 3 ramas principales que operan en paralelo mediante Webhooks.Flujo 1: Obtención de Caso + IA (GET)Webhook Trigger: Mandar caso de pruebaGet rows in sheet: Lee la hoja de cálculo "Pruebas E2E".Filter (If1): Filtra los casos donde el Estado NO contiene "OK" (busca pendientes o fallidos).Limit: Selecciona solo el primer caso disponible (1).AI Agent (LangChain + Gemini):Input: Datos del caso (Pasos, Precondiciones, Resultado Esperado).Prompt: Rol de experto QA para generar 3 consejos tácticos en formato lista Markdown.Code (JS): Fusiona el objeto JSON original del Google Sheet con el texto generado por la IA en el campo "Consejo para el Test".Respond to Webhook: Devuelve el JSON unificado al frontend.Flujo 2: Recepción de Resultados (POST)Webhook Trigger: Recibir datosAppend or update row:Busca la fila en Google Sheets coincidiendo por la columna ID.Actualiza los campos: Resultado Obtenido, Estado, Evidencias, Notas, Fecha, Tester.Flujo 3: Subida de Imágenes (POST Multipart)Webhook Trigger: Recibir imagenesUpload File (Google Drive):Recibe el binario (data0).Sube el archivo a la carpeta designada ("Evidencias UAT").Get row(s) in sheet1 & If / Limit: (Lógica auxiliar detectada en el flujo para validación o renombrado basado en estado del caso actual, aunque opcional si se envía nombre desde front).Update File:Renombra el archivo en Drive usando la lógica dinámica: Test_{{ID}}_{{Fecha}}.Respond to Webhook:Devuelve un JSON con la propiedad url mapeada a webContentLink de Drive.5. Configuración de Servicios ExternosGoogle SheetsColumnas requeridas: ID, Nombre del Caso, Area, Tipo de Pedido, Precondiciones, Pasos, Datos prueba, Método de Pago, Resultado Esperado, Resultado Obtenido, Estado, Evidencias, Notas, Fecha, Tester.Google DrivePermisos: La carpeta destino debe tener configuración de compartir: "Cualquier usuario con el enlace puede ver" para que las miniaturas sean visibles en el reporte final.Google Gemini APISe requiere una credencial válida de Google PaLM/Gemini configurada en n8n.6. Guía de Desplieguen8n:Importar el JSON del flujo.Configurar credenciales de Google (Drive, Sheets, Gemini).Activar el workflow.Copiar las URLs de producción de los 3 webhooks.Next.js:Actualizar las variables TARGET_URL en las carpetas app/api/... con las URLs de n8n.Ejecutar npm run build.Desplegar la carpeta out o el proyecto en Vercel/Netlify.Anexo: Estructura JSON del Payload (Ejemplo)Envío desde Frontend (Resultado:JSON

{
  "row_number": 2,
  "ID": "TD01",
  "Resultado Obtenido": "El usuario no pudo loguearse...",
  "Estado": "KO",
  "Evidencias": "https://drive.google.com/...",
  "Tester": "Juan Perez",
  "Fecha": "2026-01-12"
}

Respuesta desde n8n (Iniciar):JSON{
  "ID": "TD05",
  "Nombre del Caso": "Checkout Guest",
  "Pasos": "1. Añadir al carrito...",
  "Consejo para el Test": "- **Cookies:** Limpia caché antes de empezar.\n- **Pasarela:** Usa la tarjeta de test terminada en 4242."
}