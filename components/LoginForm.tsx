import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onSwitchToSignup: () => void;
  error: string | null;
  isLoading: boolean;
}

export function LoginForm({ onLogin, onSwitchToSignup, error, isLoading }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    background: "var(--jb-surface)",
    border: `1.5px solid ${focusedField === field ? "rgba(139,92,246,0.5)" : "var(--jb-border-2)"}`,
    borderRadius: 100,
    padding: "13px 20px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: 14,
    fontWeight: 400,
    color: "var(--jb-text-form)",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    boxShadow: focusedField === field ? "0 0 0 4px rgba(139,92,246,0.1)" : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box" as const,
  });

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        background: "var(--jb-bg-auth)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "max(env(safe-area-inset-top), 16px) 24px max(env(safe-area-inset-bottom), 32px)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Load DM Sans */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap');`}</style>

      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Aura logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36 }}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            {/* Outer glow rings */}
            <div style={{
              position: "absolute", inset: -16,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
              animation: "pulse 3s ease-in-out infinite",
            }} />
            <div style={{
              position: "absolute", inset: -8,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)",
              animation: "pulse 3s ease-in-out infinite 0.5s",
            }} />
            {/* Core orb */}
            <div style={{
              width: 64, height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #6d28d9 100%)",
              boxShadow: "0 8px 32px rgba(109,40,217,0.35), 0 2px 8px rgba(139,92,246,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 28, lineHeight: 1 }}>✦</span>
            </div>
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontWeight: 300,
            fontSize: 26,
            letterSpacing: "0.35em",
            color: "var(--jb-text-2)",
          }}>
            J u s t B
          </h1>
          <p style={{
            margin: "8px 0 0",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: 13,
            color: "var(--jb-text-3)",
            letterSpacing: "0.04em",
          }}>
            no filters. just you.
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              disabled={isLoading}
              style={inputStyle("username")}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
              disabled={isLoading}
              style={{ ...inputStyle("password"), paddingRight: 48 }}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(109,40,217,0.4)", padding: 4, display: "flex",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div style={{
              fontSize: 12, color: "#be123c",
              background: "rgba(254,205,211,0.5)",
              border: "1px solid rgba(254,205,211,0.8)",
              borderRadius: 12, padding: "10px 16px",
              whiteSpace: "pre-line", lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            style={{
              width: "100%",
              background: isLoading || !username || !password
                ? "rgba(139,92,246,0.3)"
                : "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
              border: "none",
              borderRadius: 100,
              padding: "14px 20px",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: 15,
              color: "#fff",
              cursor: isLoading || !username || !password ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: isLoading || !username || !password
                ? "none"
                : "0 4px 16px rgba(109,40,217,0.35)",
              transition: "all 0.2s",
              marginTop: 4,
            }}
          >
            {isLoading ? (
              <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> signing in…</>
            ) : "sign in"}
          </button>
        </form>

        {/* Switch link */}
        <p style={{
          marginTop: 24, textAlign: "center",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: 400, fontSize: 13,
          color: "rgba(109,40,217,0.55)",
        }}>
          don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            disabled={isLoading}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 500, fontSize: 13,
              color: "#7c3aed",
              textDecoration: "underline", textDecorationColor: "rgba(124,58,237,0.4)",
              padding: 0,
            }}
          >
            sign up
          </button>
        </p>

        {/* Privacy pills */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 8,
          justifyContent: "center", marginTop: 32,
        }}>
          {["anonymous", "private", "judgment-free"].map(label => (
            <span key={label} style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 400, fontSize: 11,
              color: "rgba(109,40,217,0.45)",
              background: "rgba(237,232,255,0.7)",
              borderRadius: 100,
              padding: "4px 12px",
              border: "1px solid rgba(139,92,246,0.15)",
            }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}