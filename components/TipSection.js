'use client';

export default function TipSection({ caso }) {
    if (!caso || !caso["Consejo para el Test"]) return null;

    return (
        <div className="tip-box">
            <div className="tip-icon">💡</div>
            <div className="tip-content">
                <div className="tip-title">Consejo generado con IA</div>

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
    );
}
