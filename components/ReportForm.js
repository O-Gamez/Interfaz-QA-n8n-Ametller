'use client';

import { useState } from 'react';

export default function ReportForm({
    caso,
    formData,
    handleChange,
    uploading,
    fileInputRef,
    previewImages,
    handleManualSelect,
    onDragEnter,
    onDragLeave,
    onDrop,
    isDragging,
    removeImage,
    enviar
}) {
    const [showHistory, setShowHistory] = useState(false);
    
    // Verificar si el caso ya tiene datos de tester y fecha (caso relleno)
    // Comprobación estricta: debe existir, ser string, y tener contenido real
    const hasTesterInfo = caso && 
        caso.Tester && 
        caso.Fecha && 
        String(caso.Tester).trim() !== '' && 
        String(caso.Fecha).trim() !== '' &&
        String(caso.Tester).trim() !== '—';

    
    // DEBUG: Mostrar en consola qué valores estamos recibiendo
    if (hasTesterInfo) {
        console.log('=== DEBUG ReportForm ===');
        console.log('caso.Tester:', caso.Tester, 'tipo:', typeof caso.Tester);
        console.log('caso.Fecha:', caso.Fecha, 'tipo:', typeof caso.Fecha);
    }
    
    // Parsear historial de testers, fechas y estados (separados por |)
    const testerRaw = hasTesterInfo ? String(caso.Tester).trim() : '';
    const fechaRaw = hasTesterInfo ? String(caso.Fecha).trim() : '';
    // Leer estado del historial, no del estado actual
    const estadoRaw = hasTesterInfo && (caso["Estado Historial"] || caso.Estado) ? String(caso["Estado Historial"] || caso.Estado).trim() : '';


    
    const testersList = testerRaw ? testerRaw.split('|').map(t => t.trim()) : [];
    const fechasList = fechaRaw ? fechaRaw.split('|').map(f => f.trim()) : [];
    const estadosList = estadoRaw ? estadoRaw.split('|').map(e => e.trim()) : [];

    
    // DEBUG: Listas parseadas
    console.log('testersList (raw):', testersList);
    console.log('fechasList (raw):', fechasList);
    
    // Asegurar que todas las listas tengan la misma longitud
    // Usar el máximo real para no perder datos del historial de estados
    const maxLength = Math.max(testersList.length, fechasList.length, estadosList.length, 1);
    
    // Rellenar testers - si hay menos testers que estados, repetir el último tester
    while (testersList.length < maxLength) {
        const lastValidTester = testersList[testersList.length - 1] || '—';
        testersList.push(lastValidTester);
    }
    
    // Rellenar fechas - si hay menos fechas que estados, repetir la última fecha
    while (fechasList.length < maxLength) {
        const lastValidFecha = fechasList[fechasList.length - 1] || '—';
        fechasList.push(lastValidFecha);
    }
    
    // Rellenar estados si es necesario
    while (estadosList.length < maxLength) {
        estadosList.push('—');
    }


    
    // DEBUG: Listas después de padding
    console.log('testersList (padded):', testersList);
    console.log('fechasList (padded):', fechasList);
    
    // Obtener la última modificación (última entrada válida, no placeholder)
    let lastIndex = testersList.length - 1;
    
    // Buscar hacia atrás hasta encontrar una entrada válida (no '—')
    while (lastIndex >= 0 && testersList[lastIndex] === '—') {
        lastIndex--;
    }
    if (lastIndex < 0) lastIndex = 0;
    
    const lastTester = testersList[lastIndex] && testersList[lastIndex] !== '—' ? testersList[lastIndex] : '—';
    
    // Para la fecha, buscar también la última válida
    let lastFechaIndex = fechasList.length - 1;
    while (lastFechaIndex >= 0 && fechasList[lastFechaIndex] === '—') {
        lastFechaIndex--;
    }
    if (lastFechaIndex < 0) lastFechaIndex = 0;
    
    const lastFecha = fechasList[lastFechaIndex] && fechasList[lastFechaIndex] !== '—' ? fechasList[lastFechaIndex] : '—';

    
    // DEBUG: Valores finales
    console.log('lastIndex:', lastIndex, 'lastTester:', lastTester, 'lastFecha:', lastFecha);



    
    // Obtener el último estado
    let lastEstadoIndex = estadosList.length - 1;
    while (lastEstadoIndex >= 0 && estadosList[lastEstadoIndex] === '—') {
        lastEstadoIndex--;
    }
    if (lastEstadoIndex < 0) lastEstadoIndex = 0;
    const lastEstado = estadosList[lastEstadoIndex] && estadosList[lastEstadoIndex] !== '—' ? estadosList[lastEstadoIndex] : '—';
    
    // Historial completo (todas las entradas excepto la última)
    const historyEntries = [];
    for (let i = 0; i < lastIndex; i++) {
        historyEntries.push({
            tester: testersList[i],
            fecha: fechasList[i] || '—',
            estado: estadosList[i] || '—'
        });
    }

    
    return (
        <div className="card" style={{ background: 'rgba(24, 24, 27, 0.8)' }}>
            <h2>📝 Reporte de Ejecución</h2>
            
            {/* Info de la última modificación */}
            {hasTesterInfo && (
                <div style={{ 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid var(--success)', 
                    borderRadius: '8px', 
                    padding: '12px 16px', 
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: 'var(--success)',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        <span>✅</span>
                        <span>Última modificación</span>
                    </div>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        gap: '12px',
                        fontSize: '13px'
                    }}>
                        <div>
                            <span style={{ color: 'var(--muted)' }}>Tester: </span>
                            <span style={{ color: '#fff', fontWeight: '500' }}>{lastTester}</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--muted)' }}>Fecha: </span>
                            <span style={{ color: '#fff', fontWeight: '500' }}>{lastFecha}</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--muted)' }}>Estado: </span>
                            <span style={{ color: '#fff', fontWeight: '500' }}>{lastEstado}</span>
                        </div>
                    </div>

                </div>
            )}
            
            {/* Acordeón con historial completo */}
            {historyEntries.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        style={{
                            width: '100%',
                            background: 'rgba(39, 39, 42, 0.8)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '10px 16px',
                            color: 'var(--muted)',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <span>📋 Ver historial completo ({historyEntries.length} modificaciones)</span>
                        <span>{showHistory ? '▲' : '▼'}</span>
                    </button>
                    
                    {showHistory && (
                        <div style={{
                            background: 'rgba(39, 39, 42, 0.5)',
                            border: '1px solid var(--border)',
                            borderTop: 'none',
                            borderRadius: '0 0 8px 8px',
                            padding: '12px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            fontSize: '12px'
                        }}>
                            {historyEntries.map((entry, index) => (
                                <div key={index} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: '8px',
                                    padding: '6px 0',
                                    borderBottom: index < historyEntries.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                }}>
                                    <div>
                                        <span style={{ color: 'var(--muted)' }}>Tester: </span>
                                        <span style={{ color: '#fff' }}>{entry.tester}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--muted)' }}>Fecha: </span>
                                        <span style={{ color: '#fff' }}>{entry.fecha}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--muted)' }}>Estado: </span>
                                        <span style={{ color: '#fff' }}>{entry.estado}</span>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>
            )}


            
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
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;color:#a1a1aa;font-size:24px;">📄</div>';
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
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" multiple onChange={handleManualSelect} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                    <div className="input-header"><div className="label">Estado *</div></div>
                    <select name="estado" value={formData.estado} onChange={handleChange} disabled={!caso} style={{ height: '48px' }}>
                        <option value="">Seleccionar...</option>
                        <option value="Ready to test">📝 Ready to test</option>
                        <option value="OK-UAT">✅ OK-UAT</option>
                        <option value="OK-FINAL">✨ OK-FINAL</option>
                        <option value="KO">❌ KO</option>
                        <option value="BLOQUEADO">⛔ BLOQUEADO</option>
                    </select>

                </div>
                <div className="input-group">
                    <div className="input-header"><div className="label">Notas Internas</div></div>
                    <textarea name="notas" value={formData.notas} onChange={handleChange} disabled={!caso} style={{ minHeight: '48px', height: '48px' }} />
                </div>
            </div>

            <div className="actions" style={{ justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={enviar} disabled={!caso || uploading}>
                    {uploading ? "⏳ Procesando..." : "Enviar Resultado ✨"}
                </button>
            </div>
        </div>
    );
}
