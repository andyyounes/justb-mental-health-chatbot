/**
 * JustB Planet + Hula-ring logo — fully static, no animations.
 * Colours follow light / dark mode via CSS custom properties.
 */
import { useRef } from "react";

interface JustBLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

let _counter = 0;
function uid() { return `jbl${++_counter}`; }

export function JustBLogo({
  size = 110,
  showText = true,
  className = "",
  style,
}: JustBLogoProps) {
  const id = useRef(uid()).current;

  const pg  = `${id}_pg`;
  const rl1 = `${id}_rl1`;
  const rl2 = `${id}_rl2`;
  const th  = `${id}_th`;
  const bh  = `${id}_bh`;
  const op  = `${id}_op`;
  const tp  = `${id}_tp`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 110"
      fill="none"
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
    >
      <defs>
        {/* Planet gradient */}
        <radialGradient id={pg} cx="40%" cy="34%" r="70%">
          <stop offset="0%"   style={{ stopColor: "var(--jb-planet-0)" } as any}/>
          <stop offset="38%"  style={{ stopColor: "var(--jb-planet-1)" } as any}/>
          <stop offset="80%"  style={{ stopColor: "var(--jb-planet-2)" } as any}/>
          <stop offset="100%" style={{ stopColor: "var(--jb-planet-3)" } as any}/>
        </radialGradient>

        {/* Ring shimmer gradients */}
        <linearGradient id={rl1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#8b6fd4" stopOpacity="0"/>
          <stop offset="18%"  stopColor="#ffffff" stopOpacity="0.95"/>
          <stop offset="50%"  style={{ stopColor: "var(--jb-star-1)" } as any} stopOpacity="1"/>
          <stop offset="82%"  stopColor="#ffffff" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#8b6fd4" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id={rl2} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#a484e8" stopOpacity="0"/>
          <stop offset="20%"  stopColor="#d8d0f8" stopOpacity="0.88"/>
          <stop offset="50%"  stopColor="#f0ecff" stopOpacity="0.94"/>
          <stop offset="80%"  stopColor="#d8d0f8" stopOpacity="0.88"/>
          <stop offset="100%" stopColor="#a484e8" stopOpacity="0"/>
        </linearGradient>

        {/* Clip paths */}
        <clipPath id={th}><rect x="0" y="0" width="110" height="55"/></clipPath>
        <clipPath id={bh}><rect x="0" y="55" width="110" height="55"/></clipPath>
        <clipPath id={op}>
          <path d="M0 0 H110 V110 H0 Z M55 54 m-29 0 a29 29 0 1 0 58 0 a29 29 0 1 0 -58 0"/>
        </clipPath>
      </defs>

      {/* ─── Stars ─── */}
      <circle cx="10"  cy="14"  r="1"   style={{ fill: "var(--jb-star-1)" } as any} opacity="0.6"/>
      <circle cx="95"  cy="12"  r="0.8" style={{ fill: "var(--jb-star-2)" } as any} opacity="0.7"/>
      <circle cx="100" cy="88"  r="1"   style={{ fill: "var(--jb-star-1)" } as any} opacity="0.6"/>
      <circle cx="12"  cy="90"  r="0.8" style={{ fill: "var(--jb-star-2)" } as any} opacity="0.55"/>
      <circle cx="55"  cy="6"   r="0.6" style={{ fill: "var(--jb-star-1)" } as any} opacity="0.5"/>

      {/* 4-point sparkles */}
      <path d="M90 28 L91.2 31.5 L95 32.5 L91.2 33.5 L90 37 L88.8 33.5 L85 32.5 L88.8 31.5Z"
            style={{ fill: "var(--jb-accent)" } as any} opacity="0.55"/>
      <path d="M18 75 L19 78 L22 79 L19 80 L18 83 L17 80 L14 79 L17 78Z"
            style={{ fill: "var(--jb-star-1)" } as any} opacity="0.5"/>

      {/* ─── STEP 1: Back (top) halves of rings — behind planet ─── */}
      <g clipPath={`url(#${th})`} opacity="0.38">
        <ellipse cx="55" cy="54" rx="51" ry="15" fill="none" stroke={`url(#${rl2})`} strokeWidth="3"/>
        <ellipse cx="55" cy="54" rx="42" ry="12" fill="none" stroke={`url(#${rl1})`} strokeWidth="5"/>
      </g>

      {/* ─── STEP 2: Planet globe ─── */}
      <circle cx="55" cy="54" r="29" fill={`url(#${pg})`}/>
      {/* Specular highlights */}
      <ellipse cx="46" cy="44" rx="9" ry="5.5" fill="white" opacity="0.13" transform="rotate(-25 46 44)"/>
      <circle cx="42" cy="40" r="4.5" fill="white" opacity="0.22"/>
      <circle cx="38" cy="36" r="2.2" fill="white" opacity="0.3"/>

      {/* ─── STEP 3: Front (bottom) halves of rings — in front of planet ─── */}
      <g clipPath={`url(#${bh})`}>
        <ellipse cx="55" cy="54" rx="51" ry="15" fill="none" stroke={`url(#${rl2})`} strokeWidth="3" opacity="0.88"/>
        <ellipse cx="55" cy="54" rx="42" ry="12" fill="none" stroke={`url(#${rl1})`} strokeWidth="5" opacity="0.98"/>
      </g>

      {/* ─── Ring ends visible beyond planet top ─── */}
      <g clipPath={`url(#${op})`}>
        <g clipPath={`url(#${th})`}>
          <ellipse cx="55" cy="54" rx="51" ry="15" fill="none" stroke={`url(#${rl2})`} strokeWidth="3" opacity="0.85"/>
          <ellipse cx="55" cy="54" rx="42" ry="12" fill="none" stroke={`url(#${rl1})`} strokeWidth="5" opacity="0.95"/>
        </g>
      </g>

      {/* ─── JUSTB text curved on the front ring ─── */}
      {showText && (
        <g clipPath={`url(#${bh})`}>
          <path id={tp} d="M14 54 Q55 72 96 54" fill="none"/>
          <text fontFamily="'Black Ops One', sans-serif" fontSize="7" letterSpacing="4"
                style={{ fill: "var(--jb-ring-text)" } as any} opacity="0.95">
            <textPath href={`#${tp}`} startOffset="10%">J U S T B</textPath>
          </text>
        </g>
      )}
    </svg>
  );
}

/**
 * Large logo for the landing / onboarding page — static, no float or glow.
 */
export function LandingLogo({ size = 200 }: { size?: number }) {
  return <JustBLogo size={size} showText />;
}

/**
 * Compact widget for chat header / sidebar / loading screen.
 */
export function LogoWidget({ size = 32 }: { size?: number }) {
  return <JustBLogo size={size} showText={false} />;
}
