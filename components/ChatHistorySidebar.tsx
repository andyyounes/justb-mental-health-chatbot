import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, Plus, Sparkles, CalendarDays, LogOut,
  Trash2, Pencil, AlertTriangle,
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { LogoWidget } from "./JustBLogo";

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  hasCrisis?: boolean;
}

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onClose: () => void;
  isOpen: boolean;
  onNavigateActivities?: () => void;
  onNavigateSchedule?: () => void;
  onLogout?: () => void;
  displayName?: string;
  accessToken?: string | null;
  onSessionDeleted?: (sessionId: string) => void;
  onSessionRenamed?: (sessionId: string, newTitle: string) => void;
  isLoading?: boolean;
}

const DM = "'DM Sans', system-ui, sans-serif";
const API = `https://${projectId}.supabase.co/functions/v1/make-server-97cb3ddd`;

// ─── Rename Modal ─────────────────────────────────────────────────────────────
function RenameModal({
  session, onConfirm, onCancel,
}: {
  session: ChatSession;
  onConfirm: (t: string) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState(session.title || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => inputRef.current?.select());
    return () => cancelAnimationFrame(raf);
  }, []);

  const save = () => { const t = val.trim(); if (t) onConfirm(t); };

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(20,8,50,0.55)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 380, background: "var(--jb-surface)",
          borderRadius: 20, padding: "28px 24px 22px",
          boxShadow: "0 24px 64px rgba(109,40,217,0.22), 0 4px 16px rgba(0,0,0,0.1)",
          display: "flex", flexDirection: "column", gap: 20,
          animation: "popIn 0.22s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <div>
          <p style={{ margin: "0 0 4px", fontFamily: DM, fontWeight: 700, fontSize: 17, color: "var(--jb-text-1)" }}>
            rename chat
          </p>
          <p style={{ margin: 0, fontFamily: DM, fontWeight: 400, fontSize: 12, color: "var(--jb-text-3)" }}>
            enter a new name for this conversation
          </p>
        </div>
        <input
          ref={inputRef}
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value.slice(0, 60))}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") onCancel(); }}
          placeholder="chat name…"
          enterKeyHint="done"
          style={{
            width: "100%", fontFamily: DM, fontWeight: 500, fontSize: 15,
            color: "var(--jb-text-form)", background: "var(--jb-pill-bg)",
            border: "2px solid #8b5cf6", borderRadius: 10,
            padding: "11px 14px", outline: "none", boxSizing: "border-box",
            caretColor: "#8b5cf6", boxShadow: "0 0 0 3px rgba(139,92,246,0.12)",
          }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{ padding: "10px 22px", borderRadius: 100, border: "1.5px solid var(--jb-border-2)", background: "var(--jb-surface)", fontFamily: DM, fontWeight: 500, fontSize: 14, color: "var(--jb-accent-3)", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--jb-pill-bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--jb-surface)")}
          >
            cancel
          </button>
          <button
            onClick={save}
            disabled={!val.trim()}
            style={{
              padding: "10px 24px", borderRadius: 100, border: "none",
              background: val.trim() ? "linear-gradient(135deg,#8b6fd4,#6a4fc0)" : "rgba(139,92,246,0.2)",
              fontFamily: DM, fontWeight: 600, fontSize: 14,
              color: val.trim() ? "#fff" : "rgba(139,92,246,0.4)",
              cursor: val.trim() ? "pointer" : "not-allowed",
              boxShadow: val.trim() ? "0 4px 14px rgba(109,40,217,0.3)" : "none",
              transition: "all 0.18s",
            }}
          >
            save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteModal({
  session, onConfirm, onCancel,
}: {
  session: ChatSession;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const label = session.title || `Chat · ${session.timestamp}`;
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(20,8,50,0.55)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--jb-surface)", borderRadius: 20,
          padding: "28px 24px 22px", maxWidth: 310, width: "100%",
          boxShadow: "0 24px 64px rgba(109,40,217,0.22)",
          display: "flex", flexDirection: "column", gap: 18,
          animation: "popIn 0.22s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle style={{ width: 24, height: 24, color: "#ef4444" }} />
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: "0 0 6px", fontFamily: DM, fontWeight: 700, fontSize: 16, color: "var(--jb-text-1)" }}>
            delete this chat?
          </p>
          <p style={{ margin: "0 0 6px", fontFamily: DM, fontSize: 13, color: "var(--jb-text-3)", lineHeight: 1.5 }}>
            "<span style={{ fontStyle: "italic", color: "var(--jb-accent-3)" }}>{label}</span>" will be permanently removed.
          </p>
          <p style={{ margin: 0, fontFamily: DM, fontWeight: 500, fontSize: 11, color: "#ef4444" }}>
            this can't be undone.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: "12px 0", borderRadius: 100, border: "1.5px solid var(--jb-border-2)", background: "var(--jb-surface)", cursor: "pointer", fontFamily: DM, fontWeight: 500, fontSize: 13, color: "var(--jb-accent-3)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--jb-pill-bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--jb-surface)")}
          >
            cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: "12px 0", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", cursor: "pointer", fontFamily: DM, fontWeight: 600, fontSize: 13, color: "#fff", boxShadow: "0 4px 14px rgba(220,38,38,0.3)" }}
          >
            delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row shared card content ──────────────────────────────────────────────────
function RowCard({
  session, isActive, isDeleting, pressing,
}: {
  session: ChatSession;
  isActive: boolean;
  isDeleting: boolean;
  pressing?: boolean;
}) {
  const label = session.title || `Chat · ${session.timestamp}`;
  return (
    <>
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        background: isDeleting ? "#fca5a5" : isActive ? "var(--jb-pill-bg)" : "var(--jb-border)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        transition: "background 0.18s", position: "relative",
      }}>
        <MessageCircle style={{ width: 15, height: 15, color: isDeleting ? "#dc2626" : isActive ? "var(--jb-accent)" : "var(--jb-text-3)" }} />
        {/* Crisis 💙 badge */}
        {session.hasCrisis && !isDeleting && (
          <span style={{
            position: "absolute", bottom: -2, right: -2,
            fontSize: 10, lineHeight: 1,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
          }}>💙</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontFamily: DM, fontWeight: isActive ? 600 : 500, fontSize: 13,
          color: isDeleting ? "#dc2626" : isActive ? "var(--jb-text-2)" : "var(--jb-text-icon)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{label}</p>
        {session.messageCount > 0 && (
          <span style={{
            fontSize: 10, color: isDeleting ? "#ef4444" : "var(--jb-pill-text)",
            background: isDeleting ? "#fee2e2" : "var(--jb-pill-bg)",
            borderRadius: 100, padding: "1px 6px",
            display: "inline-block", marginTop: 2,
          }}>
            {session.messageCount} msg{session.messageCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {isActive && !isDeleting && (
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: pressing ? "var(--jb-accent-3)" : "var(--jb-accent)", flexShrink: 0, transition: "background 0.2s" }} />
      )}
    </>
  );
}

// ─── Mobile row — long press (2 s) shows a mini context popup ─────────────────
function MobileRow({
  session, isActive, isDeleting, onClick, onDelete, onRename,
}: {
  session: ChatSession;
  isActive: boolean;
  isDeleting: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [menuY, setMenuY] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const LONG_MS = 2000;

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setPressing(false);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startPos.current = { x: t.clientX, y: t.clientY };
    movedRef.current = false;
    setPressing(true);
    timerRef.current = setTimeout(() => {
      if (!movedRef.current) {
        setMenuY(startPos.current.y);
        setShowMenu(true);
        if (navigator.vibrate) navigator.vibrate(30);
      }
      setPressing(false);
    }, LONG_MS);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - startPos.current.x);
    const dy = Math.abs(t.clientY - startPos.current.y);
    if (dx > 8 || dy > 8) { movedRef.current = true; clearTimer(); }
  };

  const onTouchEnd = () => {
    const wasQuickTap = timerRef.current !== null;
    clearTimer();
    if (wasQuickTap && !showMenu) onClick();
  };

  const closeMenu = () => setShowMenu(false);

  // Position popup above the press point, clamped to screen
  const POPUP_H = 100;
  const POPUP_W = 164;
  const popTop = Math.max(8, Math.min(menuY - POPUP_H - 10, window.innerHeight - POPUP_H - 8));
  const popLeft = Math.max(12, Math.min(window.innerWidth / 2 - POPUP_W / 2, window.innerWidth - POPUP_W - 12));

  return (
    <>
      {/* Dimmer — tap outside to close */}
      {showMenu && (
        <div
          onTouchEnd={e => { e.stopPropagation(); closeMenu(); }}
          onClick={closeMenu}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(30,10,60,0.2)",
            backdropFilter: "blur(1.5px)", WebkitBackdropFilter: "blur(1.5px)",
          }}
        />
      )}

      {/* Mini context popup */}
      {showMenu && (
        <div
          style={{
            position: "fixed", top: popTop, left: popLeft, width: POPUP_W, zIndex: 310,
            background: "var(--jb-surface)", borderRadius: 16,
            boxShadow: "0 12px 40px rgba(109,40,217,0.22), 0 2px 10px rgba(0,0,0,0.1)",
            border: "1px solid var(--jb-border-2)",
            overflow: "hidden",
            animation: "popIn 0.18s cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          {/* Rename option */}
          <button
            onTouchEnd={e => { e.stopPropagation(); closeMenu(); onRename(); }}
            onClick={e => { e.stopPropagation(); closeMenu(); onRename(); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "13px 15px", background: "transparent", border: "none",
              cursor: "pointer", fontFamily: DM, fontSize: 13, fontWeight: 500,
              color: "var(--jb-accent-3)", borderBottom: "1px solid var(--jb-border)",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--jb-pill-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Pencil style={{ width: 13, height: 13, color: "#7c3aed" }} />
            </div>
            rename
          </button>
          {/* Delete option */}
          <button
            onTouchEnd={e => { e.stopPropagation(); closeMenu(); onDelete(); }}
            onClick={e => { e.stopPropagation(); closeMenu(); onDelete(); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "13px 15px", background: "transparent", border: "none",
              cursor: "pointer", fontFamily: DM, fontSize: 13, fontWeight: 500,
              color: "#dc2626",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Trash2 style={{ width: 13, height: 13, color: "#ef4444" }} />
            </div>
            delete
          </button>
        </div>
      )}

      {/* The row card */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: "relative", borderRadius: 14, marginBottom: 2,
          userSelect: "none", WebkitUserSelect: "none",
          display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
          background: isDeleting
            ? "rgba(254,202,202,0.8)"
            : showMenu
            ? "var(--jb-pill-bg)"
            : isActive
            ? "var(--jb-surface)"
            : "transparent",
          border: showMenu
            ? "1px solid var(--jb-border-2)"
            : isActive
            ? "1px solid var(--jb-border-2)"
            : "1px solid transparent",
          // Scale down slightly while holding — tactile press feel
          transform: pressing ? "scale(0.968)" : "scale(1)",
          transition: pressing
            ? "transform 0.12s ease, box-shadow 0.12s ease"
            : "transform 0.22s cubic-bezier(.4,0,.2,1), background 0.18s, border 0.18s, box-shadow 0.22s",
          boxShadow: pressing
            ? "0 0 0 2.5px rgba(139,92,246,0.4), 0 4px 16px rgba(109,40,217,0.12)"
            : isActive
            ? "0 1px 8px var(--jb-card-shadow)"
            : "none",
          animation: isDeleting ? "deletePulse 0.55s ease-in-out infinite alternate" : "none",
          cursor: "pointer",
        }}
      >
        <RowCard session={session} isActive={isActive} isDeleting={isDeleting} pressing={pressing} />
      </div>
    </>
  );
}

// ─── Desktop row — three dots on hover only ───────────────────────────────────
function DesktopRow({
  session, isActive, isDeleting, onClick, onDelete, onRename,
}: {
  session: ChatSession;
  isActive: boolean;
  isDeleting: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setHovered(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  const showDots = (hovered || menuOpen) && !isDeleting;

  return (
    <div
      style={{ position: "relative", marginBottom: 2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { if (!menuOpen) setHovered(false); }}
    >
      <button
        onClick={onClick}
        style={{
          width: "100%",
          background: isDeleting ? "rgba(254,202,202,0.85)" : isActive ? "var(--jb-surface)" : hovered ? "var(--jb-border)" : "transparent",
          border: isActive ? "1px solid var(--jb-border-2)" : isDeleting ? "1px solid rgba(220,38,38,0.25)" : "1px solid transparent",
          borderRadius: 14, padding: "11px 42px 11px 12px",
          cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: 12,
          boxShadow: isActive ? "0 1px 8px var(--jb-card-shadow)" : "none",
          transition: "background 0.18s, border 0.18s",
          animation: isDeleting ? "deletePulse 0.55s ease-in-out infinite alternate" : "none",
        }}
      >
        <RowCard session={session} isActive={isActive} isDeleting={isDeleting} />
      </button>

      {/* ··· button */}
      <div
        ref={menuRef}
        style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          opacity: showDots ? 1 : 0,
          pointerEvents: showDots ? "auto" : "none",
          transition: "opacity 0.15s",
          zIndex: 10,
        }}
      >
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: menuOpen ? "rgba(139,92,246,0.15)" : "rgba(237,232,255,0.95)",
            border: menuOpen ? "1px solid rgba(139,92,246,0.25)" : "1px solid transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.18)")}
          onMouseLeave={e => (e.currentTarget.style.background = menuOpen ? "rgba(139,92,246,0.15)" : "rgba(237,232,255,0.95)")}
          aria-label="Chat options"
        >
          <span style={{ fontFamily: DM, fontSize: 15, fontWeight: 700, color: "#7c3aed", lineHeight: 1, letterSpacing: "0.05em", userSelect: "none" }}>
            ···
          </span>
        </button>

        {menuOpen && (
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 5px)", zIndex: 200,
            background: "var(--jb-surface)", borderRadius: 14,
            boxShadow: "0 8px 32px rgba(109,40,217,0.18), 0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid var(--jb-border-2)",
            overflow: "hidden", minWidth: 152,
            animation: "dropIn 0.14s cubic-bezier(.4,0,.2,1)",
          }}>
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(false); setHovered(false); onRename(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", fontFamily: DM, fontSize: 12, fontWeight: 500, color: "var(--jb-accent-3)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--jb-pill-bg)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Pencil style={{ width: 12, height: 12, color: "#8b5cf6", flexShrink: 0 }} />
              rename
            </button>
            <div style={{ height: 1, background: "var(--jb-border)", margin: "0 10px" }} />
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(false); setHovered(false); onDelete(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", fontFamily: DM, fontSize: 12, fontWeight: 500, color: "#dc2626" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Trash2 style={{ width: 12, height: 12, color: "#ef4444", flexShrink: 0 }} />
              delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SessionSkeleton({ index }: { index: number }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px", borderRadius: 14, marginBottom: 2,
      opacity: 1 - index * 0.18,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        background: "var(--jb-border)", flexShrink: 0,
        animation: "skeletonPulse 1.4s ease-in-out infinite",
        animationDelay: `${index * 0.12}s`,
      }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{
          height: 11, borderRadius: 6,
          background: "var(--jb-border)", width: `${65 + (index % 3) * 10}%`,
          animation: "skeletonPulse 1.4s ease-in-out infinite",
          animationDelay: `${index * 0.12 + 0.1}s`,
        }} />
        <div style={{
          height: 9, borderRadius: 5,
          background: "var(--jb-border)", width: "38%",
          animation: "skeletonPulse 1.4s ease-in-out infinite",
          animationDelay: `${index * 0.12 + 0.2}s`,
        }} />
      </div>
    </div>
  );
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────
export function ChatHistorySidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onClose,
  isOpen,
  onNavigateActivities,
  onNavigateSchedule,
  onLogout,
  displayName,
  accessToken,
  onSessionDeleted,
  onSessionRenamed,
  isLoading,
}: ChatHistorySidebarProps) {
  const panelW = "clamp(260px, 80vw, 300px)";

  // Reliable mouse vs touch detection via CSS media query
  const [isMouseDevice, setIsMouseDevice] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsMouseDevice(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMouseDevice(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const [pendingDelete, setPendingDelete] = useState<ChatSession | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingSession, setRenamingSession] = useState<ChatSession | null>(null);

  // ── Delete ──
  const doDelete = async (session: ChatSession) => {
    setPendingDelete(null);
    setDeletingId(session.id);
    try {
      const res = await fetch(`${API}/chat/sessions/${session.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken || publicAnonKey}` },
      });
      if (!res.ok) console.log("Delete error:", await res.text());
    } catch (e) {
      console.log("Delete network error:", e);
    }
    await new Promise(r => setTimeout(r, 650));
    setDeletingId(null);
    onSessionDeleted?.(session.id);
  };

  // ── Rename ──
  const doRename = async (sessionId: string, newTitle: string) => {
    setRenamingSession(null);
    onSessionRenamed?.(sessionId, newTitle); // optimistic
    try {
      const res = await fetch(`${API}/chat/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken || publicAnonKey}` },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) console.log("Rename error:", await res.text());
    } catch (e) {
      console.log("Rename network error:", e);
    }
  };

  const keyframes = `
    @keyframes deletePulse {
      from { background-color: rgba(254,202,202,0.7); }
      to   { background-color: rgba(248,113,113,0.35); }
    }
    @keyframes popIn {
      from { transform: scale(0.92) translateY(8px); opacity: 0; }
      to   { transform: scale(1)    translateY(0);   opacity: 1; }
    }
    @keyframes dropIn {
      from { transform: translateY(-6px) scale(0.97); opacity: 0; }
      to   { transform: translateY(0)    scale(1);    opacity: 1; }
    }
    @keyframes skeletonPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.45; }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>

      {renamingSession && (
        <RenameModal
          session={renamingSession}
          onConfirm={t => doRename(renamingSession.id, t)}
          onCancel={() => setRenamingSession(null)}
        />
      )}

      {pendingDelete && (
        <DeleteModal
          session={pendingDelete}
          onConfirm={() => doDelete(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(50,20,90,0.28)",
          backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
          zIndex: 80,
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, left: 0,
        height: "100dvh", width: panelW,
        background: "var(--jb-bg)", zIndex: 90,
        display: "flex", flexDirection: "column",
        overflow: "hidden", fontFamily: DM,
        boxShadow: isOpen ? "4px 0 32px rgba(109,40,217,0.18)" : "none",
        transform: isOpen ? "translateX(0)" : "translateX(-105%)",
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "max(env(safe-area-inset-top),59px) 16px 14px 64px", borderBottom: "1px solid var(--jb-border)", flexShrink: 0 }}>
          <LogoWidget size={30} />
          <span style={{ fontFamily: "'Black Ops One', 'DM Sans', system-ui, sans-serif", fontWeight: 400, fontSize: 13, color: "var(--jb-text-2)", letterSpacing: "0.2em" }}>JUSTB</span>
        </div>

        {/* New Chat */}
        <div style={{ padding: "14px 14px 10px", flexShrink: 0 }}>
          <button
            onClick={onNewChat}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#8b6fd4,#6a4fc0)", border: "none", borderRadius: 100, padding: "11px 20px", fontFamily: DM, fontWeight: 600, fontSize: 13, color: "#fff", cursor: "pointer", boxShadow: "0 4px 14px rgba(109,40,217,0.28)", transition: "opacity 0.15s,transform 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            new chat
          </button>
        </div>

        {/* Recent label */}
        <div style={{ padding: "2px 16px 8px", flexShrink: 0 }}>
          <p style={{ margin: 0, fontFamily: DM, fontWeight: 500, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--jb-text-3)" }}>
            recent
          </p>
        </div>

        {/* Session list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 12px" }}>
          {isLoading ? (
            // ── Skeleton loading ──
            <div style={{ display: "flex", flexDirection: "column" }}>
              {Array.from({ length: 5 }, (_, i) => (
                <SessionSkeleton key={i} index={i} />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", gap: 10 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--jb-pill-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle style={{ width: 22, height: 22, color: "var(--jb-accent)" }} />
              </div>
              <p style={{ margin: 0, fontFamily: DM, fontWeight: 500, fontSize: 13, color: "var(--jb-text-2)", textAlign: "center" }}>no conversations yet</p>
              <p style={{ margin: 0, fontFamily: DM, fontWeight: 400, fontSize: 12, color: "var(--jb-text-3)", textAlign: "center" }}>start a new chat to begin</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {sessions.map(session => {
                const isActive = session.id === currentSessionId;
                const isDeleting = deletingId === session.id;
                const sharedProps = {
                  session, isActive, isDeleting,
                  onClick: () => { onSelectSession(session.id); onClose(); },
                  onDelete: () => setPendingDelete(session),
                  onRename: () => setRenamingSession(session),
                };
                return isMouseDevice
                  ? <DesktopRow key={session.id} {...sharedProps} />
                  : <MobileRow key={session.id} {...sharedProps} />;
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(140,100,220,0.1)", flexShrink: 0, padding: "10px 10px 6px" }}>
          {(onNavigateActivities || onNavigateSchedule) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}>
              {onNavigateActivities && (
                <button onClick={() => { onNavigateActivities(); onClose(); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", borderRadius: 12, padding: "9px 12px", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: DM, fontSize: 13, fontWeight: 500, color: "#6b5fa0" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(237,232,255,0.7)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 10, background: "#ede8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Sparkles style={{ width: 14, height: 14, color: "#7c3aed" }} />
                  </div>
                  activities
                </button>
              )}
              {onNavigateSchedule && (
                <button onClick={() => { onNavigateSchedule(); onClose(); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", borderRadius: 12, padding: "9px 12px", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: DM, fontSize: 13, fontWeight: 500, color: "#6b5fa0" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(237,232,255,0.7)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 10, background: "#ede8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CalendarDays style={{ width: 14, height: 14, color: "#7c3aed" }} />
                  </div>
                  schedule
                </button>
              )}
            </div>
          )}

          {onLogout && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderTop: "1px solid rgba(140,100,220,0.07)" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#8b6fd4,#6a4fc0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 13, color: "#fff" }}>
                  {(displayName || "U")[0].toUpperCase()}
                </span>
              </div>
              <span style={{ flex: 1, fontFamily: DM, fontSize: 12, color: "rgba(109,40,217,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName || "anonymous"}
              </span>
              <button
                onClick={onLogout}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(109,40,217,0.35)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(109,40,217,0.35)")}
              >
                <LogOut style={{ width: 14, height: 14 }} />
              </button>
            </div>
          )}

          <p style={{ margin: "8px 0 0", fontSize: 10, color: "rgba(109,40,217,0.28)", textAlign: "center", lineHeight: 1.5, fontFamily: DM }}>
            your conversations are private
          </p>
        </div>
      </div>
    </>
  );
}