'use client';

import { useState, useEffect, useRef } from 'react';
// IMPORTACIONES PARA GRÁFICOS
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// REGISTRO DE COMPONENTES GRÁFICOS
ChartJS.register(ArcElement, Tooltip, Legend);

// --- CONFIGURACIÓN ---
const ACCESS_PASSWORD = "Viseo2026!"; 
const URL_INICIAR = "/api/iniciar";
const URL_LISTA = "/api/lista";     
const URL_STATS = "/api/stats";     
const URL_POST = "/api/resultado";
const URL_UPLOAD = "/api/upload";

export default function Home() {
  // --- ESTADOS AUTH ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // --- ESTADOS APP ---
  const [tester, setTester] = useState('');
  const [caso, setCaso] = useState(null);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('neutral');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // --- ESTADOS SELECTOR Y GRAFICO ---
  const [testList, setTestList] = useState([]); 
  const [selectedTestId, setSelectedTestId] = useState(''); 
  const [showStats, setShowStats] = useState(false); 
  const [statsData, setStatsData] = useState(null); 

  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    resultado: '',
    estado: '',
    evidencias: '', // Notas manuales
    notas: ''       // Notas internas
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

    // CARGAR LISTA DE TESTS
    fetchList();

    const savedCase = localStorage.getItem("currentCase");
    const savedForm = localStorage.getItem("currentForm");
    const savedPreviews = localStorage.getItem("currentPreviews");
    
    if (savedCase) {
      setCaso(JSON.parse(savedCase));
      if (savedForm) setFormData(JSON.parse(savedForm));
      if (savedPreviews) setPreviewImages(JSON.parse(savedPreviews));
      showStatus("🔄 Sesión restaurada", "neutral");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (caso && isLoggedIn) {
      localStorage.setItem("currentForm", JSON.stringify(formData));
      localStorage.setItem("currentPreviews", JSON.stringify(previewImages));
    }
  }, [formData, caso, isLoggedIn, previewImages]);

  // --- FUNCIONES API ---
  const fetchList = async () => {
    try {
      const res = await fetch(URL_LISTA);
      const data = await res.json();
      if(Array.isArray(data)) setTestList(data);
    } catch (e) { console.error("Error cargando lista", e); }
  };

  const fetchStats = async () => {
    showStatus("📊 Cargando estadísticas...", "loading");
    try {
      const res = await fetch(URL_STATS);
      const data = await res.json();
      
      setStatsData({
        labels: ['OK', 'KO', 'Bloqueado', 'Pendiente'],
        datasets: [{
          data: [data.ok || 0, data.ko || 0, data.bloqueado || 0, data.pendiente || 0],
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#27272a'],
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
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ACCESS_PASSWORD) {
      localStorage.setItem("isAuth", "true");
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError("⛔ Contraseña incorrecta");
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    setIsLoggedIn(false);
    setPasswordInput('');
    setShowPassword(false);
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

  // --- INICIAR WORKFLOW (CORREGIDO PARA CARGAR DATOS EXISTENTES) ---
  const iniciarWorkflow = async () => {
    const finalUrl = selectedTestId ? `${URL_INICIAR}?id=${selectedTestId}` : URL_INICIAR;
    
    showStatus(selectedTestId ? "🔍 Buscando test seleccionado..." : "🚀 Obteniendo siguiente caso...", "loading");
    
    // Limpiamos storage
    localStorage.removeItem("currentCase");
    localStorage.removeItem("currentForm");
    localStorage.removeItem("currentPreviews");

    try {
      const res = await fetch(finalUrl);
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      const casoData = Array.isArray(data) ? data[0] : data;
      
      if (!casoData || Object.keys(casoData).length === 0) {
        showStatus("📭 No se encontró el caso o no hay pendientes", "neutral");
        return;
      }
      
      setCaso(casoData);
      localStorage.setItem("currentCase", JSON.stringify(casoData));
      
      // AQUI ESTA LA MAGIA: Pre-llenamos el formulario con lo que viene del Excel
      setFormData({ 
        resultado: casoData["Resultado Obtenido"] || '', 
        estado: casoData["Estado"] || '', 
        evidencias: '', // Las evidencias nuevas empiezan vacías
        notas: casoData["Notas"] || '' 
      });
      setPreviewImages([]); 
      
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
        Evidencias: evidenciasFinales, 
        Notas: formData.notas,
        Tester: tester,
        Fecha: new Date().toISOString().split("T")[0]
      };

      const res = await fetch(URL_POST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Error servidor");
      await res.json();
      
      showStatus("🎉 Reporte enviado con éxito", "success");
      
      localStorage.removeItem("currentCase");
      localStorage.removeItem("currentForm");
      localStorage.removeItem("currentPreviews");

      // --- LIMPIEZA VISUAL INMEDIATA ---
      setPreviewImages([]); // <--- ¡AQUÍ ESTÁ LA SOLUCIÓN!
      setFormData({ resultado: '', estado: '', evidencias: '', notas: '' }); // Limpia los campos
      
      fetchList(); 
      setTimeout(() => setCaso(null), 1000);
      
    } catch (err) {
      showStatus("❌ Fallo al enviar el reporte", "error");
    }
  };

  // --- RENDER ---
  if (!isLoggedIn) {
    return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-dark)', animation: 'fadeIn 0.5s ease-out'}}>
        <div className="card" style={{width: '350px', textAlign: 'center', padding: '40px 30px'}}>
          <h1 style={{marginBottom: '10px', fontSize: '1.8rem'}}>QA VISEO <span style={{fontSize:'0.4em', color:'#3b82f6'}}>ACCESS</span></h1>
          <p style={{color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem'}}>Panel restringido. Introduce clave.</p>
          <form onSubmit={handleLogin}>
            <div className="input-group" style={{position: 'relative', display: 'flex', alignItems: 'center'}} suppressHydrationWarning={true}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="****" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                style={{textAlign: 'center', fontSize: '1.5rem', letterSpacing: showPassword ? '2px' : '8px', height: '50px', paddingRight: '45px', width: '100%'}} 
                autoFocus 
                suppressHydrationWarning={true}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#a1a1aa', display: 'flex', alignItems: 'center'}}>
                {showPassword ? ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> )}
              </button>
            </div>
            {loginError && <div style={{color: 'var(--danger)', marginBottom: '15px', fontWeight:'bold', fontSize: '0.9rem'}}>{loginError}</div>}
            <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>DESBLOQUEAR 🔓</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" onPaste={handlePaste}>
      
      {/* HEADER */}
      <header className="header" style={{display:'block'}}> 
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <div>
            <h1>**QA VISEO** UAT AMETLLER <span style={{fontSize:'0.4em', color:'#3b82f6'}}>v2.0</span></h1>
            <div className="tester-info">Tester: <span style={{color:'#fff'}}>{tester}</span></div>
          </div>
          <div className="actions" style={{marginTop:0}}>
            <button className="btn-secondary btn-sm" onClick={fetchStats}>📊 Gráfico</button>
            <button className="btn-secondary btn-sm" onClick={handleLogout}>🔒 Salir</button>
          </div>
        </div>

        <div className="toolbar">
          <select 
            className="test-selector"
            value={selectedTestId} 
            onChange={(e) => setSelectedTestId(e.target.value)}
          >
            <option value="">-- Modo Automático (Cargar Siguiente Pendiente) --</option>
            
            {testList.map((t) => {
              // 1. Normalizamos el estado (si viene vacío es "PENDIENTE")
              const estado = t.Estado ? t.Estado.toUpperCase().trim() : "PENDIENTE";
              
              // 2. Elegimos un icono visual
              let icono = "⬜"; // Por defecto (Pendiente)
              if (estado === "OK") icono = "✅";
              if (estado === "KO") icono = "❌";
              if (estado === "BLOQUEADO") icono = "⛔";

              // 3. Pintamos la opción: "✅ ID - Nombre (OK)"
              return (
                <option key={t.ID} value={t.ID}>
                  {icono} {t.ID} - {t["Nombre del Caso"] || t.Nombre} ({estado})
                </option>
              );
            })}
          </select>
          
          <button className="btn-success btn-sm" onClick={iniciarWorkflow} disabled={uploading}>
            {selectedTestId ? "📥 Cargar Seleccionado" : "🚀 Cargar Siguiente"}
          </button>
        </div>
      </header>

      {/* CONSEJO */}
      {caso && caso["Consejo para el Test"] && (
        <div className="tip-box">
          <div className="tip-icon">💡</div>
          <div className="tip-content">
            <div className="tip-title">Consejo para el Test</div>
            <div className="tip-text">
              {caso["Consejo para el Test"].split('\n').map((line, i) => {
                if (!line.trim()) return null;
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <div key={i} style={{ marginBottom: '4px', display: 'flex', alignItems: 'flex-start' }}>
                    {line.trim().startsWith('-') && (<span style={{ marginRight: '8px', color: '#06b6d4' }}>•</span>)}
                    <span>
                      {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} style={{ color: '#67e8f9' }}>{part.slice(2, -2)}</strong>;
                        return part.replace(/^- /, '');
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GRID */}
      <div className="grid">
        <div className="card">
          <h2>📄 Detalles {caso && <span className="badge">ID: {caso.ID}</span>}</h2>
          <div className="data-row"><div className="label">Nombre</div><div className="value">{caso?.["Nombre del Caso"] || "—"}</div></div>
          <div className="data-row"><div className="label">Área / Tipo</div><div className="value">{caso ? `${caso.Area} • ${caso["Tipo de Pedido"]}` : "—"}</div></div>
          <div className="data-row"><div className="label">Precondiciones</div><div className="value">{caso?.Precondiciones || "—"}</div></div>
          <div className="data-row"><div className="label">Pasos</div><div className="value">{caso?.Pasos || "—"}</div></div>
          <hr style={{borderColor:'var(--border)', margin:'20px 0', opacity:0.5}} />
          <div className="data-row"><div className="label">Datos Prueba</div><div className="value mono">{caso?.["Datos prueba"] || "—"}</div></div>
          <div className="data-row"><div className="label">Método Pago</div><div className="value">{caso?.["Método de Pago"] || "—"}</div></div>
          <div className="data-row"><div className="label" style={{color:'var(--primary)'}}>Res. Esperado</div><div className="value">{caso?.["Resultado Esperado"] || "—"}</div></div>
        </div>

        <div className="card" style={{background: 'rgba(24, 24, 27, 0.8)'}}>
          <h2>📝 Reporte de Ejecución</h2>
          <div className="input-group">
            <div className="input-header"><div className="label">Resultado Obtenido *</div></div>
            <textarea name="resultado" value={formData.resultado} onChange={handleChange} disabled={!caso} placeholder="Describe el comportamiento..." />
          </div>

          <div className="input-group">
            <div className="input-header">
              <div className="label">Evidencias</div>
              <button type="button" className="btn-secondary btn-sm" disabled={!caso || uploading} onClick={() => fileInputRef.current.click()}>📂 Adjuntar</button>
            </div>
            
            {/* DROP ZONE */}
            <div 
              className={`drop-zone ${isDragging ? 'dragging' : ''}`} 
              onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={(e) => e.preventDefault()} onDrop={onDrop}
              style={{ justifyContent: previewImages.length === 0 ? 'center' : 'flex-start' }}
            >
              <div className="drop-overlay">SOLTAR IMÁGENES AQUÍ</div>
              
              {/* PLACEHOLDER */}
              {previewImages.length === 0 && (
                 <div className="drop-placeholder">
                    Arrastra, pega o usa el boton para adjuntar imágenes
                 </div>
              )}

              {/* MINIATURAS + TEXTO */}
              {previewImages.length > 0 && (
                <>
                  <div className="thumbs-container">
                    {previewImages.map((imgData, index) => (
                      <div key={index} className="thumb-item">
                        <button 
                          className="btn-remove" 
                          onClick={(e) => { e.stopPropagation(); removeImage(index); }} 
                          title="Borrar"
                        >X</button>
                        <a href={imgData.original} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <img 
                            src={imgData.miniatura} 
                            className="thumb-img" 
                            alt="Evidencia" 
                            referrerPolicy="no-referrer"
                            onError={(e) => { 
                              e.target.style.display='none'; 
                              e.target.parentElement.innerHTML='<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;color:#a1a1aa;font-size:24px;">📄</div>'; 
                            }}
                          />
                        </a>
                      </div>
                    ))}
                  </div>
                  
                  <textarea 
                    name="evidencias"
                    value={formData.evidencias}
                    onChange={handleChange}
                    className="notes-textarea"
                    placeholder="Añadir notas adicionales sobre las evidencias..."
                  />
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*" multiple onChange={handleManualSelect} />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
            <div className="input-group">
              <div className="input-header"><div className="label">Estado *</div></div>
              <select name="estado" value={formData.estado} onChange={handleChange} disabled={!caso} style={{height:'48px'}}>
                <option value="">Seleccionar...</option>
                <option value="OK">✅ OK</option>
                <option value="KO">❌ KO</option>
                <option value="BLOQUEADO">⛔ BLOQUEADO</option>
              </select>
            </div>
            <div className="input-group">
              <div className="input-header"><div className="label">Notas Internas</div></div>
              <textarea name="notas" value={formData.notas} onChange={handleChange} disabled={!caso} style={{minHeight:'48px', height:'48px'}} />
            </div>
          </div>

          <div className="actions" style={{justifyContent:'flex-end'}}>
            <button className="btn-primary" onClick={enviar} disabled={!caso || uploading}>
              {uploading ? "⏳ Procesando..." : "Enviar Resultado ✨"}
            </button>
          </div>
        </div>
      </div>

      {status && (
        <div className="status-bar" style={{borderColor: statusType === 'error' ? 'var(--danger)' : statusType === 'success' ? 'var(--success)' : 'var(--primary)'}}>
          <div className="status-indicator" style={{background: statusType === 'error' ? 'var(--danger)' : statusType === 'success' ? 'var(--success)' : '#fff', animation: statusType === 'loading' ? 'pulse 1.5s infinite' : 'none'}}></div>
          <div className="status-text">{status}</div>
        </div>
      )}

      {/* MODAL DE GRÁFICO */}
      {showStats && statsData && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.85)', zIndex:999, display:'flex', justifyContent:'center', alignItems:'center', animation:'fadeIn 0.3s'}}>
          <div className="card" style={{width:'400px', maxWidth:'90%', position:'relative', padding:'40px 20px', background:'#18181b', border:'1px solid var(--border)'}}>
            <button onClick={() => setShowStats(false)} style={{position:'absolute', top:'10px', right:'10px', background:'transparent', border:'none', fontSize:'1.2rem', color:'#fff', cursor:'pointer'}}>✖</button>
            <h2 style={{textAlign:'center', marginBottom:'20px', color:'#fff'}}>Progreso del Proyecto</h2>
            <div style={{height:'300px', display:'flex', justifyContent:'center'}}>
              <Doughnut 
                data={statsData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: { 
                    legend: { position: 'bottom', labels: { color: '#fff', font:{family:'var(--font-sans)'} } } 
                  } 
                }} 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}