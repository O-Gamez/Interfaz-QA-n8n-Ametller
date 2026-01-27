'use client';

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
    return (
        <div className="card" style={{ background: 'rgba(24, 24, 27, 0.8)' }}>
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
                        <option value="OK">✅ OK</option>
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
