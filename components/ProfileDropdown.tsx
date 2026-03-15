import { useEffect, useRef, useState } from "react";
import { LogOut, Info, X } from "lucide-react";
import { JustBLogo, LogoWidget } from "./JustBLogo";

interface ProfileDropdownProps {
  displayName: string;
  username: string;
  onLogout: () => void;
}

const DM = "'DM Sans', system-ui, sans-serif";

export function ProfileDropdown({
  displayName,
  username,
  onLogout,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const name = displayName || username || "User";

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <div ref={containerRef} style={{ position: "relative", flexShrink: 0 }}>
        {/* Avatar button — planet logo */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Open profile menu"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "var(--jb-pill-bg)",
            border: `1.5px solid ${open ? "var(--jb-border-2)" : "var(--jb-border)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "border-color 0.18s, box-shadow 0.18s",
            boxShadow: open ? "0 0 0 3px rgba(180,160,255,0.22)" : "none",
            overflow: "hidden",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--jb-border-2)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(180,160,255,0.18)";
          }}
          onMouseLeave={e => {
            if (!open) {
              e.currentTarget.style.borderColor = "var(--jb-border)";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
        >
          <JustBLogo size={34} showText={false} />
        </button>

        {/* Dropdown panel */}
        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              zIndex: 200,
              width: 220,
              borderRadius: 20,
              background: "var(--jb-surface)",
              border: "1px solid var(--jb-border-2)",
              boxShadow: "0 16px 48px rgba(80,40,180,0.18), 0 4px 16px rgba(0,0,0,0.12)",
              overflow: "hidden",
              animation: "dropIn 0.16s cubic-bezier(.4,0,.2,1)",
            }}
            role="menu"
          >
            {/* Greeting header */}
            <div
              style={{
                padding: "16px 18px 14px",
                background: "linear-gradient(135deg, rgba(180,160,255,0.18) 0%, rgba(140,120,255,0.10) 100%)",
                borderBottom: "1px solid var(--jb-border)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--jb-pill-bg)",
                  border: "1.5px solid var(--jb-border-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <JustBLogo size={38} showText={false} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: DM, fontSize: 10, fontWeight: 500, color: "var(--jb-text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  signed in as
                </p>
                <p style={{ margin: "2px 0 0", fontFamily: DM, fontSize: 13, fontWeight: 600, color: "var(--jb-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {name}
                </p>
              </div>
            </div>

            {/* About JustB */}
            <button
              onClick={() => { setOpen(false); setShowAbout(true); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "12px 18px", background: "transparent", border: "none",
                cursor: "pointer", fontFamily: DM, fontSize: 13, fontWeight: 400,
                color: "var(--jb-text-body)", transition: "background 0.15s",
              }}
              role="menuitem"
              onMouseEnter={e => (e.currentTarget.style.background = "var(--jb-pill-bg)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--jb-pill-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Info style={{ width: 14, height: 14, color: "var(--jb-text-icon)" }} />
              </div>
              About JustB
            </button>

            <div style={{ height: 1, background: "var(--jb-border)", margin: "0 12px" }} />

            {/* Logout */}
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "12px 18px", background: "transparent", border: "none",
                cursor: "pointer", fontFamily: DM, fontSize: 13, fontWeight: 400,
                color: "#ef4444", transition: "background 0.15s",
              }}
              role="menuitem"
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.10)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(239,68,68,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LogOut style={{ width: 14, height: 14, color: "#ef4444" }} />
              </div>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* ── About JustB modal ── */}
      {showAbout && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 400,
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShowAbout(false)}
        >
          {/* Backdrop */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(20,8,50,0.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />

          {/* Sheet */}
          <div
            style={{
              position: "relative", width: "100%", maxWidth: 400,
              background: "var(--jb-surface)",
              borderRadius: 28,
              boxShadow: "0 24px 64px rgba(80,40,180,0.28)",
              overflow: "hidden",
              animation: "popIn 0.22s cubic-bezier(.34,1.56,.64,1)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header with logo */}
            <div
              style={{
                background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
                padding: "28px 24px 32px",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <JustBLogo size={72} showText={true} />
              </div>
              <h2 style={{ margin: "0 0 4px", fontFamily: "'Black Ops One', 'DM Sans', system-ui, sans-serif", fontWeight: 400, fontSize: 22, color: "#fff", letterSpacing: "0.15em" }}>
                JUSTB
              </h2>
              <p style={{ margin: 0, fontFamily: DM, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                Your compassionate wellness companion
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ margin: 0, fontFamily: DM, fontSize: 13, color: "var(--jb-text-body)", lineHeight: 1.6 }}>
                <span style={{ fontWeight: 600, color: "var(--jb-text-2)" }}>JustB</span> is a safe, anonymous space to talk through anxiety, stress, sleep, relationships, and mood — anytime, without judgment.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "💬  AI-powered empathetic chat",
                  "🧘  Calming exercises & activities",
                  "📅  Wellness task scheduling",
                  "🆘  Built-in crisis support resources",
                ].map(item => (
                  <p key={item} style={{ margin: 0, fontFamily: DM, fontSize: 12, color: "var(--jb-text-3)" }}>{item}</p>
                ))}
              </div>
              <p style={{ margin: 0, fontFamily: DM, fontSize: 11, color: "var(--jb-text-3)", lineHeight: 1.5 }}>
                JustB is not a substitute for professional mental health care. If you are in crisis, please reach out to a helpline or emergency services.
              </p>
            </div>

            {/* Close button */}
            <div style={{ padding: "0 24px 24px" }}>
              <button
                onClick={() => setShowAbout(false)}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 14,
                  background: "var(--jb-pill-bg)", border: "none",
                  fontFamily: DM, fontWeight: 600, fontSize: 14,
                  color: "var(--jb-text-icon)", cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--jb-border-2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--jb-pill-bg)")}
              >
                Got it
              </button>
            </div>

            {/* X icon */}
            <button
              onClick={() => setShowAbout(false)}
              style={{
                position: "absolute", top: 14, right: 14,
                background: "rgba(255,255,255,0.15)", border: "none",
                borderRadius: "50%", width: 30, height: 30,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff",
              }}
              aria-label="Close"
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { transform: translateY(-6px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0.92) translateY(12px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
