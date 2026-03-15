import { useEffect, useState } from "react";
import { Phone, Loader2, X, ExternalLink } from "lucide-react";

// Crisis / mental-health hotlines by ISO country code
const CRISIS_NUMBERS: Record<string, { number: string; dialable: string }> = {
  US: { number: "988",           dialable: "988" },
  CA: { number: "988",           dialable: "988" },
  GB: { number: "116 123",       dialable: "116123" },
  AU: { number: "13 11 14",      dialable: "131114" },
  AM: { number: "8-000-1-800",   dialable: "80001800" },
  LB: { number: "1564",          dialable: "1564" },
  IT: { number: "800 274 274",   dialable: "800274274" },
  FR: { number: "3114",          dialable: "3114" },
};

type GeoState =
  | { status: "detecting" }
  | { status: "found"; number: string; dialable: string; country: string }
  | { status: "denied" }
  | { status: "error" };

interface CrisisCallWidgetProps {
  onClose: () => void;
}

export function CrisisCallWidget({ onClose }: CrisisCallWidgetProps) {
  const [geo, setGeo] = useState<GeoState>({ status: "detecting" });

  useEffect(() => {
    setGeo({ status: "detecting" });

    if (!navigator.geolocation) {
      setGeo({ status: "error" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const data = await res.json();
          const code: string = (data.countryCode ?? "").toUpperCase();
          const name: string = data.countryName ?? "your area";
          const entry = CRISIS_NUMBERS[code];

          if (entry) {
            setGeo({ status: "found", ...entry, country: name });
          } else {
            // Country not in map → show findahelpline
            setGeo({ status: "denied" });
          }
        } catch {
          setGeo({ status: "error" });
        }
      },
      () => {
        setGeo({ status: "denied" });
      },
      { timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      {/* Widget card — stops backdrop click */}
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Crisis Support
          </p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-5 text-center">
          {/* Detecting state */}
          {geo.status === "detecting" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-6 h-6 animate-spin text-green-500" />
              <p className="text-sm text-gray-500">Detecting your location…</p>
            </div>
          )}

          {/* Found — show call button */}
          {geo.status === "found" && (
            <>
              <p className="text-xs text-gray-400">
                Detected: {geo.country}
              </p>

              {/* Big green phone button */}
              <a
                href={`tel:${geo.dialable}`}
                className="flex flex-col items-center justify-center gap-2 w-full rounded-2xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-5 shadow-lg shadow-green-200 transition-colors select-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone className="w-8 h-8" />
                </div>
                <span className="text-3xl font-black tracking-tight">
                  {geo.number}
                </span>
                <span className="text-sm font-medium opacity-90">
                  Tap to call crisis support
                </span>
              </a>

              <p className="text-xs text-gray-400 leading-relaxed">
                This opens your phone dialer directly. You are not alone.
              </p>
            </>
          )}

          {/* Denied or error — show findahelpline */}
          {(geo.status === "denied" || geo.status === "error") && (
            <>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8 text-green-600" />
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                We couldn't detect your location. Find your local crisis line at:
              </p>

              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-lg py-4 shadow-lg shadow-green-200 transition-colors select-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <ExternalLink className="w-5 h-5 flex-shrink-0" />
                findahelpline.com
              </a>

              <p className="text-xs text-gray-400 leading-relaxed">
                Lists free, confidential crisis lines in every country.
              </p>
            </>
          )}

          {/* Always show international fallback links */}
          {geo.status !== "detecting" && (
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-left space-y-1">
              <p className="font-semibold text-gray-600 mb-1.5">Other lines</p>
              <p className="text-gray-500">
                🇺🇸 USA / 🇨🇦 CA:{" "}
                <a href="tel:988" className="font-semibold text-green-600 underline">988</a>
              </p>
              <p className="text-gray-500">
                🇬🇧 UK:{" "}
                <a href="tel:116123" className="font-semibold text-green-600 underline">116 123</a>
              </p>
              <p className="text-gray-500">
                🇦🇺 AU:{" "}
                <a href="tel:131114" className="font-semibold text-green-600 underline">13 11 14</a>
              </p>
              <p className="text-gray-500">
                🌍 International:{" "}
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-600 underline"
                >
                  findahelpline.com
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
