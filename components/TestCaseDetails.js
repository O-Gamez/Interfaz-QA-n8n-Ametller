'use client';

export default function TestCaseDetails({ caso }) {
    if (!caso) return null;

    return (
        <div className="card">
            <h2>📄 Detalles <span className="badge">ID: {caso.ID}</span></h2>
            <div className="data-row"><div className="label">Nombre</div><div className="value">{caso["Nombre del Caso"] || "—"}</div></div>
            <div className="data-row"><div className="label">Área / Tipo</div><div className="value">{`${caso.Area} • ${caso["Tipo de Pedido"]}`}</div></div>
            <div className="data-row"><div className="label">Precondiciones</div><div className="value">{caso.Precondiciones || "—"}</div></div>
            <div className="data-row"><div className="label">Pasos</div><div className="value">{caso.Pasos || "—"}</div></div>
            <hr style={{ borderColor: 'var(--border)', margin: '20px 0', opacity: 0.5 }} />
            <div className="data-row"><div className="label">Datos Prueba</div><div className="value mono">{caso["Datos prueba"] || "—"}</div></div>
            <div className="data-row"><div className="label">Método Pago</div><div className="value">{caso["Método de Pago"] || "—"}</div></div>
            <div className="data-row"><div className="label" style={{ color: 'var(--primary)' }}>Res. Esperado</div><div className="value">{caso["Resultado Esperado"] || "—"}</div></div>
        </div>
    );
}
