import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";

const AFFIRMATIONS = [
  "you are doing better than you think ✦",
  "one breath at a time is enough",
  "your feelings are valid, always",
  "rest is not a reward — it's a right",
  "you don't have to have it all figured out",
  "small steps still move you forward",
  "it's okay to ask for help",
  "you are worthy of care and kindness",
  "this moment is temporary — you will get through it",
  "being gentle with yourself is a form of strength",
  "your presence matters more than your productivity",
  "healing isn't linear, and that's okay",
  "you've survived every hard day so far",
  "it's brave to feel things deeply",
  "you are not behind — you are exactly where you need to be",
  "taking care of you is never selfish",
  "even on hard days, you are enough",
  "your worth isn't measured by how much you do",
  "it's okay to say no and protect your energy",
  "you deserve the same compassion you give to others",
  "growth often happens in the quiet moments",
  "today, just being here is enough",
  "you are allowed to change your mind",
  "your story isn't over — keep going",
  "difficult roads often lead to beautiful destinations",
  "the courage to begin is the hardest part",
  "you matter more than you know",
  "kindness starts with how you speak to yourself",
  "every day is a new chance to begin again",
  "progress, not perfection",
  "your sensitivity is a superpower",
  "it's okay to not be okay sometimes",
  "you are braver than you believe",
  "take it one moment at a time — you've got this",
  "you are allowed to rest",
  "even small wins deserve celebration",
  "your mind deserves peace as much as your body",
  "asking for support is a sign of wisdom",
  "you belong here",
  "today's struggles are tomorrow's strengths",
];

const getDayOfYear = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
};

const DM = "'DM Sans', system-ui, sans-serif";

export function DailyAffirmation() {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("justb_affirmation_dismissed");
    const today = new Date().toDateString();
    if (stored === today) {
      setDismissed(true);
      setVisible(false);
    } else {
      setDismissed(false);
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    // Wait for fade out then fully remove
    setTimeout(() => {
      localStorage.setItem("justb_affirmation_dismissed", new Date().toDateString());
      setDismissed(true);
    }, 250);
  };

  if (dismissed) return null;

  const affirmation = AFFIRMATIONS[getDayOfYear() % AFFIRMATIONS.length];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px 7px 14px",
        background: "linear-gradient(90deg, rgba(139,92,246,0.07) 0%, rgba(109,40,217,0.03) 100%)",
        borderBottom: "1px solid var(--jb-border)",
        flexShrink: 0,
        opacity: visible ? 1 : 0,
        maxHeight: visible ? 48 : 0,
        overflow: "hidden",
        transition: "opacity 0.25s ease, max-height 0.3s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <Sparkles style={{ width: 12, height: 12, color: "#a78bfa", flexShrink: 0 }} />
      <p style={{
        margin: 0,
        fontFamily: DM, fontWeight: 400, fontSize: 11.5,
        color: "var(--jb-text-icon)",
        fontStyle: "italic",
        flex: 1,
        letterSpacing: "0.01em",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {affirmation}
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss affirmation"
        style={{
          background: "transparent", border: "none",
          padding: "3px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, borderRadius: 4, opacity: 0.45,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.45")}
      >
        <X style={{ width: 10, height: 10, color: "var(--jb-text-3)" }} />
      </button>
    </div>
  );
}
