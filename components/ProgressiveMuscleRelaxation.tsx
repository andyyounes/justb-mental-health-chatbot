import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Check } from "lucide-react";

interface MuscleGroup {
  name: string;
  instructions: string;
  bodyPart: string;
  emoji: string;
}

const muscleGroups: MuscleGroup[] = [
  { name: "Hands", instructions: "Clench your fists tightly", bodyPart: "hands", emoji: "✊" },
  { name: "Arms", instructions: "Tense your biceps and forearms", bodyPart: "arms", emoji: "💪" },
  { name: "Shoulders", instructions: "Raise your shoulders up to your ears", bodyPart: "shoulders", emoji: "🤷" },
  { name: "Face", instructions: "Scrunch up your face tightly", bodyPart: "face", emoji: "😬" },
  { name: "Jaw", instructions: "Clench your jaw tightly", bodyPart: "jaw", emoji: "😤" },
  { name: "Neck", instructions: "Press your head back gently", bodyPart: "neck", emoji: "🦒" },
  { name: "Chest", instructions: "Take a deep breath and hold", bodyPart: "chest", emoji: "🫁" },
  { name: "Stomach", instructions: "Tighten your abdominal muscles", bodyPart: "stomach", emoji: "🌀" },
  { name: "Legs", instructions: "Straighten and tense your legs", bodyPart: "legs", emoji: "🦵" },
  { name: "Feet", instructions: "Curl your toes downward", bodyPart: "feet", emoji: "🦶" },
];

const DM = "'DM Sans', system-ui, sans-serif";

const gradBtn: React.CSSProperties = {
  background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  border: "none",
  borderRadius: 100,
  padding: "13px 28px",
  fontFamily: DM,
  fontWeight: 500,
  fontSize: 14,
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxShadow: "0 4px 16px rgba(109,40,217,0.3)",
  transition: "transform 0.15s, box-shadow 0.15s",
};

const outlineBtn: React.CSSProperties = {
  background: "var(--jb-surface)",
  border: "1.5px solid var(--jb-border-2)",
  borderRadius: 100,
  padding: "12px 20px",
  fontFamily: DM,
  fontWeight: 400,
  fontSize: 14,
  color: "var(--jb-text-icon)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  transition: "background 0.15s",
};

const card: React.CSSProperties = {
  background: "var(--jb-surface)",
  borderRadius: 20,
  boxShadow: "0 2px 16px var(--jb-card-shadow)",
  padding: "clamp(16px, 5vw, 24px)",
};

export function ProgressiveMuscleRelaxation() {
  const [phase, setPhase] = useState<"calibration" | "exercise" | "complete">("calibration");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<"ready" | "clench" | "hold" | "release">("ready");
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [tensionBefore, setTensionBefore] = useState(5);
  const [tensionAfter, setTensionAfter] = useState(5);
  const [highlightedPart, setHighlightedPart] = useState<string>("");

  const clenchDuration = 5;
  const releaseDuration = 10;

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && phase === "exercise") {
      interval = window.setInterval(() => {
        setTimer((prev) => {
          if (prev <= 0) { advanceStep(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, step, phase]);

  const advanceStep = () => {
    if (step === "ready") {
      setStep("clench"); setTimer(clenchDuration);
      setHighlightedPart(muscleGroups[currentIndex].bodyPart);
    } else if (step === "clench") {
      setStep("hold"); setTimer(clenchDuration);
    } else if (step === "hold") {
      setStep("release"); setTimer(releaseDuration);
    } else if (step === "release") {
      if (currentIndex < muscleGroups.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setStep("ready"); setHighlightedPart(""); setIsActive(false);
      } else {
        setPhase("complete"); setIsActive(false); setHighlightedPart("");
      }
    }
  };

  const startExercise = () => { setPhase("exercise"); setIsActive(false); setStep("ready"); };
  const togglePause = () => {
    if (step === "ready") { setIsActive(true); advanceStep(); }
    else { setIsActive(!isActive); }
  };
  const restart = () => {
    setPhase("calibration"); setCurrentIndex(0); setStep("ready");
    setTimer(0); setIsActive(false); setHighlightedPart("");
  };

  const getStepBg = () => {
    if (step === "clench" || step === "hold") return { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.4)" };
    if (step === "release") return { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.3)" };
    return { bg: "rgba(237,232,255,0.5)", border: "rgba(139,92,246,0.15)" };
  };

  const getInstruction = () => {
    const c = muscleGroups[currentIndex];
    switch (step) {
      case "ready": return `get ready for: ${c.name.toLowerCase()}`;
      case "clench": return c.instructions.toLowerCase();
      case "hold": return "hold it tight…";
      case "release": return "release and feel the tension melt away…";
      default: return "";
    }
  };

  const progressPct = ((currentIndex + 1) / muscleGroups.length) * 100;

  const wrapper: React.CSSProperties = {
    minHeight: "100%",
    background: "var(--jb-bg-grad)",
    padding: "clamp(16px, 5vw, 28px)",
    fontFamily: DM,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  };

  // ── Calibration ──
  if (phase === "calibration") {
    return (
      <div style={wrapper}>
        <div style={card}>
          <h2 style={{ margin: "0 0 6px", fontFamily: DM, fontWeight: 600, fontSize: 18, color: "var(--jb-text-2)" }}>
            progressive muscle relaxation
          </h2>
          <p style={{ margin: "0 0 24px", fontFamily: DM, fontWeight: 400, fontSize: 13, color: "var(--jb-text-3)", lineHeight: 1.6 }}>
            tense and release each muscle group to melt away stress.
          </p>

          <p style={{ fontFamily: DM, fontWeight: 500, fontSize: 13, color: "var(--jb-accent-3)", marginBottom: 12 }}>
            how tense are you right now?
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontFamily: DM, fontSize: 11, color: "rgba(109,40,217,0.5)" }}>relaxed</span>
            <input
              type="range" min={1} max={10} step={1}
              value={tensionBefore}
              onChange={e => setTensionBefore(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#7c3aed" }}
            />
            <span style={{ fontFamily: DM, fontSize: 11, color: "rgba(109,40,217,0.5)" }}>tense</span>
          </div>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 32, color: "#7c3aed" }}>{tensionBefore}</span>
            <span style={{ fontFamily: DM, fontSize: 13, color: "rgba(109,40,217,0.4)" }}> / 10</span>
          </div>

          <div style={{ background: "var(--jb-pill-bg)", borderRadius: 14, padding: "14px 16px", marginBottom: 24 }}>
            <p style={{ fontFamily: DM, fontWeight: 500, fontSize: 12, color: "var(--jb-text-2)", marginBottom: 8 }}>what to expect</p>
            {[
              `${muscleGroups.length} muscle groups`,
              `tense for ${clenchDuration} seconds`,
              `release for ${releaseDuration} seconds`,
              "notice the tension — then let go",
            ].map(t => (
              <p key={t} style={{ fontFamily: DM, fontWeight: 400, fontSize: 12, color: "var(--jb-text-3)", margin: "4px 0" }}>· {t}</p>
            ))}
          </div>

          <button onClick={startExercise} style={{ ...gradBtn, width: "100%" }}>
            start exercise
          </button>
        </div>
      </div>
    );
  }

  // ── Exercise ──
  if (phase === "exercise") {
    const { bg, border } = getStepBg();
    return (
      <div style={wrapper}>
        {/* Progress bar */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: DM, fontWeight: 500, fontSize: 12, color: "var(--jb-text-3)" }}>
              {currentIndex + 1} of {muscleGroups.length}
            </span>
            <span style={{ fontFamily: DM, fontWeight: 500, fontSize: 13, color: "var(--jb-accent-3)" }}>
              {muscleGroups[currentIndex].name.toLowerCase()}
            </span>
          </div>
          {/* Purple gradient progress bar */}
          <div style={{ height: 6, background: "var(--jb-pill-bg)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #c4b5fd, #7c3aed)",
              borderRadius: 100,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Step cards row */}
        <div style={{ display: "flex", gap: 8 }}>
          {muscleGroups.slice(0, Math.min(currentIndex + 3, muscleGroups.length)).map((g, i) => {
            const idx = i;
            const isCurrent = idx === currentIndex;
            const isDone = idx < currentIndex;
            return (
              <div key={g.bodyPart} style={{
                flex: isCurrent ? 2 : 1,
                background: isCurrent ? "var(--jb-pill-bg)" : isDone ? "rgba(167,139,250,0.15)" : "var(--jb-surface)",
                borderRadius: 14,
                padding: "10px 12px",
                border: `1.5px solid ${isCurrent ? "var(--jb-border-2)" : "var(--jb-border)"}`,
                transition: "all 0.3s ease",
                opacity: isDone ? 0.6 : 1,
              }}>
                <div style={{ fontSize: isCurrent ? 22 : 16, lineHeight: 1.2 }}>{g.emoji}</div>
                {isCurrent && (
                  <div style={{ fontFamily: DM, fontWeight: 500, fontSize: 11, color: "var(--jb-accent-3)", marginTop: 4 }}>
                    {g.name.toLowerCase()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Main instruction card */}
        <div style={{ ...card, background: bg, border: `1.5px solid ${border}`, textAlign: "center", padding: "clamp(20px,6vw,32px)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>{muscleGroups[currentIndex].emoji}</div>
          <h3 style={{ margin: "0 0 8px", fontFamily: DM, fontWeight: 500, fontSize: "clamp(15px,4vw,18px)", color: "var(--jb-text-form)", lineHeight: 1.4 }}>
            {getInstruction()}
          </h3>

          {step !== "ready" && (
            <div style={{ margin: "20px 0 8px" }}>
              <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 56, color: "var(--jb-accent)", lineHeight: 1 }}>
                {timer}
              </div>
              <div style={{ fontFamily: DM, fontWeight: 400, fontSize: 12, color: "var(--jb-text-3)", marginTop: 4 }}>
                {step === "release" ? "breathe and relax…" : "seconds"}
              </div>
            </div>
          )}

          {step === "ready" && (
            <p style={{ fontFamily: DM, fontWeight: 400, fontSize: 12, color: "var(--jb-text-3)", marginTop: 12 }}>
              press play when you're ready
            </p>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={togglePause} style={{ ...gradBtn, flex: 1 }}>
            {isActive ? <><Pause size={16} /> pause</> : <><Play size={16} /> {step === "ready" ? "start" : "resume"}</>}
          </button>
          <button onClick={restart} style={{ ...outlineBtn, width: 48, padding: 0, height: 48, borderRadius: "50%", flexShrink: 0 }}>
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── Complete ──
  return (
    <div style={wrapper}>
      <div style={{ ...card, textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: "0 4px 20px rgba(109,40,217,0.3)",
        }}>
          <Check size={28} color="#fff" />
        </div>
        <h2 style={{ margin: "0 0 8px", fontFamily: DM, fontWeight: 600, fontSize: 20, color: "var(--jb-text-2)" }}>
          all done ✦
        </h2>
        <p style={{ margin: "0 0 24px", fontFamily: DM, fontWeight: 400, fontSize: 13, color: "var(--jb-text-3)" }}>
          you worked through all {muscleGroups.length} muscle groups.
        </p>

        <p style={{ fontFamily: DM, fontWeight: 500, fontSize: 13, color: "var(--jb-accent-3)", marginBottom: 12 }}>
          how do you feel now?
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: DM, fontSize: 11, color: "rgba(109,40,217,0.5)" }}>relaxed</span>
          <input
            type="range" min={1} max={10} step={1}
            value={tensionAfter}
            onChange={e => setTensionAfter(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#7c3aed" }}
          />
          <span style={{ fontFamily: DM, fontSize: 11, color: "rgba(109,40,217,0.5)" }}>tense</span>
        </div>
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 32, color: "#7c3aed" }}>{tensionAfter}</span>
          <span style={{ fontFamily: DM, fontSize: 13, color: "rgba(109,40,217,0.4)" }}> / 10</span>
        </div>

        {tensionBefore > tensionAfter && (
          <div style={{ background: "var(--jb-pill-bg)", borderRadius: 14, padding: "12px 16px", marginBottom: 24 }}>
            <p style={{ fontFamily: DM, fontWeight: 500, fontSize: 13, color: "var(--jb-accent-3)", margin: 0 }}>
              tension dropped by {tensionBefore - tensionAfter} points 🎉
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={restart} style={{ ...outlineBtn, flex: 1 }}>do again</button>
          <button
            onClick={restart}
            style={{ ...gradBtn, flex: 1 }}
          >
            finish
          </button>
        </div>
      </div>
    </div>
  );
}