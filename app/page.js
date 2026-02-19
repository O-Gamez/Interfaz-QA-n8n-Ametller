'use client';

import { useState, useEffect, useRef } from 'react';
// IMPORTACIONES PARA GRÁFICOS
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// COMPONENTS
import LoginScreen from '../components/LoginScreen';
import TestSelector from '../components/TestSelector';
import TestCaseDetails from '../components/TestCaseDetails';
import ReportForm from '../components/ReportForm';
import StatsModal from '../components/StatsModal';
import TipSection from '../components/TipSection';

// REGISTRO DE COMPONENTES GRÁFICOS
ChartJS.register(ArcElement, Tooltip, Legend);

// --- CONFIGURACIÓN ---
const URL_INICIAR = process.env.NEXT_PUBLIC_API_URL_INICIAR || "/api/iniciar";
const URL_LISTA = process.env.NEXT_PUBLIC_API_URL_LISTA || "/api/lista";
const URL_STATS = process.env.NEXT_PUBLIC_API_URL_STATS || "/api/stats";
const URL_POST = process.env.NEXT_PUBLIC_API_URL_POST || "/api/resultado";
const URL_UPLOAD = process.env.NEXT_PUBLIC_API_URL_UPLOAD || "/api/upload";

// --- UTILIDADES ---
// Función para verificar si una cadena es una URL válida
const isValidUrl = (string) => {
  if (!string || typeof string !== 'string') return false;
  const trimmed = string.trim();
  if (!trimmed) return false;
  // Patrón simple para detectar URLs (http, https, ftp, drive.google.com, etc.)
  const urlPattern = /^(https?:\/\/|ftp:\/\/|www\.)|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/|$)/i;
  return urlPattern.test(trimmed);
};

export default function Home() {

  // --- ESTADOS AUTH ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- ESTADOS APP ---
  const [tester, setTester] = useState('');
  const [caso, setCaso] = useState(null);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('neutral');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // --- ESTADOS SELECTOR, GRAFICO Y FILTROS ---
  const [testList, setTestList] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [statsData, setStatsData] = useState(null);

  // New states for filters
  const [device, setDevice] = useState('desktop'); // desktop | mobile | global

  const [filterArea, setFilterArea] = useState('');
  const [uniqueAreas, setUniqueAreas] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
  const [uniqueEstados, setUniqueEstados] = useState([]);


  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);
  const prevDeviceRef = useRef(device);

  const [formData, setFormData] = useState({
    resultado: '',
    estado: '',
    evidencias: '',
    notas: '',
    comentariosViseo: ''
  });


  // --- PERSISTENCIA ---
  useEffect(() => {
    const sessionAuth = localStorage.getItem("isAuth");
    if (sessionAuth === "true") setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Cargar Tester
    let savedTester = localStorage.getItem("tester");
    if (!savedTester) {
      setTimeout(() => {
        savedTester = prompt("👤 Identifícate (Nombre del Tester):") || "Tester Anónimo";
        localStorage.setItem("tester", savedTester);
        setTester(savedTester);
      }, 100);
    } else {
      setTester(savedTester);
    }

    // Cargar dispositivo guardado
    const savedDevice = localStorage.getItem("device") || 'desktop';
    setDevice(savedDevice);
    prevDeviceRef.current = savedDevice;

    const savedCase = localStorage.getItem("currentCase");
    const savedForm = localStorage.getItem("currentForm");
    const savedPreviews = localStorage.getItem("currentPreviews");

    if (savedCase) {
      const casoData = JSON.parse(savedCase);
      setCaso(casoData);
      if (savedForm) setFormData(JSON.parse(savedForm));

      // Cargar miniaturas existentes del caso si hay evidencias
      let existingPreviews = [];
      let textNotes = '';
      const evidencias = casoData["Evidencias"];
      if (evidencias) {
        let lines = [];
        if (typeof evidencias === 'string') {
          lines = evidencias.split('\n').map(line => line.trim()).filter(line => line);
        } else if (Array.isArray(evidencias)) {
          lines = evidencias.filter(line => line && line.trim());
        }
        
        // Separar URLs de texto
        const urls = [];
        const textLines = [];
        lines.forEach(line => {
          if (isValidUrl(line)) {
            urls.push(line);
          } else {
            textLines.push(line);
          }
        });
        
        // Crear previews solo para URLs
        existingPreviews = urls.map(url => {
          let miniatura = url;
          // Si es un enlace de Google Drive, extraer el ID y usar enlace directo para imagen
          const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (match) {
            const fileId = match[1];
            miniatura = `https://drive.google.com/uc?id=${fileId}`;
          }
          return { original: url, miniatura };
        });
        
        // Guardar líneas de texto para el campo evidencias
        textNotes = textLines.join('\n');
      }


      // Combinar con previews guardados si existen (evitar duplicados)
      if (savedPreviews) {
        const saved = JSON.parse(savedPreviews);
        const uniqueUrls = new Set();
        const combined = [];
        
        // Primero agregar los existentes del caso
        existingPreviews.forEach(img => {
          if (!uniqueUrls.has(img.original)) {
            uniqueUrls.add(img.original);
            combined.push(img);
          }
        });
        
        // Luego agregar los guardados que no existan ya
        saved.forEach(img => {
          if (!uniqueUrls.has(img.original)) {
            uniqueUrls.add(img.original);
            combined.push(img);
          }
        });
        
        existingPreviews = combined;
      }

      setPreviewImages(existingPreviews);
      showStatus("🔄 Sesión restaurada", "neutral");
    }
  }, [isLoggedIn]);

  // Efecto para recargar lista cuando cambia el dispositivo
  useEffect(() => {
    if (isLoggedIn) {
      fetchList();
      // Reset selectors when device changes
      setSelectedTestId('');
      setFilterArea('');
      // Only clear case if device actually changed
      if (prevDeviceRef.current !== device) {
        setCaso(null);
        setPreviewImages([]);
        setFormData({ resultado: '', estado: '', evidencias: '', notas: '' });
        // Clear localStorage for case when device changes
        localStorage.removeItem("currentCase");
        localStorage.removeItem("currentForm");
        localStorage.removeItem("currentPreviews");
      }

      prevDeviceRef.current = device;
    }
  }, [device, isLoggedIn]);

  useEffect(() => {
    if (caso && isLoggedIn) {
      localStorage.setItem("currentForm", JSON.stringify(formData));
      localStorage.setItem("currentPreviews", JSON.stringify(previewImages));
    }
  }, [formData, caso, isLoggedIn, previewImages]);

  // Guardar dispositivo cuando cambia
  useEffect(() => {
    localStorage.setItem("device", device);
  }, [device]);

  // --- FUNCIONES API ---
  const fetchList = async () => {
    showStatus(`📡 Cargando tests (${device})...`, "loading");
    try {
      const res = await fetch(`${URL_LISTA}?device=${device}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setTestList(data);

        // Extract Unique Areas for the filter logic
        const areas = [...new Set(data.map(item => item.Area).filter(Boolean))].sort();
        setUniqueAreas(areas);

        // Extract Unique Estados for the filter logic
        const estados = [...new Set(data.map(item => item.Estado).filter(Boolean))].sort();
        setUniqueEstados(estados);


        showStatus(`✅ Lista actualizada (${data.length} tests)`, "success");
      } else {
        setTestList([]);
        setUniqueAreas([]);
      }
    } catch (e) {
      console.error("Error cargando lista", e);
      showStatus("❌ Error cargando lista", "error");
    }
  };

  const fetchStats = async () => {
    showStatus("📊 Cargando estadísticas...", "loading");
    try {
      const res = await fetch(`${URL_STATS}?device=${device}`);
      const data = await res.json();

      setStatsData({
        labels: ['Ready to test', 'WORKING', 'OK-UAT', 'OK-FINAL', 'KO', 'Bloqueado', 'Pendiente'],
        datasets: [{
          data: [
            data.readyToTest || data['Ready to test'] || 0, 
            data.working || data['WORKING'] || 0,
            data.okUat || data['OK-UAT'] || 0, 
            data.okFinal || data['OK-FINAL'] || 0, 
            data.ko || 0, 
            data.bloqueado || 0,
            data.pendiente || 0
          ],
          backgroundColor: ['#3b82f6', '#f97316', '#10b981', '#059669', '#ef4444', '#f59e0b', '#6b7280'],
          borderColor: '#18181b',
          borderWidth: 2,
        }],
      });



      setShowStats(true);
      showStatus("");
    } catch (e) {
      showStatus("❌ Error cargando estadísticas", "error");
    }
  };

  // --- LOGIN ---
  const handleLoginSuccess = () => {
    localStorage.setItem("isAuth", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    setIsLoggedIn(false);
  };

  const handleChangeTester = () => {
    const newTester = prompt("👤 Introduce el nuevo nombre del Tester:") || "Tester Anónimo";
    localStorage.setItem("tester", newTester);
    setTester(newTester);
    showStatus(`✅ Tester cambiado a: ${newTester}`, "success");
  };


  const showStatus = (msg, type = 'neutral') => {
    setStatus(msg);
    setStatusType(type);
    if (type === 'success' || type === 'error') setTimeout(() => setStatus(''), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- UPLOAD ---
  const uploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image")) {
      showStatus("⚠️ Archivo ignorado: no es una imagen", "error");
      return;
    }
    setUploading(true);
    showStatus(`📤 Subiendo ${file.name}...`, "loading");

  const body = new FormData();
    body.append('file', file);
    body.append('device', device); // Send device info for sheet selection
    body.append('ID', caso?.ID || ''); // Send test ID explicitly for n8n workflow
    const extension = file.name.split('.').pop();
    const nombreArchivo = `${caso?.ID || 'General'}_${Date.now()}.${extension}`;
    body.append('filename', nombreArchivo);

    try {
      const res = await fetch(URL_UPLOAD, { method: 'POST', body: body });
      if (!res.ok) throw new Error("Fallo en la subida");

      const data = await res.json();
      console.log("RESPUESTA N8N:", data);

      const urlParaCaja = data.url || "";
      const urlParaMiniatura = data.miniatura || urlParaCaja;

      setPreviewImages(prev => [
        ...prev,
        { original: urlParaCaja, miniatura: urlParaMiniatura }
      ]);

      showStatus("✅ Imagen adjuntada", "success");
    } catch (err) {
      console.error(err);
      showStatus("❌ Error al subir la imagen", "error");
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setPreviewImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleManualSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => uploadImage(file));
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) files.forEach(file => uploadImage(file));
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        uploadImage(item.getAsFile());
      }
    }
  };

  const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };

  // --- INICIAR WORKFLOW ---
  const iniciarWorkflow = async () => {
    let idToLoad = selectedTestId;

    // Si no hay ID seleccionado manualmente, buscamos el siguiente disponible
    // respetando el filtro de Área actual.
    if (!idToLoad) {
      const pendingTest = testList.find(t => {
        // 1. Aplicar filtro de area si existe
        if (filterArea && t.Area !== filterArea) return false;

        // 1.5. Aplicar filtro de estado si existe
        if (filterEstado && t.Estado !== filterEstado) return false;


        // 2. Buscar uno que no esté completado (OK-UAT, OK-FINAL, BLOQUEADO)
        const estado = (t.Estado || "").toUpperCase().trim();
        return estado !== "OK-UAT" && estado !== "OK-FINAL" && estado !== "BLOQUEADO";

      });

      if (pendingTest) {
        idToLoad = pendingTest.ID;
      } else {
        showStatus("📭 No se encontraron más tests pendientes con el filtro actual", "neutral");
        return;
      }
    }

    const baseParams = `?device=${device}`;
    const idParam = `&id=${idToLoad}`;
    const finalUrl = `${URL_INICIAR}${baseParams}${idParam}`;

    showStatus(`🚀 Cargando caso ${idToLoad}...`, "loading");

    localStorage.removeItem("currentCase");
    localStorage.removeItem("currentForm");
    localStorage.removeItem("currentPreviews");

    try {
      const res = await fetch(finalUrl);
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      const casoData = Array.isArray(data) ? data[0] : data;

      if (!casoData || Object.keys(casoData).length === 0) {
        showStatus("📭 No se recibió información del caso", "neutral");
        return;
      }

      setCaso(casoData);
      localStorage.setItem("currentCase", JSON.stringify(casoData));

      // Mostrar info si el caso ya está completado
      if (casoData.Tester && casoData.Fecha) {
        showStatus(`📋 Caso completado por ${casoData.Tester} el ${casoData.Fecha}`, "success");
      }

      // Procesar evidencias para separar URLs de texto
      let existingPreviews = [];
      let textNotes = '';
      const evidencias = casoData["Evidencias"];
      if (evidencias) {
        let lines = [];
        if (typeof evidencias === 'string') {
          lines = evidencias.split('\n').map(line => line.trim()).filter(line => line);
        } else if (Array.isArray(evidencias)) {
          lines = evidencias.filter(line => line && line.trim());
        }
        
        // Separar URLs de texto
        const urls = [];
        const textLines = [];
        lines.forEach(line => {
          if (isValidUrl(line)) {
            urls.push(line);
          } else {
            textLines.push(line);
          }
        });
        
        // Crear previews solo para URLs
        existingPreviews = urls.map(url => ({ original: url, miniatura: url }));
        
        // Guardar líneas de texto para el campo evidencias
        textNotes = textLines.join('\n');
      }

      setFormData({
        resultado: casoData["Resultado Obtenido"] || '',
        estado: casoData["Estado"] || '',
        evidencias: textNotes,
        notas: casoData["Notas"] || '',
        comentariosViseo: casoData["Comentarios Viseo"] || ''
      });


      setPreviewImages(existingPreviews);

      localStorage.setItem("currentPreviews", JSON.stringify(existingPreviews));


      showStatus("✅ Caso cargado y listo", "success");
    } catch (err) {
      console.error("Error fetch:", err);
      showStatus("❌ Error de conexión con el servidor", "error");
    }
  };

  const enviar = async () => {
    if (!caso) return;
    if (!formData.resultado || !formData.estado) {
      alert("⚠️ Faltan campos obligatorios: Resultado y Estado");
      return;
    }
    showStatus("📡 Enviando reporte...", "loading");

    try {
      const urlsImagenes = previewImages.map(img => img.original).join('\n');
      const evidenciasFinales = (urlsImagenes + '\n\n' + formData.evidencias).trim();

      // Construir historial de fechas - añadir nueva fecha al historial existente (formato DD-MM-YYYY)
      const hoy = new Date();
      const nuevaFecha = `${String(hoy.getDate()).padStart(2, '0')}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${hoy.getFullYear()}`;

      // DEBUG: Ver qué valores tenemos
      console.log('Enviar - caso.Fecha existente:', caso.Fecha);
      console.log('Enviar - nuevaFecha:', nuevaFecha);

      // IMPORTANTE: Siempre añadir el nuevo valor, incluso si parece duplicado
      // para mantener la misma cantidad de entradas que Estado Historial
      const fechaExistente = caso.Fecha || "";
      const fechaHistorial = fechaExistente 
        ? `${fechaExistente} | ${nuevaFecha}`
        : nuevaFecha;

      // Construir historial de testers - SIEMPRE añadir nuevo tester al historial
      const testerExistente = caso.Tester || "";
      const testerHistorial = testerExistente
        ? `${testerExistente} | ${tester}`
        : tester;

      // Construir historial de estados - SIEMPRE añadir al historial existente
      const estadoHistorialExistente = caso["Estado Historial"] || caso.Estado || "";
      const estadoHistorial = estadoHistorialExistente
        ? `${estadoHistorialExistente} | ${formData.estado}`
        : formData.estado;



      console.log('Enviar - fechaHistorial:', fechaHistorial);
      console.log('Enviar - testerHistorial:', testerHistorial);
      console.log('Enviar - estadoHistorial:', estadoHistorial);



      const payload = {
        row_number: caso.row_number,
        ID: caso.ID,
        "Nombre del Caso": caso["Nombre del Caso"],
        Area: caso.Area,
        "Tipo de Pedido": caso["Tipo de Pedido"],
        Precondiciones: caso.Precondiciones,
        Pasos: caso.Pasos,
        "Datos prueba": caso["Datos prueba"] || "",
        "Método de Pago": caso["Método de Pago"],
        "Resultado Esperado": caso["Resultado Esperado"],
        "Consejo para el Test": caso["Consejo para el Test"] || "",
        "Resultado Obtenido": formData.resultado,
        Estado: formData.estado,
        "Estado Historial": estadoHistorial,
        Evidencias: evidenciasFinales,
        Notas: formData.notas,
        "Comentarios Viseo": formData.comentariosViseo,
        Tester: testerHistorial,

        Fecha: fechaHistorial,
        device: device // Also send device so backend knows where to write



      };


      const res = await fetch(URL_POST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Error servidor");
      await res.json();

      showStatus("🎉 Reporte enviado con éxito", "success");

      // Actualizar inmediatamente el estado en la lista local para reflejar el cambio de icono
      if (caso && caso.ID) {
        setTestList(prevList => 
          prevList.map(t => 
            t.ID === caso.ID 
              ? { ...t, Estado: formData.estado }
              : t
          )
        );
      }

      localStorage.removeItem("currentCase");
      localStorage.removeItem("currentForm");
      localStorage.removeItem("currentPreviews");

      setPreviewImages([]);
      setFormData({ resultado: '', estado: '', evidencias: '', notas: '', comentariosViseo: '' });


      // No recargar lista inmediatamente para evitar que n8n sobrescriba el estado local
      // La lista se actualizará cuando se cambie de dispositivo o manualmente
      setTimeout(() => setCaso(null), 1000);





    } catch (err) {
      showStatus("❌ Fallo al enviar el reporte", "error");
    }
  };

  // --- FILTERED LIST COMPUTATION ---
  const filteredTestList = testList.filter(t => {
    // Apply area filter
    if (filterArea && t.Area !== filterArea) return false;
    // Apply estado filter
    if (filterEstado && t.Estado !== filterEstado) return false;
    return true;
  });


  // --- RENDER ---
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="container" onPaste={handlePaste}>

      <TestSelector
        tester={tester}
        handleLogout={handleLogout}
        fetchStats={fetchStats}
        selectedTestId={selectedTestId}
        setSelectedTestId={setSelectedTestId}
        testList={filteredTestList} // Pass filtered list
        iniciarWorkflow={iniciarWorkflow}
        uploading={uploading}
        device={device}
        setDevice={setDevice}
        filterArea={filterArea}
        setFilterArea={setFilterArea}
        uniqueAreas={uniqueAreas}
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        uniqueEstados={uniqueEstados}
        onChangeTester={handleChangeTester}

      />


      <TipSection caso={caso} />

      <div className="grid">
        <TestCaseDetails caso={caso} />

        <ReportForm
          caso={caso}
          formData={formData}
          handleChange={handleChange}
          uploading={uploading}
          fileInputRef={fileInputRef}
          previewImages={previewImages}
          handleManualSelect={handleManualSelect}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          isDragging={isDragging}
          removeImage={removeImage}
          enviar={enviar}
        />
      </div>

      {status && (
        <div className="status-bar" style={{ borderColor: statusType === 'error' ? 'var(--danger)' : statusType === 'success' ? 'var(--success)' : 'var(--primary)' }}>
          <div className="status-indicator" style={{ background: statusType === 'error' ? 'var(--danger)' : statusType === 'success' ? 'var(--success)' : '#fff', animation: statusType === 'loading' ? 'pulse 1.5s infinite' : 'none' }}></div>
          <div className="status-text">{status}</div>
        </div>
      )}

      {showStats && statsData && (
        <StatsModal statsData={statsData} setShowStats={setShowStats} />
      )}

    </div>
  );
}
