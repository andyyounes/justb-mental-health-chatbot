import { useState } from "react";
import { Check, X } from "lucide-react";

const steps = [
  { count: 5, sense: "things you can see" },
  { count: 4, sense: "things you can touch" },
  { count: 3, sense: "things you can hear" },
  { count: 2, sense: "things you can smell" },
  { count: 1, sense: "thing you can taste" },
];

const DM = "'DM Sans', system-ui, sans-serif";

const card: React.CSSProperties = {
  background: "var(--jb-surface)",
  borderRadius: 20,
  boxShadow: "0 2px 16px var(--jb-card-shadow)",
  padding: "clamp(16px, 5vw, 24px)",
};

const gradBtn: React.CSSProperties = {
  background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  border: "none", borderRadius: 100,
  padding: "12px 24px",
  fontFamily: DM, fontWeight: 500, fontSize: 14, color: "#fff",
  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
  boxShadow: "0 4px 16px rgba(109,40,217,0.3)",
};

export function GroundingExercise() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const handleAddAnswer = () => {
    if (!currentAnswer.trim()) return;

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (newAnswers.length >= steps[currentStep].count) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsComplete(true);
      }
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setCurrentAnswer("");
    setIsComplete(false);
  };

  const getCurrentStepAnswers = () => {
    const previousCounts = steps.slice(0, currentStep).reduce((acc, step) => acc + step.count, 0);
    return answers.slice(previousCounts, previousCounts + steps[currentStep].count);
  };

  const currentStepAnswers = getCurrentStepAnswers();

  if (isComplete) {
    return (
      <div style={{ minHeight: "100%", background: "var(--jb-bg-grad)", padding: "clamp(16px,5vw,28px)", fontFamily: DM, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(34,197,94,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <Check style={{ width: 28, height: 28, color: "#22c55e" }} />
          </div>
          <h3 style={{ margin: "0 0 8px", fontFamily: DM, fontWeight: 600, fontSize: 18, color: "var(--jb-text-2)" }}>
            Exercise Complete!
          </h3>
          <p style={{ fontFamily: DM, fontSize: 13, color: "var(--jb-text-3)", lineHeight: 1.6, marginBottom: 24 }}>
            Great job! You've successfully grounded yourself in the present moment.
          </p>
          <button onClick={handleReset} style={{ ...gradBtn, margin: "0 auto" }}>
            Start Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: "var(--jb-bg-grad)", padding: "clamp(16px,5vw,28px)", fontFamily: DM, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 6px", fontFamily: DM, fontWeight: 600, fontSize: 18, color: "var(--jb-text-2)" }}>
            5-4-3-2-1 Grounding Exercise
          </h3>
          <p style={{ margin: 0, fontFamily: DM, fontSize: 13, color: "var(--jb-text-3)", lineHeight: 1.5 }}>
            Use your senses to ground yourself in the present moment
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                height: 6, flex: 1, borderRadius: 100,
                background: index < currentStep
                  ? "rgba(34,197,94,0.7)"
                  : index === currentStep
                  ? "var(--jb-accent)"
                  : "var(--jb-border)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* Current Step */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: "var(--jb-accent)", marginBottom: 6 }}>
              {steps[currentStep].count}
            </div>
            <p style={{ fontFamily: DM, fontSize: 16, color: "var(--jb-text-body)", margin: 0 }}>
              Name {steps[currentStep].sense}
            </p>
          </div>

          {/* Answers for current step */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {currentStepAnswers.map((answer, index) => (
              <div
                key={index}
                style={{
                  padding: "10px 14px", background: "rgba(34,197,94,0.1)",
                  borderRadius: 12, display: "flex", alignItems: "center", gap: 10,
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <Check style={{ width: 16, height: 16, color: "#22c55e", flexShrink: 0 }} />
                <span style={{ fontFamily: DM, fontSize: 13, color: "var(--jb-text-body)" }}>{answer}</span>
              </div>
            ))}
            {Array.from({ length: steps[currentStep].count - currentStepAnswers.length }).map(
              (_, index) => (
                <div
                  key={`empty-${index}`}
                  style={{
                    padding: "10px 14px", background: "var(--jb-pill-bg)",
                    borderRadius: 12, border: "2px dashed var(--jb-border-2)", height: 40,
                  }}
                />
              )
            )}
          </div>

          {/* Input */}
          {currentStepAnswers.length < steps[currentStep].count && (
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddAnswer()}
                placeholder="Type your answer..."
                style={{
                  flex: 1, fontFamily: DM, fontSize: 14, color: "var(--jb-text-form)",
                  background: "var(--jb-pill-bg)", border: "1.5px solid var(--jb-border-2)",
                  borderRadius: 12, padding: "11px 14px", outline: "none", boxSizing: "border-box",
                  caretColor: "#8b5cf6",
                }}
              />
              <button
                onClick={handleAddAnswer}
                disabled={!currentAnswer.trim()}
                style={{
                  ...gradBtn,
                  background: currentAnswer.trim() ? "linear-gradient(135deg,#8b5cf6,#6d28d9)" : "rgba(139,92,246,0.2)",
                  color: currentAnswer.trim() ? "#fff" : "rgba(139,92,246,0.4)",
                  cursor: currentAnswer.trim() ? "pointer" : "not-allowed",
                  padding: "12px 20px", flexShrink: 0,
                }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Reset button */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleReset}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: DM, fontSize: 13, color: "var(--jb-text-3)",
              display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px",
              borderRadius: 8,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--jb-pill-bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <X style={{ width: 14, height: 14 }} /> Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
