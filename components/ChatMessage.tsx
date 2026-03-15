import { ActionCard, ActionItem } from "./ActionCard";
import { RiskResponseCard, PostCrisisFollowUp, RiskLevel } from "./RiskResponseCard";
import { JustBLogo } from "./JustBLogo";
import { useState, useRef, useEffect } from "react";

// ─── Shared font style ────────────────────────────────────────────────────────
const font: React.CSSProperties = {
  fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
  WebkitFontSmoothing: "antialiased",
  textRendering: "optimizeLegibility",
};

// ─── Inline markdown renderer ─────────────────────────────────────────────────
const TOKEN_RE = /\*\*([^*]+)\*\*|(https?:\/\/[^\s)>\]]+)/g;
const URL_RE   = /https?:\/\/[^\s)>\]]+/g;

function isUrl(s: string) { return /^https?:\/\//.test(s); }

const LINK_CLASS = "italic underline text-blue-600 hover:text-blue-800 break-all inline max-w-full";

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      const inner = match[1];
      if (isUrl(inner)) {
        nodes.push(<strong key={match.index}><a href={inner} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>{inner}</a></strong>);
      } else if (URL_RE.test(inner)) {
        URL_RE.lastIndex = 0;
        nodes.push(<strong key={match.index}>{renderInline(inner)}</strong>);
      } else {
        nodes.push(<strong key={match.index}>{inner}</strong>);
      }
    } else if (match[2] !== undefined) {
      const url = match[2];
      const clean = url.replace(/[.,;:!?)]+$/, "");
      const trailing = url.slice(clean.length);
      nodes.push(<a key={match.index} href={clean} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>{clean}</a>);
      if (trailing) nodes.push(trailing);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function MarkdownMessage({ text, isEmergency }: { text: string; isEmergency: boolean }) {
  const lines = text.split("\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {lines.map((line, i) => {
        if (line.trim() === "") return <div key={i} style={{ height: 4 }} />;

        // 🚨 Emergency header
        if (line.startsWith("🚨")) {
          return (
            <p
              key={i}
              style={{
                ...font,
                fontWeight: 600,
                fontSize: "clamp(12px, 3.5vw, 13px)",
                color: "#dc2626",
                textTransform: "lowercase",
                letterSpacing: "0.01em",
                lineHeight: 1.4,
              }}
            >
              {renderInline(line)}
            </p>
          );
        }

        // Bullet lines
        if (/^\s*[-•]\s/.test(line)) {
          const content = line.replace(/^\s*[-•]\s/, "");
          return (
            <p key={i} style={{ display: "flex", gap: 8, lineHeight: 1.5 }}>
              <span style={{ marginTop: 6, flexShrink: 0, width: 5, height: 5, borderRadius: "50%", background: "currentColor", opacity: 0.45, display: "inline-block" }} />
              <span>{renderInline(content)}</span>
            </p>
          );
        }

        return (
          <p key={i} style={{ lineHeight: 1.55 }}>
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

// ─── Reaction constants ───────────────────────────────────────────────────────
const REACTIONS = ["💙", "🙏", "✨"];

// ─── Props ────────────────────────────────────────────────────────────────────
interface ChatMessageProps {
  id: string;
  message: string;
  isBot: boolean;
  timestamp: string;
  username?: string;
  displayName?: string;
  actions?: ActionItem[];
  riskLevel?: RiskLevel;
  isPostCrisis?: boolean;
  onAcceptAction?: (action: ActionItem, messageId: string) => void;
  onDeclineAction?: (action: ActionItem, messageId: string) => void;
  onRiskResponse?: (response: string) => void;
}

export function ChatMessage({
  id,
  message,
  isBot,
  timestamp,
  username,
  displayName,
  actions,
  riskLevel,
  isPostCrisis,
  onAcceptAction,
  onDeclineAction,
  onRiskResponse,
}: ChatMessageProps) {
  const userInitial = displayName ? displayName[0].toUpperCase() : username ? username[0].toUpperCase() : "U";
  const userName = displayName || username || "You";

  // Detect emergency message (contains 🚨 or riskLevel === "acute")
  const isEmergency = isBot && (message.includes("🚨") || riskLevel === "acute");

  // ── Reactions ──────────────────────────────────────────────────────────────
  const [myReaction, setMyReaction] = useState<string | null>(() => {
    try { return localStorage.getItem(`justb_r_${id}`); } catch { return null; }
  });
  const [showPicker, setShowPicker] = useState(false);
  const [isHoveringBubble, setIsHoveringBubble] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReact = (emoji: string) => {
    const key = `justb_r_${id}`;
    if (myReaction === emoji) {
      try { localStorage.removeItem(key); } catch {}
      setMyReaction(null);
    } else {
      try { localStorage.setItem(key, emoji); } catch {}
      setMyReaction(emoji);
      if (navigator.vibrate) navigator.vibrate([8]);
    }
    setShowPicker(false);
  };

  const onBubbleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowPicker(true);
      if (navigator.vibrate) navigator.vibrate([18]);
    }, 600);
  };
  const onBubbleTouchEnd = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return;
    const h = () => setShowPicker(false);
    document.addEventListener("pointerdown", h, { once: true });
    return () => document.removeEventListener("pointerdown", h);
  }, [showPicker]);

  // ── Bot bubble styles ──
  const botBubbleStyle: React.CSSProperties = isEmergency
    ? {
        background: "var(--jb-bubble-bot)",
        border: "1px solid rgba(220,50,50,0.18)",
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        padding: "clamp(10px, 3vw, 14px) clamp(12px, 3vw, 16px)",
        color: "#dc2626",
        boxShadow: "0 1px 8px rgba(220,50,50,0.07)",
      }
    : {
        background: "var(--jb-bubble-bot)",
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        padding: "clamp(10px, 3vw, 14px) clamp(12px, 3vw, 16px)",
        color: "var(--jb-bubble-bot-text)",
        boxShadow: "0 1px 8px var(--jb-bubble-shadow)",
      };

  // ── User bubble styles ──
  const userBubbleStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #8b6fd4, #6a4fc0)",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: "clamp(10px, 3vw, 14px) clamp(12px, 3vw, 16px)",
    color: "#fff",
    boxShadow: "0 2px 10px rgba(107,63,192,0.25)",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "clamp(8px, 2vw, 12px)",
        flexDirection: isBot ? "row" : "row-reverse",
        alignItems: "flex-end",
      }}
    >
      {/* Avatar */}
      {isBot ? (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--jb-pill-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <JustBLogo size={32} showText={false} />
        </div>
      ) : (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            ...font,
            fontWeight: 600,
            fontSize: 13,
            color: "#fff",
          }}
        >
          {userInitial}
        </div>
      )}

      {/* Bubble + cards column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isBot ? "flex-start" : "flex-end",
          maxWidth: "clamp(240px, 72%, 480px)",
          minWidth: 0,
        }}
      >
        {/* Sender name */}
        <span
          style={{
            ...font,
            fontWeight: 400,
            fontSize: "clamp(10px, 2.5vw, 11px)",
            color: "rgba(109,40,217,0.5)",
            marginBottom: 4,
            paddingInline: 4,
          }}
        >
          {isBot ? "JustB" : userName}
        </span>

        {/* ── Bubble wrapper with reaction support (bot only) ── */}
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => { if (isBot) setIsHoveringBubble(true); }}
          onMouseLeave={() => { setIsHoveringBubble(false); }}
          onTouchStart={isBot ? onBubbleTouchStart : undefined}
          onTouchEnd={isBot ? onBubbleTouchEnd : undefined}
          onTouchMove={isBot ? onBubbleTouchEnd : undefined}
        >
          {/* Reaction emoji picker — appears above bubble on hover/long-press */}
          {isBot && (isHoveringBubble || showPicker) && (
            <div
              onPointerDown={e => e.stopPropagation()}
              style={{
                position: "absolute",
                bottom: "calc(100% + 6px)",
                left: 0,
                display: "flex",
                gap: 2,
                background: "var(--jb-surface)",
                border: "1px solid var(--jb-border-2)",
                borderRadius: 100,
                padding: "4px 6px",
                boxShadow: "0 4px 16px rgba(109,40,217,0.14)",
                zIndex: 10,
                animation: "reactionPopIn 0.18s cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              <style>{`
                @keyframes reactionPopIn {
                  from { opacity:0; transform: scale(0.8) translateY(4px); }
                  to   { opacity:1; transform: scale(1) translateY(0); }
                }
              `}</style>
              {REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  style={{
                    background: myReaction === emoji ? "rgba(139,92,246,0.15)" : "transparent",
                    border: myReaction === emoji ? "1.5px solid rgba(139,92,246,0.3)" : "1.5px solid transparent",
                    cursor: "pointer",
                    borderRadius: "50%",
                    width: 34, height: 34,
                    fontSize: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "transform 0.15s cubic-bezier(.34,1.56,.64,1), background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.35)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message bubble */}
          <div style={{ ...isBot ? botBubbleStyle : userBubbleStyle, ...font, fontWeight: 400, fontSize: "clamp(13px, 3.5vw, 14px)", maxWidth: "100%", wordBreak: "break-word" }}>
            {isBot ? <MarkdownMessage text={message} isEmergency={isEmergency} /> : <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{message}</p>}
          </div>

          {/* Reaction badge — floats on bottom-right of bubble if reacted */}
          {isBot && myReaction && (
            <button
              onClick={() => handleReact(myReaction)}
              title="Remove reaction"
              style={{
                position: "absolute",
                bottom: -10,
                right: 6,
                background: "var(--jb-surface)",
                border: "1px solid var(--jb-border-2)",
                borderRadius: 100,
                padding: "1px 7px 1px 5px",
                fontSize: 13,
                boxShadow: "0 1px 6px rgba(109,40,217,0.12)",
                cursor: "pointer",
                zIndex: 1,
                display: "flex", alignItems: "center", gap: 2,
                fontFamily: font.fontFamily,
                transition: "transform 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              {myReaction}
            </button>
          )}
        </div>

        {/* Risk response card */}
        {isBot && riskLevel && (
          <div style={{ marginTop: 10, width: "100%" }}>
            <RiskResponseCard
              level={riskLevel}
              onTryExercise={() => onRiskResponse?.("exercise")}
              onTalkMore={() => onRiskResponse?.("talk")}
              onCall={(number) => onRiskResponse?.(`call:${number}`)}
              onAcknowledge={() => onRiskResponse?.("acknowledged")}
            />
          </div>
        )}

        {/* Post-crisis follow-up */}
        {isBot && isPostCrisis && (
          <div style={{ marginTop: 10, width: "100%" }}>
            <PostCrisisFollowUp
              userName={userName}
              savedStrategies={["Box Breathing", "5-4-3-2-1 Grounding", "Gratitude Journaling"]}
              onResponse={(r) => onRiskResponse?.(r)}
            />
          </div>
        )}

        {/* Action cards */}
        {isBot && actions && actions.length > 0 && onAcceptAction && onDeclineAction && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            {actions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onAccept={() => onAcceptAction(action, id)}
                onDecline={() => onDeclineAction(action, id)}
              />
            ))}
          </div>
        )}

        {/* Timestamp — sits below everything */}
        <span style={{
          ...font, fontSize: 10, fontWeight: 400,
          color: "var(--jb-text-3)",
          marginTop: myReaction ? 16 : 5,
          paddingInline: 4,
          transition: "margin-top 0.2s",
        }}>
          {timestamp}
        </span>
      </div>
    </div>
  );
}