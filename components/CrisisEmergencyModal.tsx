import { useEffect, useState } from "react";
import { Phone, Loader2, AlertTriangle } from "lucide-react";

// Map ISO country code → local emergency number
const EMERGENCY_NUMBERS: Record<string, string> = {
  US: "911", CA: "911", MX: "911",
  GB: "999", IE: "999",
  AU: "000", NZ: "111",
  AM: "113",   // Armenia
  LB: "140",   // Lebanon
  JP: "119",
  KR: "119",
  CN: "120",
  IN: "112",
  ZA: "10111",
  BR: "192",
  AR: "911",
  RU: "112",
  TR: "112",
  // Default European / international fallback handled below
};

function getEmergencyNumber(countryCode: string): string {
  return EMERGENCY_NUMBERS[countryCode.toUpperCase()] ?? "112";
}

interface CrisisEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GeoState =
  | { status: "detecting" }
  | { status: "found"; number: string; country: string }
  | { status: "denied" }
  | { status: "error" };

export function CrisisEmergencyModal({ isOpen, onClose }: CrisisEmergencyModalProps) {
  const [geo, setGeo] = useState<GeoState>({ status: "detecting" });

  useEffect(() => {
    if (!isOpen) return; // Only run geolocation when modal is open
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
          const code: string = data.countryCode ?? "";
          const name: string = data.countryName ?? "your area";
          const number = getEmergencyNumber(code);
          setGeo({ status: "found", number, country: name });
        } catch {
          setGeo({ status: "error" });
        }
      },
      () => {
        setGeo({ status: "denied" });
      },
      { timeout: 8000, maximumAge: 60000 },
    );
  }, [isOpen]);

  const emergencyNumber =
    geo.status === "found" ? geo.number : "112";

  const locationLabel =
    geo.status === "found"
      ? `Detected location: ${geo.country}`
      : geo.status === "detecting"
      ? "Detecting your location…"
      : "Could not detect location — using international default";

  // Full-screen overlay — pointer-events only on modal, so page behind is dimmed
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      // prevent closing by tapping backdrop
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Red header strip */}
        <div className="bg-red-600 px-5 py-4 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="w-6 h-6 animate-pulse flex-shrink-0" />
            <span className="text-lg font-black tracking-wide uppercase">
              Emergency
            </span>
            <AlertTriangle className="w-6 h-6 animate-pulse flex-shrink-0" />
          </div>
          <p className="text-sm font-medium opacity-90">
            You are not alone. Help is one call away.
          </p>
        </div>

        {/* Body */}
        <div className="px-5 py-6 text-center space-y-5">
          {/* Location detection status */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 min-h-[20px]">
            {geo.status === "detecting" && (
              <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
            )}
            <span>{locationLabel}</span>
          </div>

          {/* Big call button */}
          <a
            href={`tel:${emergencyNumber}`}
            className="flex items-center justify-center gap-3 w-full rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-2xl py-5 shadow-lg shadow-red-200 transition-colors select-none"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Phone className="w-8 h-8 flex-shrink-0" />
            <span>Call {emergencyNumber}</span>
          </a>

          <p className="text-xs text-gray-500 leading-relaxed">
            This will call your local emergency services immediately.
            If you cannot call, ask someone nearby for help.
          </p>

          {/* Crisis hotlines */}
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-xs text-left space-y-1">
            <p className="font-bold text-orange-800 mb-1.5">24 / 7 Crisis Lines</p>
            <p className="text-orange-700">🇺🇸 USA: <a href="tel:988" className="font-semibold underline">988</a></p>
            <p className="text-orange-700">🇬🇧 UK: <a href="tel:116123" className="font-semibold underline">116 123</a></p>
            <p className="text-orange-700">🇦🇺 AU: <a href="tel:131114" className="font-semibold underline">13 11 14</a></p>
            <p className="text-orange-700">🌍 Other: <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline text-orange-600">findahelpline.com</a></p>
          </div>
        </div>

        {/* Dismiss — only available once */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            I am safe right now
          </button>
        </div>
      </div>
    </div>
  );
}