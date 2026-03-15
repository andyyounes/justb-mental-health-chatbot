/**
 * ChatBackground — fixed wallpaper behind chat messages.
 * position: absolute, inset: 0, pointer-events: none
 * Parent must have position: relative.
 * Wallpaper stays still while messages scroll over it.
 */
export function ChatBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Gradient wash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 70% 55% at 10% 15%, var(--jb-chat-orb-1) 0%, transparent 65%),
            radial-gradient(ellipse 55% 50% at 90% 80%, var(--jb-chat-orb-2) 0%, transparent 60%),
            radial-gradient(ellipse 45% 40% at 55% 45%, var(--jb-chat-orb-3) 0%, transparent 70%),
            var(--jb-bg)
          `,
        }}
      />

      {/* Tiled symbol layer — repeating SVG pattern */}
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          {/* ── Define a tile that we'll repeat ── */}
          <pattern id="jb-tile" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">

            {/* 4-pointed sparkle — top left */}
            <path
              d="M18 10 L19.2 14 L23 15 L19.2 16 L18 20 L16.8 16 L13 15 L16.8 14Z"
              fill="var(--jb-sym-color)" opacity="0.18"
            />

            {/* Small dot */}
            <circle cx="60" cy="8" r="2" fill="var(--jb-sym-color)" opacity="0.12" />

            {/* Crescent moon — top right */}
            <path
              d="M102 18 C102 11 107 6 113 5 C109 9 108 15 110 20 C112 25 117 28 122 28 C116 32 106 27 102 18Z"
              fill="var(--jb-sym-color)" opacity="0.14"
            />

            {/* Tiny sparkle — mid left */}
            <path
              d="M8 58 L9 61 L12 62 L9 63 L8 66 L7 63 L4 62 L7 61Z"
              fill="var(--jb-sym-color)" opacity="0.11"
            />

            {/* Heart — center */}
            <path
              d="M55 55 C55 52 57 50 59.5 50 C61 50 62.2 51 62.5 52.4 C62.8 51 64 50 65.5 50 C68 50 70 52 70 55 C70 60 62.5 65 62.5 65 C62.5 65 55 60 55 55Z"
              fill="var(--jb-sym-color)" opacity="0.11"
            />

            {/* Small plus / cross */}
            <rect x="98" y="56" width="2" height="9" rx="1" fill="var(--jb-sym-color)" opacity="0.10" />
            <rect x="94.5" y="59.5" width="9" height="2" rx="1" fill="var(--jb-sym-color)" opacity="0.10" />

            {/* Tiny circle — bottom left */}
            <circle cx="14" cy="104" r="2.5" fill="var(--jb-sym-color)" opacity="0.10" />

            {/* Mini sparkle — bottom center */}
            <path
              d="M60 100 L61 103 L64 104 L61 105 L60 108 L59 105 L56 104 L59 103Z"
              fill="var(--jb-sym-color)" opacity="0.13"
            />

            {/* Leaf teardrop — bottom right */}
            <path
              d="M108 112 C108 112 116 102 112 95 C106 101 104 108 108 112Z"
              fill="var(--jb-sym-color)" opacity="0.09"
            />

            {/* Tiny dot scatter */}
            <circle cx="38" cy="30" r="1.5" fill="var(--jb-sym-color)" opacity="0.08" />
            <circle cx="88" cy="38" r="1.5" fill="var(--jb-sym-color)" opacity="0.08" />
            <circle cx="30" cy="80" r="1.5" fill="var(--jb-sym-color)" opacity="0.08" />
            <circle cx="78" cy="88" r="1.5" fill="var(--jb-sym-color)" opacity="0.08" />
          </pattern>
        </defs>

        {/* Fill entire area with the repeating tile */}
        <rect width="100%" height="100%" fill="url(#jb-tile)" />
      </svg>
    </div>
  );
}
