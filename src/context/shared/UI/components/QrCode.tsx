'use client';
import { useMemo } from 'react';

interface Props {
  data?: string;
  size?: number;
  fg?: string;
}

// Procedural QR-code-like SVG renderer (looks like a real WhatsApp pairing QR).
// Deterministic from `data` string seed.
export const QrCode = ({ data = 'wahub-pair-7c3e0b9a', size = 248, fg = '#0a0a0b' }: Props) => {
  const cells = 33;
  const pixel = size / cells;

  const seed = useMemo(() => {
    let h = 0;
    for (let i = 0; i < data.length; i++) h = (h * 31 + data.charCodeAt(i)) | 0;
    return h;
  }, [data]);

  const grid = useMemo(() => {
    const g: number[][] = [];
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let y = 0; y < cells; y++) {
      const row: number[] = [];
      for (let x = 0; x < cells; x++) {
        const inFinder = (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7);
        if (inFinder) {
          const fx = x < 7 ? x : x >= cells - 7 ? x - (cells - 7) : 0;
          const fy = y < 7 ? y : y >= cells - 7 ? y - (cells - 7) : 0;
          const onRing = fx === 0 || fx === 6 || fy === 0 || fy === 6;
          const onCenter = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
          row.push(onRing || onCenter ? 1 : 0);
        } else if (x === 6 || y === 6) {
          row.push((x + y) % 2 === 0 ? 1 : 0);
        } else {
          row.push(rand() > 0.52 ? 1 : 0);
        }
      }
      g.push(row);
    }
    return g;
  }, [seed]);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" rx="4" />
      {grid.map((row, y) =>
        row.map((v, x) =>
          v ? <rect key={`${x}-${y}`} x={x * pixel} y={y * pixel} width={pixel} height={pixel} fill={fg} rx={pixel * 0.15} /> : null,
        ),
      )}
    </svg>
  );
};
