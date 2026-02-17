'use client';

export default function TestSelector({
    tester,
    handleLogout,
    fetchStats,
    selectedTestId,
    setSelectedTestId,
    testList,
    iniciarWorkflow,
    uploading,
    // New props for filters
    device,
    setDevice,
    filterArea,
    setFilterArea,
    uniqueAreas,
    filterEstado,
    setFilterEstado,
    uniqueEstados,
    onChangeTester

}) {

    return (
        <header className="header">

            {/* 1. TOP BAR: Title & Actions */}
            <div className="header-top">
                <div className="brand">
                    <h1>**QA VISEO UAT AMETLLER**</h1>
                    <div className="tester-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Tester: <span>{tester}</span>
                        <button 
                            onClick={onChangeTester}
                            title="Cambiar tester"
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                cursor: 'pointer',
                                padding: '2px',
                                fontSize: '14px',
                                lineHeight: '1'
                            }}
                        >
                            ✏️
                        </button>
                    </div>

                </div>


                {/* DEVICE TABS (CENTERED/PROMINENT) */}
                <div className="device-tabs">
                    <button
                        className={`tab-btn ${device === 'desktop' ? 'active' : ''}`}
                        onClick={() => setDevice('desktop')}
                    >
                        💻 DESKTOP
                    </button>
                    <button
                        className={`tab-btn ${device === 'mobile' ? 'active' : ''}`}
                        onClick={() => setDevice('mobile')}
                    >
                        📱 MOBILE
                    </button>
                    <button
                        className={`tab-btn ${device === 'global' ? 'active' : ''}`}
                        onClick={() => setDevice('global')}
                    >
                        🌐 GLOBAL
                    </button>
                </div>


                <div className="actions">
                    <button className="btn-secondary btn-sm" onClick={fetchStats}>📊 Stats</button>
                    <button className="btn-secondary btn-sm" onClick={handleLogout}>🔒 Salir</button>
                </div>
            </div>

            {/* 2. TOOLBAR: Filters & Actions */}
            <div className="toolbar">
                {/* Area Filter */}
                <div className="filter-group">
                    <label>Filtrar Área:</label>
                    <select
                        className="test-selector area-select"
                        value={filterArea}
                        onChange={(e) => setFilterArea(e.target.value)}
                    >
                        <option value="">-- Todas --</option>
                        {uniqueAreas.map(area => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                </div>

                {/* Estado Filter */}
                <div className="filter-group">
                    <label>Filtrar Estado:</label>
                    <select
                        className="test-selector estado-select"
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                    >
                        <option value="">-- Todos --</option>
                        {uniqueEstados.map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                        ))}
                    </select>
                </div>

                {/* Test Selector */}

                <div className="filter-group test-group">
                    <label>Seleccionar Caso:</label>
                    <select
                        className="test-selector main-select"
                        value={selectedTestId}
                        onChange={(e) => setSelectedTestId(e.target.value)}
                    >
                        <option value="">-- Modo Automático (Siguiente) --</option>

                        {testList.map((t) => {
                            const estado = t.Estado ? t.Estado.toUpperCase().trim() : "PENDIENTE";
                            let icono = "⬜";
                            if (estado === "OK-UAT") icono = "✅";
                            if (estado === "OK-FINAL") icono = "✨";
                            if (estado === "READY TO TEST") icono = "📝";
                            if (estado === "KO") icono = "❌";
                            if (estado === "BLOQUEADO") icono = "⛔";

                            return (
                                <option key={t.ID} value={t.ID}>
                                    {icono} {t.ID} - {t["Nombre del Caso"] || t.Nombre} ({estado})
                                </option>
                            );
                        })}

                    </select>
                </div>

                <button className="btn-success btn-action" onClick={iniciarWorkflow} disabled={uploading}>
                    {selectedTestId ? "📥 Cargar Caso" : "🚀 Cargar Siguiente"}
                </button>
            </div>
        </header>
    );
}
