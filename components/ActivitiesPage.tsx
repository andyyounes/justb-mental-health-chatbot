import { useState, useEffect } from "react";
import { BoxBreathing } from "./BoxBreathing";
import { GroundingExercise } from "./GroundingExercise";
import { ProgressiveMuscleRelaxation } from "./ProgressiveMuscleRelaxation";
import { SafePlaceVisualization } from "./SafePlaceVisualization";
import { JournalingExercise } from "./JournalingExercise";
import { ActivityCard } from "./ActivityCard";
import { Wind, Anchor, Book, Loader, Sparkles, ChevronLeft, Brain } from "lucide-react";
import { LogoWidget } from "./JustBLogo";

interface ActivitiesPageProps {
  onBack: () => void;
  onNavigateToTasks?: () => void;
  startExercise?: string | null; // NEW — auto-launch a specific exercise from chat
}

// ── shared style tokens ──────────────────────────────────────────
const card: React.CSSProperties = {
  background: "var(--jb-surface)",
  borderRadius: 16,
  boxShadow: "0 1px 8px var(--jb-card-shadow)",
  padding: "clamp(14px, 4vw, 20px)",
  width: "100%",
  boxSizing: "border-box",
};

const sectionLabel: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "var(--jb-text-3)",
  marginBottom: 12,
};

const pill: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--jb-pill-text)",
  background: "var(--jb-pill-bg)",
  borderRadius: 100,
  padding: "2px 10px",
  display: "inline-block",
  whiteSpace: "nowrap" as const,
};

const startBtn: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: 13,
  color: "#fff",
  background: "linear-gradient(135deg, #8b6fd4, #6a4fc0)",
  border: "none",
  borderRadius: 100,
  padding: "8px 20px",
  cursor: "pointer",
  marginTop: 10,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  transition: "opacity 0.15s",
};

const backBtn: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: 13,
  color: "var(--jb-text-icon)",
  background: "var(--jb-back-btn-bg)",
  border: "none",
  borderRadius: 100,
  padding: "8px 16px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 20,
  transition: "background 0.15s",
};

// ── exercise sub-pages ───────────────────────────────────────────
function ExerciseShell({
  onBack,
  children,
}: {
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--jb-bg)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        paddingTop: "max(env(safe-area-inset-top), 59px)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          margin: "0 auto",
          padding: "16px clamp(12px, 4vw, 20px) 32px",
          boxSizing: "border-box",
        }}
      >
        <button
          style={backBtn}
          onClick={onBack}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.15)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(139,92,246,0.08)")}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Activities
        </button>
        {children}
      </div>
    </div>
  );
}

// ── small interactive card (PMR / Visualization / Journaling) ────
function InteractiveCard({
  icon: Icon,
  title,
  description,
  duration,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  duration: string;
  onClick: () => void;
}) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "var(--jb-pill-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon style={{ width: 20, height: 20, color: "var(--jb-text-icon)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(14px, 3.5vw, 15px)",
              color: "var(--jb-text-2)",
              margin: 0,
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(12px, 3vw, 13px)",
              color: "#8a78c0",
              marginTop: 4,
              marginBottom: 8,
            }}
          >
            {description}
          </p>
          <span style={pill}>{duration}</span>
          <br />
          <button
            style={startBtn}
            onClick={onClick}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <Sparkles style={{ width: 13, height: 13 }} /> Start
          </button>
        </div>
      </div>
    </div>
  );
}

// ── inline quick card (wraps BoxBreathing / GroundingExercise) ───
function QuickCard({
  icon: Icon,
  title,
  duration,
  children,
}: {
  icon: any;
  title: string;
  duration: string;
  children: React.ReactNode;
}) {
  return (
    <div style={card}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "var(--jb-pill-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon style={{ width: 17, height: 17, color: "var(--jb-text-icon)" }} />
        </div>
        <div>
          <p
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "var(--jb-text-2)",
              margin: 0,
            }}
          >
            {title}
          </p>
          <span style={{ ...pill, marginTop: 2, display: "inline-block" }}>{duration}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────
export function ActivitiesPage({ onBack, onNavigateToTasks, startExercise }: ActivitiesPageProps) {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  // Auto-launch the exercise that the user accepted from the chat action card
  useEffect(() => {
    if (startExercise) {
      setActiveExercise(startExercise);
    }
  }, [startExercise]);

  // ── Full-screen exercise sub-pages ───────────────────────────────────────
  if (activeExercise === "box-breathing") {
    return (
      <ExerciseShell onBack={() => setActiveExercise(null)}>
        <BoxBreathing />
      </ExerciseShell>
    );
  }
  if (activeExercise === "grounding") {
    return (
      <ExerciseShell onBack={() => setActiveExercise(null)}>
        <GroundingExercise />
      </ExerciseShell>
    );
  }
  if (activeExercise === "pmr") {
    return (
      <ExerciseShell onBack={() => setActiveExercise(null)}>
        <ProgressiveMuscleRelaxation />
      </ExerciseShell>
    );
  }
  if (activeExercise === "visualization") {
    return (
      <ExerciseShell onBack={() => setActiveExercise(null)}>
        <SafePlaceVisualization />
      </ExerciseShell>
    );
  }
  if (activeExercise === "journaling") {
    return (
      <ExerciseShell onBack={() => setActiveExercise(null)}>
        <JournalingExercise />
      </ExerciseShell>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--jb-bg)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        overflowX: "hidden",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* ── compact header ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--jb-header-bg)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--jb-border)",
          paddingTop: "max(env(safe-area-inset-top), 59px)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 896,
            margin: "0 auto",
            height: 46,
            display: "flex",
            alignItems: "center",
            paddingInline: "clamp(10px, 3vw, 16px)",
            gap: 8,
          }}
        >
          {/* Left: JustB logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <LogoWidget size={30} />
            <span style={{ fontFamily: "'Black Ops One', 'DM Sans', system-ui, sans-serif", fontWeight: 400, fontSize: 13, color: "var(--jb-text-2)", letterSpacing: "0.2em" }}>
              JUSTB
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Right: back to chat */}
          <button
            onClick={onBack}
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: 12,
              color: "var(--jb-text-icon)",
              background: "var(--jb-back-btn-bg)",
              border: "none",
              borderRadius: 100,
              padding: "5px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.15)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--jb-back-btn-bg)")}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} /> Chat
          </button>
        </div>
      </div>

      {/* ── content ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          margin: "0 auto",
          padding: "20px clamp(12px, 4vw, 20px) 40px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Page title */}
        <div>
          <p style={sectionLabel}>Activities</p>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 600, fontSize: "clamp(20px, 5vw, 24px)", color: "var(--jb-text-2)", margin: 0 }}>
            calming exercises
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 400, fontSize: 13, color: "var(--jb-text-3)", marginTop: 4 }}>
            take your time — there's no rush here
          </p>
        </div>

        {/* ── Interactive exercises ── */}
        <div>
          <p style={sectionLabel}>guided exercises</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <InteractiveCard icon={Loader} title="Progressive Muscle Relaxation" description="Release physical tension through guided muscle groups with timers" duration="10–15 min" onClick={() => setActiveExercise("pmr")} />
            <InteractiveCard icon={Brain} title="Safe Place Visualization" description="Build and save your own personalized mental sanctuary" duration="5–7 min" onClick={() => setActiveExercise("visualization")} />
            <InteractiveCard icon={Book} title="Guided Journaling" description="Write your thoughts freely with gentle prompts to guide you" duration="10–20 min" onClick={() => setActiveExercise("journaling")} />
          </div>
        </div>

        {/* ── Quick techniques ── */}
        <div>
          <p style={sectionLabel}>quick techniques · 2–5 min</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <QuickCard icon={Wind} title="Box Breathing" duration="2–5 min"><BoxBreathing /></QuickCard>
            <QuickCard icon={Anchor} title="5-4-3-2-1 Grounding" duration="3–5 min"><GroundingExercise /></QuickCard>
          </div>
        </div>

        {/* ── Crisis strip ── */}
        <div style={{ background: "var(--jb-surface)", borderRadius: 16, boxShadow: "0 1px 8px var(--jb-card-shadow)", border: "1px solid rgba(220,100,100,0.12)", padding: "clamp(14px, 4vw, 20px)", textAlign: "center" }}>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 600, fontSize: 14, color: "#c0392b", margin: "0 0 6px" }}>need immediate help?</p>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 400, fontSize: 13, color: "var(--jb-text-3)", margin: "0 0 10px" }}>you're not alone — reach out right now</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[{ label: "USA", val: "988" },{ label: "UK", val: "116 123" },{ label: "Text line", val: "text HOME to 741741" }].map((row) => (
              <p key={row.label} style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, color: "var(--jb-text-icon)", margin: 0 }}>
                <span style={{ fontWeight: 600 }}>{row.label}:</span> {row.val}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
