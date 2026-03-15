import { Menu } from "lucide-react";
import { ProfileDropdown } from "./ProfileDropdown";
import { LogoWidget } from "./JustBLogo";

interface JustBHeaderProps {
  displayName: string;
  username: string;
  onLogout: () => void;
  onMenuClick: () => void;
  isSidebarOpen?: boolean;
  rightAction?: React.ReactNode;
}

export function JustBHeader({
  displayName,
  username,
  onLogout,
  onMenuClick,
  isSidebarOpen = false,
  rightAction,
}: JustBHeaderProps) {
  return (
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
        width: "100%",
      }}
    >
      {/* Single compact row */}
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
        {/* Left: JustB logo + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {/* JustB — hidden when sidebar is open */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              overflow: "hidden",
              maxWidth: isSidebarOpen ? 0 : 120,
              opacity: isSidebarOpen ? 0 : 1,
              transition: "max-width 0.25s ease, opacity 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            <LogoWidget size={28} />
            <span
              style={{
                fontFamily: "'Black Ops One', 'DM Sans', system-ui, sans-serif",
                fontWeight: 400,
                fontSize: 14,
                color: "var(--jb-text-2)",
                letterSpacing: "0.18em",
              }}
            >
              JUSTB
            </span>
          </div>

          {/* Hamburger */}
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              color: "#7c3aed",
              padding: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Menu style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right: custom action or profile */}
        {rightAction ?? (
          <div style={{ flexShrink: 0 }}>
            <ProfileDropdown
              displayName={displayName}
              username={username}
              onLogout={onLogout}
            />
          </div>
        )}
      </div>
    </div>
  );
}