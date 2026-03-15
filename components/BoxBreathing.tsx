import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const phases = [
  { name: "Breathe In", duration: 4 },
  { name: "Hold", duration: 4 },
  { name: "Breathe Out", duration: 4 },
  { name: "Hold", duration: 4 },
];

const DM = "'DM Sans', system-ui, sans-serif";

const card: React.CSSProperties = {
  background: "var(--jb-surface)",
  borderRadius: 20,
  boxShadow: "0 2px 16px var(--jb-card-shadow)",
  padding: "clamp(16px, 5vw, 24px)",
};

export function BoxBreathing() {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(phases[0].duration);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      const nextPhase = (currentPhase + 1) % phases.length;
      if (nextPhase === 0) {
        setCycles((c) => c + 1);
      }
      setCurrentPhase(nextPhase);
      setTimeLeft(phases[nextPhase].duration);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentPhase]);

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhase(0);
    setTimeLeft(phases[0].duration);
    setCycles(0);
  };

  const progress =
    (phases[currentPhase].duration - timeLeft) / phases[currentPhase].duration;
  const dotCx =
    currentPhase === 0
      ? 20 + 200 * progress
      : currentPhase === 1
      ? 220
      : currentPhase === 2
      ? 220 - 200 * progress
      : 20;
  const dotCy =
    currentPhase === 0
      ? 20
      : currentPhase === 1
      ? 20 + 200 * progress
      : currentPhase === 2
      ? 220
      : 220 - 200 * progress;

  return (
    <div style={{ minHeight: "100%", background: "var(--jb-bg-grad)", padding: "clamp(16px,5vw,28px)", fontFamily: DM, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: "clamp(16px,4vw,24px)" }}>
          <h3 style={{ margin: "0 0 8px", fontFamily: DM, fontWeight: 600, fontSize: 18, color: "var(--jb-text-2)" }}>
            Box Breathing
          </h3>
          <p style={{ margin: 0, fontFamily: DM, fontWeight: 400, fontSize: 13, color: "var(--jb-text-3)", lineHeight: 1.5 }}>
            A calming technique used to reduce stress and anxiety
          </p>
        </div>

        {/* Responsive SVG Breathing Box */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(16px,4vw,24px)" }}>
          <svg
            viewBox="0 0 240 240"
            style={{ width: "100%", maxWidth: "clamp(200px,60vw,260px)" }}
            aria-hidden="true"
          >
            {/* Box outline */}
            <rect
              x="20" y="20" width="200" height="200"
              fill="none"
              stroke="var(--jb-border-2)"
              strokeWidth="2"
              rx="4"
            />

            {/* Center countdown */}
            <text
              x="120" y="112"
              textAnchor="middle" dominantBaseline="middle"
              fontSize="48" fontWeight="bold"
              fill="var(--jb-accent)"
            >
              {timeLeft}
            </text>
            <text
              x="120" y="148"
              textAnchor="middle" dominantBaseline="middle"
              fontSize="14"
              fill="var(--jb-text-3)"
            >
              {phases[currentPhase].name}
            </text>

            {/* Animated dot */}
            <circle
              cx={dotCx} cy={dotCy} r="8"
              fill="#a855f7"
              style={{ transition: "cx 1s linear, cy 1s linear" }}
            />
          </svg>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16 }}>
          <button
            onClick={() => setIsActive(!isActive)}
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              border: "none", borderRadius: 100,
              padding: "12px 24px",
              fontFamily: DM, fontWeight: 500, fontSize: 14, color: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(109,40,217,0.3)",
            }}
          >
            {isActive ? (
              <><Pause style={{ width: 16, height: 16 }} /> Pause</>
            ) : (
              <><Play style={{ width: 16, height: 16 }} /> Start</>
            )}
          </button>
          <button
            onClick={handleReset}
            style={{
              background: "var(--jb-surface)", border: "1.5px solid var(--jb-border-2)",
              borderRadius: 100, padding: "12px 20px",
              fontFamily: DM, fontWeight: 400, fontSize: 14, color: "var(--jb-text-icon)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--jb-pill-bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--jb-surface)")}
          >
            <RotateCcw style={{ width: 16, height: 16 }} /> Reset
          </button>
        </div>

        {/* Stats */}
        <div style={{ textAlign: "center", fontFamily: DM, fontSize: 13, color: "var(--jb-text-3)", marginBottom: 16 }}>
          Completed cycles: <span style={{ color: "var(--jb-accent-3)", fontWeight: 600 }}>{cycles}</span>
        </div>

        {/* Instructions */}
        <div style={{ background: "var(--jb-pill-bg)", borderRadius: 14, padding: "clamp(12px,4vw,16px)" }}>
          <p style={{ fontFamily: DM, fontSize: 13, color: "var(--jb-text-body)", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "var(--jb-text-2)" }}>How it works:</strong> Follow the dot around the box. Breathe
            in for 4 seconds, hold for 4 seconds, breathe out for 4 seconds, and
            hold for 4 seconds. Repeat for several cycles to feel calm and
            centered.
          </p>
        </div>
      </div>
    </div>
  );
}
