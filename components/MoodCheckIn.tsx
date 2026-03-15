import { useState } from "react";

const MOODS = [
  { emoji: "😔", label: "rough", gradient: "linear-gradient(135deg,#6366f1,#4f46e5)" },
  { emoji: "😐", label: "meh",   gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
  { emoji: "🙂", label: "okay",  gradient: "linear-gradient(135deg,#a78bfa,#8b5cf6)" },
  { emoji: "😄", label: "great", gradient: "linear-gradient(135deg,#c4b5fd,#a78bfa)" },
];

const DM = "'DM Sans', system-ui, sans-serif";

interface MoodCheckInProps {
  onSelect: (mood: string, emoji: string) => void;
}

export function MoodCheckIn({ onSelect }: MoodCheckInProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @keyframes moodSlideIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
      <div
        style={{
          background: "var(--jb-surface)",
          border: "1px solid var(--jb-border-2)",
          borderRadius: 20,
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          maxWidth: 300,
          alignSelf: "flex-start",
          boxShadow: "0 4px 18px var(--jb-bubble-shadow)",
          animation: "moodSlideIn 0.32s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <p style={{
          margin: 0,
          fontFamily: DM, fontWeight: 500, fontSize: 13,
          color: "var(--jb-text-2)", textAlign: "center", lineHeight: 1.5,
        }}>
          before we start — how are you feeling right now?
        </p>

        <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
          {MOODS.map((mood, i) => (
            <button
              key={mood.emoji}
              onClick={() => onSelect(mood.label, mood.emoji)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                transform: hoveredIdx === i ? "scale(1.28) translateY(-4px)" : "scale(1) translateY(0)",
                transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              <span style={{
                fontSize: 30,
                lineHeight: 1,
                display: "block",
                filter: hoveredIdx === i ? "drop-shadow(0 2px 6px rgba(139,92,246,0.35))" : "none",
                transition: "filter 0.18s",
              }}>
                {mood.emoji}
              </span>
              <span style={{
                fontFamily: DM, fontSize: 10, fontWeight: 500,
                color: hoveredIdx === i ? "var(--jb-accent)" : "var(--jb-text-3)",
                transition: "color 0.15s",
              }}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
