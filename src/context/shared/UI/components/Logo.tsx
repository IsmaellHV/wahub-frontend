'use client';
import { useId, type CSSProperties } from 'react';

interface Props {
  size?: number;
  style?: CSSProperties;
  className?: string;
  variant?: 'tile' | 'mark';
  animated?: boolean;
}

// waHub mark — geometric W stroke + chat-bubble silhouette + accent dot.
// IDs use React `useId` (SSR-stable) to avoid hydration mismatch.
export const Logo = ({ size = 32, style, className, variant = 'tile', animated = false }: Props) => {
  const reactId = useId();
  // useId returns ":r0:" — strip non-id-safe chars
  const id = `wh${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const isTile = variant === 'tile';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="waHub"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      {isTile && <rect x="0" y="0" width="40" height="40" rx="11" fill={`url(#${id}-bg)`} />}

      <path
        d="M 9 13 L 13.5 27 L 18 17 L 22 27 L 26.5 13"
        stroke={isTile ? '#fff' : 'currentColor'}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <path
        d="M 28 26 L 32 30 L 32 26 Z"
        fill={isTile ? 'rgba(255,255,255,.85)' : 'currentColor'}
      />

      <circle cx="31" cy="11" r="2.4" fill={isTile ? '#fff' : 'currentColor'}>
        {animated && <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" repeatCount="indefinite" />}
      </circle>

      {animated && isTile && (
        <circle cx="31" cy="11" r="2.4" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6">
          <animate attributeName="r" values="2.4;6;2.4" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
};
