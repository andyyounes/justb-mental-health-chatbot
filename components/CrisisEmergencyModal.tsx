import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Phone, Loader2, AlertTriangle, ChevronDown } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// INTERNATIONAL NUMBERS — all include country dialing prefix (+X)
// Format: { display: readable label, dialable: tel: link value }
// ─────────────────────────────────────────────────────────────────────────────
type NumberPair = { display: string; dialable: string };

const COUNTRY_NUMBERS: Record<string, { crisis: NumberPair; emergency: NumberPair }> = {
  US: { crisis: { display: "988",              dialable: "+1988"          }, emergency: { display: "911",           dialable: "+1911"        } },
  CA: { crisis: { display: "988",              dialable: "+1988"          }, emergency: { display: "911",           dialable: "+1911"        } },
  MX: { crisis: { display: "+52 800-290-0024",dialable: "+528002900024" }, emergency: { display: "+52 911",        dialable: "+52911"       } },
  GB: { crisis: { display: "116 123",          dialable: "+44116123"      }, emergency: { display: "999",           dialable: "+44999"       } },
  IE: { crisis: { display: "+353 116 123",    dialable: "+353116123"     }, emergency: { display: "+353 999",      dialable: "+353999"      } },
  AU: { crisis: { display: "+61 13 11 14",    dialable: "+61131114"      }, emergency: { display: "000",           dialable: "000"          } },
  NZ: { crisis: { display: "+64 1737",        dialable: "+641737"        }, emergency: { display: "+64 111",       dialable: "+64111"       } },
  AM: { crisis: { display: "+374 80 001 800", dialable: "+37480001800"   }, emergency: { display: "911",           dialable: "+374911"      } },
  LB: { crisis: { display: "+961 1564",       dialable: "+9611564"       }, emergency: { display: "+961 140",      dialable: "+961140"      } },
  IT: { crisis: { display: "+39 800 274 274", dialable: "+39800274274"   }, emergency: { display: "+39 118",       dialable: "+39118"       } },
  FR: { crisis: { display: "+33 3114",        dialable: "+333114"        }, emergency: { display: "+33 15",        dialable: "+3315"        } },
  DE: { crisis: { display: "+49 800 111 0 111",dialable: "+498001110111"},  emergency: { display: "+49 112",       dialable: "+49112"       } },
  JP: { crisis: { display: "+81 570-783-556", dialable: "+81570783556"   }, emergency: { display: "+81 119",       dialable: "+81119"       } },
  KR: { crisis: { display: "+82 1393",        dialable: "+821393"        }, emergency: { display: "+82 119",       dialable: "+82119"       } },
  CN: { crisis: { display: "+86 400-161-9995",dialable: "+864001619995" }, emergency: { display: "+86 120",       dialable: "+86120"       } },
  IN: { crisis: { display: "+91 9152987821",  dialable: "+919152987821"  }, emergency: { display: "+91 112",       dialable: "+91112"       } },
  ZA: { crisis: { display: "+27 800 456 789", dialable: "+27800456789"   }, emergency: { display: "+27 10111",     dialable: "+2710111"     } },
  BR: { crisis: { display: "+55 188",         dialable: "+55188"         }, emergency: { display: "+55 192",       dialable: "+55192"       } },
  AR: { crisis: { display: "+54 135",         dialable: "+54135"         }, emergency: { display: "+54 911",       dialable: "+54911"       } },
  RU: { crisis: { display: "+7 8-800-2000-122",dialable: "+788002000122"},  emergency: { display: "+7 112",        dialable: "+7112"        } },
  TR: { crisis: { display: "+90 182",         dialable: "+90182"         }, emergency: { display: "+90 112",       dialable: "+90112"       } },
};

const DEFAULT_EMERGENCY: NumberPair = { display: "+112", dialable: "+112" };

// Fallback country dropdown (only shown if geolocation fails)
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

function resolveNumbers(code: string) {
  return COUNTRY_NUMBERS[code.toUpperCase()] ?? null;
}

interface CrisisEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GeoState =
  | { status: "detecting" }
  | { status: "found"; countryCode: string; countryName: string }
  | { status: "failed" }; // covers denied + error — only then show dropdown

export function CrisisEmergencyModal({ isOpen, onClose }: CrisisEmergencyModalProps) {
  const [geo, setGeo] = useState<GeoState>({ status: "detecting" });
  const [manualCode, setManualCode] = useState("");

  // ─── REAL GEOLOCATION — runs every time modal opens, no cache ───────────
  useEffect(() => {
    if (!isOpen) return;
    setGeo({ status: "detecting" });
    setManualCode("");

    if (!navigator.geolocation) {
      setGeo({ status: "failed" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Real reverse geocoding via Nominatim (OpenStreetMap)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=3`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          const code: string = (data.address?.country_code ?? "").toUpperCase();
          const name: string = data.address?.country ?? data.display_name ?? "your area";

          // Store globally for backend pass-through
          (window as any).userCountry     = name;
          (window as any).userCountryCode = code;

          setGeo({ status: "found", countryCode: code, countryName: name });
        } catch {
          // Fallback reverse geocoder
          try {
            const { latitude, longitude } = pos.coords;
            const r2 = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            );
            const d2 = await r2.json();
            const code = (d2.countryCode ?? "").toUpperCase();
            const name = d2.countryName ?? "your area";
            (window as any).userCountry     = name;
            (window as any).userCountryCode = code;
            setGeo({ status: "found", countryCode: code, countryName: name });
          } catch {
            setGeo({ status: "failed" });
          }
        }
      },
      () => setGeo({ status: "failed" }), // permission denied or timeout
      {
        maximumAge: 0,      // always fresh — no stale cached position
        timeout: 10000,
        enableHighAccuracy: false,
      },
    );
  }, [isOpen]);

  if (!isOpen) return null;

  // Resolve final numbers — manual override beats auto-detected
  const activeCode = manualCode || (geo.status === "found" ? geo.countryCode : "");
  const nums       = activeCode && activeCode !== "OTHER" ? resolveNumbers(activeCode) : null;
  const emergency  = nums?.emergency ?? DEFAULT_EMERGENCY;
  const crisis     = nums?.crisis ?? null;

  const locationLabel =
    manualCode
      ? COUNTRY_OPTIONS.find((o) => o.code === manualCode)?.label ?? manualCode
      : geo.status === "found"
      ? `📍 Detected: ${geo.countryName}`
      : geo.status === "detecting"
      ? "Detecting your location…"
      : "Location unavailable";

  // Dropdown only shown after geolocation fails
  const showDropdown = geo.status === "failed";

  // ── Render via portal so it's ALWAYS above everything (document.body) ───
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,           // highest possible — outside all stacking contexts
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "rgba(0,0,0,0.85)",
        boxSizing: "border-box",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          borderRadius: 20,
          background: "#fff",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
        }}
      >
        {/* ── Red header ── */}
        <div style={{ background: "#dc2626", padding: "16px 20px", textAlign: "center", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
            <AlertTriangle style={{ width: 22, height: 22 }} />
            <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Emergency</span>
            <AlertTriangle style={{ width: 22, height: 22 }} />
          </div>
          <p style={{ fontSize: 13, opacity: 0.92, margin: 0 }}>You are not alone. Help is one call away.</p>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "18px 20px 0" }}>

          {/* Location status row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11, color: "#6b7280", marginBottom: 14, minHeight: 20 }}>
            {geo.status === "detecting" && !manualCode && (
              <Loader2 style={{ width: 12, height: 12, flexShrink: 0, animation: "jbSpin 1s linear infinite" }} />
            )}
            <span>{locationLabel}</span>
          </div>

          {/* ── Fallback dropdown — ONLY shown if geolocation fails ── */}
          {showDropdown && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, textAlign: "center" }}>
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

          {/* ── Emergency call button (primary, red) ── */}
          <a
            href={`tel:${emergency.dialable}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", borderRadius: 14, background: "#dc2626", color: "#fff",
              fontWeight: 900, fontSize: 20, padding: "18px 16px", textDecoration: "none",
              boxShadow: "0 6px 20px rgba(220,38,38,0.35)", marginBottom: 10,
              minHeight: 64, WebkitTapHighlightColor: "transparent",
            }}
          >
            <Phone style={{ width: 26, height: 26, flexShrink: 0 }} />
            <span>Call {emergency.display}</span>
          </a>

          {/* ── Crisis line button (secondary, orange) ── */}
          {crisis ? (
            <a
              href={`tel:${crisis.dialable}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", borderRadius: 14, background: "#f97316", color: "#fff",
                fontWeight: 700, fontSize: 15, padding: "13px 16px", textDecoration: "none",
                boxShadow: "0 4px 14px rgba(249,115,22,0.30)", marginBottom: 10,
                minHeight: 52, WebkitTapHighlightColor: "transparent",
              }}
            >
              <Phone style={{ width: 17, height: 17, flexShrink: 0 }} />
              <span>Crisis line: {crisis.display}</span>
            </a>
          ) : (
            <a
              href="https://findahelpline.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", borderRadius: 14, background: "#f97316", color: "#fff",
                fontWeight: 700, fontSize: 15, padding: "13px 16px", textDecoration: "none",
                marginBottom: 10, minHeight: 52, WebkitTapHighlightColor: "transparent",
              }}
            >
              🌍 findahelpline.com
            </a>
          )}

          <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 14, lineHeight: 1.5, textAlign: "center" }}>
            These buttons call emergency services and crisis lines directly.
            If you cannot call, ask someone nearby for help.
          </p>

          {/* ── Quick reference strip ── */}
          <div style={{ borderRadius: 12, background: "#fff7ed", border: "1px solid #fed7aa", padding: "10px 12px", marginBottom: 16 }}>
            <p style={{ fontWeight: 700, color: "#9a3412", fontSize: 11, marginBottom: 6 }}>24/7 Crisis Lines</p>
            {[
              { flag: "🇺🇸", label: "USA",     display: "988",               dialable: "+1988"        },
              { flag: "🇬🇧", label: "UK",      display: "116 123",           dialable: "+44116123"    },
              { flag: "🇦🇺", label: "AU",      display: "+61 13 11 14",      dialable: "+61131114"    },
              { flag: "🇦🇲", label: "Armenia", display: "+374 80 001 800",   dialable: "+37480001800" },
            ].map(({ flag, label, display, dialable }) => (
              <p key={label} style={{ fontSize: 11, color: "#c2410c", margin: "2px 0" }}>
                {flag} {label}: <a href={`tel:${dialable}`} style={{ fontWeight: 700, textDecoration: "underline", color: "#c2410c" }}>{display}</a>
              </p>
            ))}
            <p style={{ fontSize: 11, color: "#c2410c", margin: "2px 0" }}>
              🌍 Other: <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, textDecoration: "underline" }}>findahelpline.com</a>
            </p>
          </div>
        </div>

        {/* ── Dismiss ── */}
        <div style={{ padding: "0 20px 20px" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 12,
              border: "2px solid #e5e7eb", background: "transparent",
              color: "#6b7280", fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44,
            }}
          >
            I am safe right now
          </button>
        </div>
      </div>

      <style>{`
        @keyframes jbSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body, // ← portal escapes ALL parent stacking contexts
  );
}
