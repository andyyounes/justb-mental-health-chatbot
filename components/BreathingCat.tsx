import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Triangle } from "lucide-react";

export function BreathingCat() {
  const [phase, setPhase] = useState<"sleeping" | "breathing" | "stretching">("sleeping");
  const [breathPhase, setBreathPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    // Sleep for 2 seconds, then start breathing
    const sleepTimer = setTimeout(() => {
      setPhase("breathing");
    }, 2000);

    return () => clearTimeout(sleepTimer);
  }, []);

  useEffect(() => {
    if (phase === "breathing") {
      let breathCount = 0;
      const breathInterval = setInterval(() => {
        setBreathPhase((prev) => {
          const next = prev === "in" ? "out" : "in";
          if (next === "in") {
            breathCount++;
            // After 3 breath cycles, stretch
            if (breathCount >= 3) {
              setTimeout(() => setPhase("stretching"), 4000);
              clearInterval(breathInterval);
            }
          }
          return next;
        });
      }, 4000); // 4 seconds per breath phase

      return () => clearInterval(breathInterval);
    }
  }, [phase]);

  const isEyesClosed = phase === "sleeping" || (phase === "breathing" && breathPhase === "in");
  const isMouthOpen = phase === "breathing" && breathPhase === "out";

  return (
    <div className="relative">
      <motion.div
          animate={
            phase === "stretching"
              ? {
                  scale: [1, 1.15, 1.05],
                  y: [0, -20, 0]
                }
              : {}
          }
          transition={{
            duration: 2,
            ease: "easeInOut"
          }}
        >

        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          {/* Main body */}
          <motion.ellipse
            cx="140"
            cy="160"
            rx="90"
            ry="85"
            fill="url(#catGradient)"
            animate={
              phase === "breathing"
                ? {
                    ry: breathPhase === "in" ? 82 : 88,
                  }
                : {}
            }
            transition={{ duration: 4, ease: "easeInOut" }}
          />

          {/* Head */}
          <motion.circle
            cx="140"
            cy="100"
            r="55"
            fill="url(#catGradient)"
            animate={
              phase === "breathing"
                ? {
                    r: breathPhase === "in" ? 56 : 54,
                  }
                : {}
            }
            transition={{ duration: 4, ease: "easeInOut" }}
          />

          {/* Left ear */}
          <motion.path
  d="
    M85 65 
    Q75 40 115 48 
    Q100 80 85 65
  "
  fill="url(#earGradient)"
  transition={{ duration: 2 }}
/>

<path
  d="
    M90 63 
    Q82 50 110 53 
    Q98 72 90 63
  "
  fill="#FFB6D9"
/>


          {/* Right ear */}
          <motion.path
  d="
    M195 65 
    Q205 40 165 48 
    Q180 80 195 65
  "
  fill="url(#earGradient)"
  transition={{ duration: 2 }}
/>

<path
  d="
    M190 63 
    Q198 50 170 53 
    Q182 72 190 63
  "
  fill="#FFB6D9"
/>



          {/* Eyes */}
          {/* --- NEW CUTE CAT EYES --- */}
          <motion.g
            animate={isEyesClosed ? { scaleY: 0.1 } : { scaleY: 1 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: "140px 120px" }}
          >
            {/* Left eye */}
            <ellipse cx="115" cy="95" rx="12" ry="12" fill="#1F1F1F" />
            { !isEyesClosed && <circle cx="118" cy="86" r="3" fill="white" /> }

            {/* Right eye */}
            <ellipse cx="165" cy="95" rx="12" ry="12" fill="#1F1F1F" />
            { !isEyesClosed && <circle cx="168" cy="86" r="3" fill="white" /> }
          </motion.g>


          {/* Sleeping Z's */}
          {phase === "sleeping" && (
            <g opacity="0.7">
              <motion.text
                x="200"
                y="60"
                fill="#A855F7"
                fontSize="20"
                animate={{ y: [60, 50], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              >
                z
              </motion.text>
              <motion.text
                x="215"
                y="45"
                fill="#A855F7"
                fontSize="24"
                animate={{ y: [45, 35], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                Z
              </motion.text>
              <motion.text
                x="235"
                y="30"
                fill="#A855F7"
                fontSize="28"
                animate={{ y: [30, 20], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                Z
              </motion.text>
            </g>
          )}

          {/* Nose */}
<path 
  d="M140 123 L135 113 L145 113 Z"
  fill="#FF69B4"
/>
          {/* Cute “w” Mouth */}
<path
  d="M128 123 q6 10 12 0"
  stroke="#E91E63"
  strokeWidth="3"
  strokeLinecap="round"
  fill="none"
/>
<path
  d="M140 123 q6 10 12 0"
  stroke="#E91E63"
  strokeWidth="3"
  strokeLinecap="round"
  fill="none"
/>



          {/* Whiskers */}
          <g stroke="#C084FC" strokeWidth="2" strokeLinecap="round" opacity="0.7">
            <line x1="100" y1="100" x2="70" y2="95" />
            <line x1="100" y1="108" x2="65" y2="108" />
            <line x1="100" y1="116" x2="70" y2="121" />
            <line x1="180" y1="100" x2="210" y2="95" />
            <line x1="180" y1="108" x2="220" y2="108" />
            <line x1="180" y1="116" x2="210" y2="121" />
          </g>

          {/* Front paws */}
          
          <motion.g
            animate={
              phase === "stretching"
                ? {
                    x: [0, -15, 0],
                    y: [0, 5, 0],
                  }
                : {}
            }
            transition={{ duration: 2 }}
          >
            <ellipse cx="110" cy="230" rx="18" ry="22" fill="url(#pawGradient)" />
            <circle cx="105" cy="238" r="4" fill="#FFB6D9" />
            <circle cx="112" cy="240" r="3.5" fill="#FFB6D9" />
            <circle cx="115" cy="235" r="3.5" fill="#FFB6D9" />
          </motion.g>

          <motion.g
            animate={
              phase === "stretching"
                ? {
                    x: [0, 15, 0],
                    y: [0, 5, 0],
                  }
                : {}
            }
            transition={{ duration: 2 }}
          >
            <ellipse cx="170" cy="230" rx="18" ry="22" fill="url(#pawGradient)" />
            <circle cx="165" cy="238" r="4" fill="#FFB6D9" />
            <circle cx="172" cy="240" r="3.5" fill="#FFB6D9" />
            <circle cx="175" cy="235" r="3.5" fill="#FFB6D9" />
          </motion.g>

          {/* Tail */}
          <motion.path
            d="M220 150 Q250 140 255 120 Q258 105 250 95"
            stroke="url(#tailGradient)"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
            animate={
              phase === "stretching"
                ? {
                    d: "M220 150 Q255 130 265 110 Q270 95 265 80",
                  }
                : {}
            }
            transition={{ duration: 2 }}
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="earGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="pawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="tailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Breathing text */}
      {phase === "breathing" && (
        <motion.div
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center mt-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            key={breathPhase}
            className="text-2xl text-purple-600"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {breathPhase === "in" ? "breathe in..." : "breathe out..."}
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}
