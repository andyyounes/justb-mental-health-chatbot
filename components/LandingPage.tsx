import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LandingLogo } from "./JustBLogo";

interface LandingPageProps {
  onEnter: () => void;
}

function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: "clamp(260px, 65vw, 560px)",
          height: "clamp(260px, 65vw, 560px)",
          background:
            "radial-gradient(circle, rgba(192,132,252,0.35) 0%, rgba(167,139,250,0.18) 55%, transparent 100%)",
          top: "-18%",
          left: "-12%",
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: "clamp(220px, 55vw, 480px)",
          height: "clamp(220px, 55vw, 480px)",
          background:
            "radial-gradient(circle, rgba(216,180,254,0.3) 0%, rgba(196,181,253,0.15) 55%, transparent 100%)",
          bottom: "-12%",
          right: "-12%",
        }}
        animate={{ x: [0, -30, 20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: "clamp(140px, 38vw, 320px)",
          height: "clamp(140px, 38vw, 320px)",
          background:
            "radial-gradient(circle, rgba(232,121,249,0.18) 0%, rgba(168,85,247,0.1) 60%, transparent 100%)",
          top: "38%",
          left: "52%",
        }}
        animate={{ x: [0, 50, -30, 0], y: [0, -40, 20, 0], scale: [1, 0.9, 1.12, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 7 }}
      />
    </div>
  );
}

interface GlowOrbProps {
  size: number;
}

function GlowOrb({ size }: GlowOrbProps) {
  const core = size * 0.47;
  const mid = size * 0.73;
  const highlight = size * 0.18;
  const particles = [
    { sz: Math.max(4, size * 0.028), cx: "14%", cy: "18%", delay: 0 },
    { sz: Math.max(3, size * 0.024), cx: "78%", cy: "14%", delay: 1.2 },
    { sz: Math.max(3, size * 0.02),  cx: "83%", cy: "74%", delay: 2.4 },
    { sz: Math.max(4, size * 0.028), cx: "10%", cy: "76%", delay: 0.8 },
    { sz: Math.max(3, size * 0.02),  cx: "50%", cy: "4%",  delay: 1.8 },
  ];

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Outer halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0.25, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Mid glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: mid,
          height: mid,
          background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.28, 1], opacity: [0.8, 0.35, 0.8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      {/* Core orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: core,
          height: core,
          background: "radial-gradient(circle at 33% 33%, #ddd6fe, #8b5cf6 45%, #5b21b6 100%)",
          boxShadow:
            "0 0 32px 8px rgba(109,40,217,0.38), 0 0 64px 16px rgba(139,92,246,0.2), 0 8px 24px rgba(109,40,217,0.25)",
        }}
        animate={{
          scale: [1, 1.07, 1],
          boxShadow: [
            "0 0 32px 8px rgba(109,40,217,0.38), 0 0 64px 16px rgba(139,92,246,0.2), 0 8px 24px rgba(109,40,217,0.25)",
            "0 0 48px 16px rgba(109,40,217,0.55), 0 0 90px 28px rgba(139,92,246,0.3), 0 8px 32px rgba(109,40,217,0.35)",
            "0 0 32px 8px rgba(109,40,217,0.38), 0 0 64px 16px rgba(139,92,246,0.2), 0 8px 24px rgba(109,40,217,0.25)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Specular highlight */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: highlight,
          height: highlight,
          background: "radial-gradient(circle, rgba(255,255,255,0.75) 0%, transparent 70%)",
          top: "25%",
          left: "27%",
        }}
        animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.18, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.sz,
            height: p.sz,
            left: p.cx,
            top: p.cy,
            background: "rgba(139,92,246,0.65)",
          }}
          animate={{ y: [0, -12, 0], opacity: [0.35, 0.9, 0.35], scale: [1, 1.35, 1] }}
          transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  );
}

function BreatheRing() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const labels: Record<typeof phase, string> = {
    inhale: "breathe in",
    hold: "hold",
    exhale: "breathe out",
  };
  const durations = { inhale: 4000, hold: 2000, exhale: 4000 };

  useEffect(() => {
    let active = true;
    const sequence = async () => {
      while (active) {
        setPhase("inhale");
        await new Promise((r) => setTimeout(r, durations.inhale));
        if (!active) break;
        setPhase("hold");
        await new Promise((r) => setTimeout(r, durations.hold));
        if (!active) break;
        setPhase("exhale");
        await new Promise((r) => setTimeout(r, durations.exhale));
      }
    };
    sequence();
    return () => { active = false; };
  }, []);

  const dur = (p: typeof phase) => (p === "hold" ? 0.15 : 4);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
        <motion.div
          className="absolute rounded-full"
          style={{ border: "1.5px solid rgba(139,92,246,0.4)" }}
          animate={{
            width: phase === "exhale" ? 38 : 64,
            height: phase === "exhale" ? 38 : 64,
            opacity: phase === "hold" ? 1 : 0.65,
          }}
          transition={{ duration: dur(phase), ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ background: "rgba(139,92,246,0.12)" }}
          animate={{
            width: phase === "exhale" ? 26 : 48,
            height: phase === "exhale" ? 26 : 48,
          }}
          transition={{ duration: dur(phase), ease: "easeInOut" }}
        />
        <motion.div
          className="rounded-full"
          style={{ width: 10, height: 10, background: "rgba(109,40,217,0.7)" }}
          animate={{ scale: phase === "inhale" ? 1.25 : phase === "exhale" ? 0.7 : 1 }}
          transition={{ duration: dur(phase), ease: "easeInOut" }}
        />
      </div>
      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
          WebkitFontSmoothing: "antialiased",
          textRendering: "optimizeLegibility",
          fontWeight: 300,
          color: "rgba(109,40,217,0.65)",
          letterSpacing: "0.18em",
          fontSize: "clamp(9px, 2.2vw, 11px)",
        }}
        className="uppercase"
      >
        {labels[phase]}
      </motion.p>
    </div>
  );
}

const fontStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  textRendering: "optimizeLegibility",
};

export function LandingPage({ onEnter }: LandingPageProps) {
  const [showCTA, setShowCTA] = useState(false);
  // Fluid logo size
  const [logoSize, setLogoSize] = useState(200);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,500;0,9..40,600;1,9..40,300&family=Black+Ops+One&display=swap";
    document.head.appendChild(link);

    const updateSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const base = Math.min(w * 0.54, h * 0.32);
      setLogoSize(Math.max(150, Math.min(240, base)));
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    const t = setTimeout(() => setShowCTA(true), 5000);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div
      className="w-full flex flex-col overflow-hidden relative select-none"
      style={{
        minHeight: "100dvh",
        background: "var(--jb-bg-grad)",
        ...fontStyle,
      }}
    >
      <AuroraBackground />

      {/* Skip */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={onEnter}
        style={{
          ...fontStyle,
          fontWeight: 300,
          fontSize: "clamp(12px, 3.5vw, 14px)",
          color: "var(--jb-text-icon)",
          letterSpacing: "0.06em",
        }}
        className="absolute top-4 right-4 z-30 hover:opacity-70 transition-opacity px-1 py-1"
      >
        skip
      </motion.button>

      {/* Scrollable inner */}
      <div
        className="relative z-10 flex flex-col items-center w-full"
        style={{
          minHeight: "100dvh",
          padding: "clamp(48px, 8vh, 80px) clamp(20px, 6vw, 32px) clamp(24px, 5vh, 48px)",
          gap: "clamp(10px, 2.5vh, 28px)",
          justifyContent: "space-between",
        }}
      >
        {/* ── Animated planet logo ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.72, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="flex flex-col items-center flex-shrink-0"
          style={{ gap: "clamp(8px, 2vh, 16px)" }}
        >
          <LandingLogo size={logoSize} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.9 }}
            style={{
              ...fontStyle,
              fontWeight: 300,
              fontStyle: "italic",
              color: "var(--jb-text-icon)",
              opacity: 0.78,
              letterSpacing: "0.12em",
              fontSize: "clamp(11px, 3vw, 14px)",
              marginTop: 2,
            }}
          >
            no filters. just you.
          </motion.p>
        </motion.div>

        {/* ── Bottom block ── */}
        <div
          className="flex flex-col items-center w-full flex-shrink-0"
          style={{ maxWidth: 320, gap: "clamp(10px, 2.5vh, 20px)" }}
        >
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}>
            <BreatheRing />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="w-8 h-px"
            style={{ background: "var(--jb-border-2)" }}
          />

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            style={{
              ...fontStyle,
              fontWeight: 300,
              color: "var(--jb-text-3)",
              letterSpacing: "0.16em",
              fontSize: "clamp(9px, 2.5vw, 11px)",
              textAlign: "center",
            }}
            className="uppercase"
          >
            enter your wellness space
          </motion.p>

          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: showCTA ? 1 : 0, y: showCTA ? 0 : 12 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <button
              onClick={onEnter}
              style={{
                ...fontStyle,
                fontWeight: 500,
                letterSpacing: "0.12em",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                boxShadow: "0 4px 24px rgba(109,40,217,0.28), 0 1px 0 rgba(255,255,255,0.12) inset",
                border: "none",
                color: "#fff",
                width: "100%",
                padding: "clamp(12px, 3.5vw, 16px) 0",
                borderRadius: 16,
                fontSize: "clamp(13px, 3.5vw, 15px)",
                cursor: "pointer",
                transition: "opacity 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              I'm ready
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            style={{
              ...fontStyle,
              fontWeight: 300,
              color: "var(--jb-text-3)",
              letterSpacing: "0.07em",
              fontSize: "clamp(10px, 2.8vw, 12px)",
              textAlign: "center",
              paddingBottom: "clamp(4px, 1.5vh, 8px)",
            }}
          >
            anonymous · private · judgment-free
          </motion.p>
        </div>
      </div>
    </div>
  );
}