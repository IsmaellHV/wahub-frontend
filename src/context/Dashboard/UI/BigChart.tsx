'use client';
import { useMemo } from 'react';

// Two-line chart (Total + AI handled). Pure SVG, no chart lib.
export const BigChart = () => {
  const days = 14;
  const w = 600;
  const h = 200;
  const pad = 24;

  const { totalPath, aiPath, fillPath } = useMemo(() => {
    const total = Array.from({ length: days }, (_, i) => 200 + Math.sin(i * 0.7) * 80 + i * 18 + ((i * 31) % 30));
    const ai = total.map((v, i) => v * (0.6 + ((i * 13) % 15) / 100));
    const max = Math.max(...total) * 1.1;
    const path = (data: number[]) =>
      data
        .map((v, i) => {
          const x = pad + (i / (days - 1)) * (w - pad * 2);
          const y = h - pad - (v / max) * (h - pad * 2);
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    return {
      totalPath: path(total),
      aiPath: path(ai),
      fillPath: `${path(total)} L${w - pad},${h - pad} L${pad},${h - pad} Z`,
    };
  }, []);

  return (
    <div>
      <div className="row" style={{ gap: 16, marginBottom: 8, fontSize: 12.5 }}>
        <div className="row" style={{ gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--brand-500)' }} />
          <span className="muted">Total</span>
          <span style={{ fontWeight: 600 }}>25,950</span>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--lime)' }} />
          <span className="muted">AI handled</span>
          <span style={{ fontWeight: 600 }}>18,221</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 200 }}>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={pad}
            x2={w - pad}
            y1={pad + (i * (h - pad * 2)) / 3}
            y2={pad + (i * (h - pad * 2)) / 3}
            stroke="var(--border-subtle)"
            strokeDasharray="2 4"
          />
        ))}
        <path d={fillPath} fill="var(--brand-500)" opacity="0.08" />
        <path d={totalPath} stroke="var(--brand-500)" strokeWidth="1.8" fill="none" />
        <path d={aiPath} stroke="var(--lime-deep)" strokeWidth="1.8" fill="none" strokeDasharray="3 3" />
      </svg>
    </div>
  );
};
