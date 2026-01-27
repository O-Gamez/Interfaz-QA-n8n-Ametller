'use client';

import { Doughnut } from 'react-chartjs-2';

export default function StatsModal({ statsData, setShowStats }) {
    if (!statsData) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.3s' }}>
            <div className="card" style={{ width: '400px', maxWidth: '90%', position: 'relative', padding: '40px 20px', background: '#18181b', border: '1px solid var(--border)' }}>
                <button onClick={() => setShowStats(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#fff', cursor: 'pointer' }}>✖</button>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Progreso del Proyecto</h2>
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                    <Doughnut
                        data={statsData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom', labels: { color: '#fff', font: { family: 'var(--font-sans)' } } }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
