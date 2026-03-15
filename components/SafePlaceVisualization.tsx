import { useState, useEffect } from "react";
import { Volume2, VolumeX, Save, Check, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";

type Scene = "beach" | "forest" | "mountain" | "meadow";
type Sound = "waves" | "birds" | "wind" | "stream" | "silence";

interface SavedPlace {
  scene: Scene;
  sound: Sound;
  description: string;
  timestamp: string;
}

const scenes = {
  beach: {
    name: "peaceful beach",
    emoji: "🏖️",
    orb1: "#7dd3fc", orb2: "#fcd34d",
    description: "soft sand beneath your feet, gentle waves lapping at the shore",
  },
  forest: {
    name: "serene forest",
    emoji: "🌲",
    orb1: "#6ee7b7", orb2: "#a3e635",
    description: "tall trees surrounding you, dappled sunlight filtering through leaves",
  },
  mountain: {
    name: "mountain peak",
    emoji: "🏔️",
    orb1: "#93c5fd", orb2: "#e2e8f0",
    description: "fresh mountain air, breathtaking views stretching for miles",
  },
  meadow: {
    name: "flower meadow",
    emoji: "🌸",
    orb1: "#f9a8d4", orb2: "#c4b5fd",
    description: "colorful wildflowers swaying gently in a warm breeze",
  },
};

const sounds = {
  waves: { name: "ocean waves", emoji: "🌊" },
  birds: { name: "birdsong", emoji: "🐦" },
  wind: { name: "gentle wind", emoji: "🍃" },
  stream: { name: "babbling brook", emoji: "💧" },
  silence: { name: "peaceful silence", emoji: "🤫" },
};

const guidedScript = [
  "take a deep breath… and let your eyes gently close if you're comfortable.",
  "imagine yourself in this peaceful place. you are safe here.",
  "what do you see around you? notice the colors, the soft light…",
  "what sounds wash over you? let them carry your tension away…",
  "feel the ground beneath you. what textures, what warmth…",
  "breathe in the air here. let a gentle scent fill your lungs…",
  "this is your safe place. you can return here any time you need.",
  "stay here as long as you like. you are safe. you are calm. ✦",
];

const DM = "'DM Sans', system-ui, sans-serif";

const gradBtn: React.CSSProperties = {
  background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  border: "none", borderRadius: 100,
  padding: "13px 24px",
  fontFamily: DM, fontWeight: 500, fontSize: 14, color: "#fff",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  boxShadow: "0 4px 16px rgba(109,40,217,0.3)",
  transition: "transform 0.15s",
};

const card: React.CSSProperties = {
  background: "var(--jb-surface)", borderRadius: 20,
  boxShadow: "0 2px 16px var(--jb-card-shadow)",
  padding: "clamp(16px, 5vw, 24px)",
};

export function SafePlaceVisualization() {
  const [selectedScene, setSelectedScene] = useState<Scene>("beach");
  const [selectedSound, setSelectedSound] = useState<Sound>("waves");
  const [phase, setPhase] = useState<"setup" | "visualization">("setup");
  const [scriptIndex, setScriptIndex] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => {
    try { return JSON.parse(localStorage.getItem("justb_saved_places") || "[]"); } catch { return []; }
  });
  const [orbScale, setOrbScale] = useState(1);

  // Gentle orb animation
  useEffect(() => {
    if (phase !== "visualization") return;
    const id = setInterval(() => {
      setOrbScale(s => s === 1 ? 1.08 : 1);
    }, 2000);
    return () => clearInterval(id);
  }, [phase]);

  const startVisualization = () => { setPhase("visualization"); setScriptIndex(0); };

  const savePlace = () => {
    const newPlace: SavedPlace = {
      scene: selectedScene, sound: selectedSound,
      description: scenes[selectedScene].name,
      timestamp: new Date().toISOString(),
    };
    const saved = [...savedPlaces, newPlace];
    setSavedPlaces(saved);
    localStorage.setItem("justb_saved_places", JSON.stringify(saved));
    toast.success("safe place saved ✨");
  };

  // ── Setup ──
  if (phase === "setup") {
    return (
      <div style={{
        minHeight: "100%",
        background: "var(--jb-bg-grad)",
        padding: "clamp(16px, 5vw, 28px)",
        fontFamily: DM,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={card}>
          <h2 style={{ margin: "0 0 6px", fontFamily: DM, fontWeight: 600, fontSize: 18, color: "var(--jb-text-2)" }}>
            build your safe place
          </h2>
          <p style={{ margin: "0 0 20px", fontFamily: DM, fontWeight: 400, fontSize: 13, color: "var(--jb-text-3)", lineHeight: 1.6 }}>
            create a mental sanctuary to return to whenever you need calm.
          </p>

          {/* Scene selection */}
          <p style={{ fontFamily: DM, fontWeight: 500, fontSize: 12, color: "var(--jb-text-3)", marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            choose your setting
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {(Object.entries(scenes) as [Scene, typeof scenes[Scene]][]).map(([key, scene]) => (
              <button
                key={key}
                onClick={() => setSelectedScene(key)}
                style={{
                  background: selectedScene === key ? "var(--jb-pill-bg)" : "var(--jb-surface)",
                  border: `1.5px solid ${selectedScene === key ? "var(--jb-border-2)" : "var(--jb-border)"}`,
                  borderRadius: 16,
                  padding: "14px 12px",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.2s",
                  boxShadow: selectedScene === key ? "0 2px 12px var(--jb-card-shadow)" : "none",
                }}
              >
                <span style={{ fontSize: 28 }}>{scene.emoji}</span>
                <span style={{ fontFamily: DM, fontWeight: 500, fontSize: 12, color: selectedScene === key ? "var(--jb-accent-3)" : "var(--jb-text-3)" }}>
                  {scene.name}
                </span>
              </button>
            ))}
          </div>

          {/* Sound selection */}
          <p style={{ fontFamily: DM, fontWeight: 500, fontSize: 12, color: "var(--jb-text-3)", marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            add sounds
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {(Object.entries(sounds) as [Sound, typeof sounds[Sound]][]).map(([key, sound]) => (
              <button
                key={key}
                onClick={() => setSelectedSound(key)}
                style={{
                  background: selectedSound === key ? "var(--jb-pill-bg)" : "var(--jb-surface)",
                  border: `1.5px solid ${selectedSound === key ? "var(--jb-border-2)" : "var(--jb-border)"}`,
                  borderRadius: 100,
                  padding: "8px 14px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: DM, fontWeight: 400, fontSize: 12,
                  color: selectedSound === key ? "var(--jb-accent-3)" : "var(--jb-text-3)",
                  transition: "all 0.2s",
                }}
              >
                <span>{sound.emoji}</span>{sound.name}
              </button>
            ))}
          </div>

          {/* Preview pill */}
          <div style={{
            background: "var(--jb-pill-bg)",
            borderRadius: 16, padding: "14px 16px", marginBottom: 20,
            border: "1px solid var(--jb-border-2)",
          }}>
            <p style={{ fontFamily: DM, fontWeight: 500, fontSize: 13, color: "var(--jb-text-2)", margin: "0 0 4px" }}>
              {scenes[selectedScene].emoji} {scenes[selectedScene].name}
            </p>
            <p style={{ fontFamily: DM, fontWeight: 400, fontSize: 12, color: "var(--jb-text-3)", margin: "0 0 6px", lineHeight: 1.5 }}>
              {scenes[selectedScene].description}
            </p>
            <p style={{ fontFamily: DM, fontWeight: 400, fontSize: 12, color: "var(--jb-text-3)", margin: 0 }}>
              {sounds[selectedSound].emoji} {sounds[selectedSound].name}
            </p>
          </div>

          {/* Saved places */}
          {savedPlaces.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: DM, fontWeight: 500, fontSize: 12, color: "var(--jb-text-3)", marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                your saved places
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {savedPlaces.map((place, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedScene(place.scene); setSelectedSound(place.sound); toast.success(`loaded: ${place.description}`); }}
                    style={{
                      background: "var(--jb-surface)", border: "1.5px solid var(--jb-border-2)",
                      borderRadius: 100, padding: "7px 14px",
                      fontFamily: DM, fontSize: 12, color: "var(--jb-accent-3)",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    {scenes[place.scene].emoji} {place.description}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={startVisualization} style={{ ...gradBtn, width: "100%" }}>
            begin visualization <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── Visualization ──
  const sc = scenes[selectedScene];
  return (
    <div style={{
      minHeight: "100%",
      background: "var(--jb-bg-grad)",
      padding: "clamp(16px, 5vw, 28px)",
      fontFamily: DM,
      display: "flex", flexDirection: "column", gap: 16,
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient animated orbs */}
      <div style={{
        position: "absolute", top: -60, left: -60,
        width: 220, height: 220, borderRadius: "50%",
        background: `radial-gradient(circle, ${sc.orb1}55 0%, transparent 70%)`,
        transform: `scale(${orbScale})`,
        transition: "transform 2s ease-in-out",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, right: -40,
        width: 180, height: 180, borderRadius: "50%",
        background: `radial-gradient(circle, ${sc.orb2}44 0%, transparent 70%)`,
        transform: `scale(${orbScale === 1 ? 1.08 : 1})`,
        transition: "transform 2s ease-in-out",
        pointerEvents: "none",
      }} />

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
        <button
          onClick={() => setPhase("setup")}
          style={{ background: "var(--jb-surface)", border: "1.5px solid var(--jb-border-2)", borderRadius: 100, padding: "8px 14px", cursor: "pointer", fontFamily: DM, fontSize: 12, color: "var(--jb-text-icon)", display: "flex", alignItems: "center", gap: 5 }}
        >
          <ArrowLeft size={14} /> change scene
        </button>
        <button
          onClick={() => setIsSoundOn(v => !v)}
          style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--jb-surface)", border: "1.5px solid var(--jb-border-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--jb-text-icon)" }}
        >
          {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Scene label */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{sc.emoji}</div>
        <h2 style={{ margin: "0 0 6px", fontFamily: DM, fontWeight: 600, fontSize: 20, color: "var(--jb-text-2)" }}>
          {sc.name}
        </h2>
        <p style={{ margin: 0, fontFamily: DM, fontWeight: 400, fontSize: 13, color: "var(--jb-text-3)", lineHeight: 1.5 }}>
          {sc.description}
        </p>
      </div>

      {/* Guided script card */}
      <div style={{
        ...card,
        background: "var(--jb-surface-frosted)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "relative", zIndex: 1,
        textAlign: "center",
      } as React.CSSProperties}>
        <p style={{
          fontFamily: DM, fontWeight: 400, fontSize: "clamp(14px,4vw,16px)",
          color: "var(--jb-text-form)", lineHeight: 1.7,
          minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 0 20px",
          fontStyle: "italic",
        }}>
          "{guidedScript[scriptIndex]}"
        </p>

        {/* Dot progress */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
          {guidedScript.map((_, idx) => (
            <div key={idx} style={{
              height: 6, borderRadius: 100,
              width: idx === scriptIndex ? 24 : 6,
              background: idx === scriptIndex ? "#7c3aed" : idx < scriptIndex ? "#c4b5fd" : "rgba(139,92,246,0.2)",
              transition: "width 0.3s ease, background 0.3s",
            }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {scriptIndex < guidedScript.length - 1 ? (
            <button
              onClick={() => setScriptIndex(i => i + 1)}
              style={{ ...gradBtn, flex: 1 }}
            >
              next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => { setPhase("setup"); toast.success("visualization complete. peace be with you 🙏"); }}
              style={{ ...gradBtn, flex: 1, background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}
            >
              <Check size={16} /> complete
            </button>
          )}
          <button
            onClick={savePlace}
            style={{
              background: "var(--jb-surface)", border: "1.5px solid var(--jb-border-2)",
              borderRadius: 100, padding: "12px 16px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: DM, fontSize: 13, color: "var(--jb-text-icon)",
            }}
          >
            <Save size={15} />
          </button>
        </div>
      </div>

      {/* Sound indicator */}
      {isSoundOn && (
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <span style={{ fontFamily: DM, fontSize: 12, color: "var(--jb-text-3)" }}>
            {sounds[selectedSound].emoji} {sounds[selectedSound].name}
          </span>
        </div>
      )}
    </div>
  );
}