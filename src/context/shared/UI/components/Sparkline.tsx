'use client';

interface Props {
  data: number[];
  color?: string;
  fill?: boolean;
}

export const Sparkline = ({ data, color = 'var(--brand-500)', fill = true }: Props) => {
  const w = 200;
  const h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return [x, y] as const;
  });
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const fillD = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && <path d={fillD} fill={color} opacity="0.08" />}
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
};
