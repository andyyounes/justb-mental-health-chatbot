import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Phone, Loader2, X, ExternalLink, ChevronDown } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// INTERNATIONAL CRISIS NUMBERS — all include country dialing prefix (+X)
// ─────────────────────────────────────────────────────────────────────────────
type NumberEntry = { display: string; dialable: string };

const CRISIS_NUMBERS: Record<string, NumberEntry> = {
  US: { display: "988",              dialable: "+1988"          },
  CA: { display: "988",              dialable: "+1988"          },
  MX: { display: "+52 800-290-0024", dialable: "+528002900024"  },
  GB: { display: "116 123",          dialable: "+44116123"      },
  IE: { display: "+353 116 123",     dialable: "+353116123"     },
  AU: { display: "+61 13 11 14",     dialable: "+61131114"      },
  NZ: { display: "+64 1737",         dialable: "+641737"        },
  AM: { display: "+374 80 001 800",  dialable: "+37480001800"   },
  LB: { display: "+961 1564",        dialable: "+9611564"       },
  IT: { display: "+39 800 274 274",  dialable: "+39800274274"   },
  FR: { display: "+33 3114",         dialable: "+333114"        },
  DE: { display: "+49 800 111 0 111",dialable: "+498001110111"  },
  JP: { display: "+81 570-783-556",  dialable: "+81570783556"   },
  KR: { display: "+82 1393",         dialable: "+821393"        },
  IN: { display: "+91 9152987821",   dialable: "+919152987821"  },
  ZA: { display: "+27 800 456 789",  dialable: "+27800456789"   },
  BR: { display: "+55 188",          dialable: "+55188"         },
  AR: { display: "+54 135",          dialable: "+54135"         },
  RU: { display: "+7 8800-2000-122", dialable: "+788002000122"  },
  TR: { display: "+90 182",          dialable: "+90182"         },
};

// Fallback dropdown options (only rendered if geolocation fails)
const COUNTRY_OPTIONS = [
  { code: "US", label: "🇺🇸 United States" },
  { code: "GB", label: "🇬🇧 United Kingdom" },
  { code: "AU", label: "🇦🇺 Australia" },
  { code: "CA", label: "🇨🇦 Canada" },
  { code: "AM", label: "🇦🇲 Armenia" },
  { code: "IE", label: "🇮🇪 Ireland" },
  { code: "NZ", label: "🇳🇿 New Zealand" },
  { code: "LB", label: "🇱🇧 Lebanon" },
  { code: "IT", label: "🇮🇹 Italy" },
  { code: "FR", label: "🇫🇷 France" },
  { code: "DE", label: "🇩🇪 Germany" },
  { code: "JP", label: "🇯🇵 Japan" },
  { code: "KR", label: "🇰🇷 South Korea" },
  { code: "IN", label: "🇮🇳 India" },
  { code: "BR", label: "🇧🇷 Brazil" },
  { code: "ZA", label: "🇿🇦 South Africa" },
  { code: "TR", label: "🇹🇷 Turkey" },
  { code: "OTHER", label: "🌍 Other / International" },
];

type GeoState =
  | { status: "detecting" }
  | { status: "found"; entry: NumberEntry; countryName: string }
  | { status: "failed" }; // geolocation denied / error — show dropdown fallback

interface CrisisCallWidgetProps {
  onClose: () => void;
}

export function CrisisCallWidget({ onClose }: CrisisCallWidgetProps) {
  const [geo, setGeo]           = useState<GeoState>({ status: "detecting" });
  const [manualCode, setManualCode] = useState("");

  // ─── REAL GEOLOCATION — no stale cache, always fresh ────────────────────
  useEffect(() => {
    setGeo({ status: "detecting" });

    if (!navigator.geolocation) {
      setGeo({ status: "failed" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // Primary: Nominatim (OpenStreetMap)
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=3`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          const code: string = (data.address?.country_code ?? "").toUpperCase();
          const name: string = data.address?.country ?? data.display_name ?? "your area";

          // Store globally for backend pass-through
          (window as any).userCountry     = name;
          (window as any).userCountryCode = code;

          const entry = CRISIS_NUMBERS[code];
          if (entry) {
            setGeo({ status: "found", entry, countryName: name });
          } else {
            // Country exists but not in our map — show findahelpline fallback
            setGeo({ status: "failed" });
          }
        } catch {
          // Fallback: bigdatacloud
          try {
            const { latitude, longitude } = pos.coords;
            const r2   = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            );
            const d2   = await r2.json();
            const code = (d2.countryCode ?? "").toUpperCase();
            const name = d2.countryName ?? "your area";
            (window as any).userCountry     = name;
            (window as any).userCountryCode = code;
            const entry = CRISIS_NUMBERS[code];
            if (entry) {
              setGeo({ status: "found", entry, countryName: name });
            } else {
              setGeo({ status: "failed" });
            }
          } catch {
            setGeo({ status: "failed" });
          }
        }
      },
      () => setGeo({ status: "failed" }),
      {
        maximumAge: 0,      // always fresh — never use stale cached position
        timeout: 10000,
        enableHighAccuracy: false,
      },
    );
  }, []);

  // Resolve manual override
  const manualEntry = manualCode && manualCode !== "OTHER"
    ? CRISIS_NUMBERS[manualCode]
    : null;

  const activeEntry    = manualEntry ?? (geo.status === "found" ? geo.entry : null);
  const showDropdown   = geo.status === "failed";
  const showFindahelp  = showDropdown && !manualEntry;

  const locationLabel =
    manualCode
      ? COUNTRY_OPTIONS.find((o) => o.code === manualCode)?.label ?? manualCode
      : geo.status === "found"
      ? `📍 Detected: ${geo.countryName}`
      : geo.status === "detecting"
      ? "Detecting your location…"
      : "Location unavailable";

  // ── Portal renders directly into document.body — escapes stacking contexts ──
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "rgba(0,0,0,0.60)",
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      {/* Widget card — stops backdrop click */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 20,
          background: "#fff",
          boxShadow: "0 20px 60px rgba(0,0,0,0.40)",
          overflow: "hidden",
          marginBottom: "max(env(safe-area-inset-bottom, 0px), 0px)",
          maxHeight: "calc(100vh - 80px)",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 10px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
            Crisis Support
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "#fee2e2", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X style={{ width: 14, height: 14, color: "#dc2626" }} />
          </button>
        </div>

        <div style={{ padding: "0 20px 24px", textAlign: "center" }}>

          {/* ── Step 1: detecting ── */}
          {geo.status === "detecting" && !manualCode && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "12px 0" }}>
              <Loader2 style={{ width: 24, height: 24, color: "#22c55e", animation: "jbSpin 1s linear infinite" }} />
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Detecting your location…</p>
            </div>
          )}

          {/* ── Location label ── */}
          {(geo.status !== "detecting" || manualCode) && (
            <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10 }}>{locationLabel}</p>
          )}

          {/* ── Found — big green call button ── */}
          {activeEntry && (
            <>
              <a
                href={`tel:${activeEntry.dialable}`}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", borderRadius: 16, background: "#22c55e", color: "#fff",
                  padding: "20px 16px", textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(34,197,94,0.32)",
                  marginBottom: 10, minHeight: 80,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Phone style={{ width: 28, height: 28 }} />
                </div>
                <span style={{ fontSize: 22, fontWeight: 900 }}>{activeEntry.display}</span>
                <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.9 }}>Tap to call crisis support</span>
              </a>
              <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 14 }}>
                This opens your phone dialer directly. You are not alone.
              </p>
            </>
          )}

          {/* ── Fallback dropdown — ONLY after geolocation fails ── */}
          {showDropdown && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                Couldn't detect location — select your country:
              </p>
              <div style={{ position: "relative" }}>
                <select
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 32px 10px 12px",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "#374151",
                    background: "#f9fafb",
                    appearance: "none",
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                >
                  <option value="">Select your country…</option>
                  {COUNTRY_OPTIONS.map((o) => (
                    <option key={o.code} value={o.code}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af", pointerEvents: "none" }} />
              </div>
            </div>
          )}

          {/* ── findahelpline fallback — when geo failed and no country selected ── */}
          {showFindahelp && (
            <>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Phone style={{ width: 28, height: 28, color: "#16a34a" }} />
              </div>
              <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 12, lineHeight: 1.5 }}>
                Find your local crisis line:
              </p>
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", borderRadius: 14, background: "#22c55e", color: "#fff",
                  fontWeight: 700, fontSize: 16, padding: "14px 16px", textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(34,197,94,0.28)", marginBottom: 12, minHeight: 52,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <ExternalLink style={{ width: 18, height: 18, flexShrink: 0 }} />
                findahelpline.com
              </a>
            </>
          )}

          {/* ── Quick reference — always shown after detecting ── */}
          {geo.status !== "detecting" && (
            <div style={{ borderRadius: 12, background: "#f9fafb", border: "1px solid #f3f4f6", padding: "10px 12px", textAlign: "left" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>Other crisis lines</p>
              {[
                { flag: "🇺🇸", label: "USA / CA",  display: "988",               dialable: "+1988"        },
                { flag: "🇬🇧", label: "UK",         display: "116 123",           dialable: "+44116123"    },
                { flag: "🇦🇺", label: "AU",          display: "+61 13 11 14",      dialable: "+61131114"    },
                { flag: "🇦🇲", label: "Armenia",     display: "+374 80 001 800",   dialable: "+37480001800" },
              ].map(({ flag, label, display, dialable }) => (
                <p key={label} style={{ fontSize: 11, color: "#6b7280", margin: "2px 0" }}>
                  {flag} {label}: <a href={`tel:${dialable}`} style={{ fontWeight: 700, color: "#16a34a", textDecoration: "underline" }}>{display}</a>
                </p>
              ))}
              <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0" }}>
                🌍 International: <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: "#16a34a", textDecoration: "underline" }}>findahelpline.com</a>
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes jbSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body,
  );
}
