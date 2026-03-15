import { Heart, Brain, Moon, Users, Smile, Coffee } from "lucide-react";

interface QuickTopicsProps {
  onTopicSelect: (topic: string) => void;
}

const topics = [
  { icon: Brain,  label: "Anxiety",       value: "I'm feeling anxious" },
  { icon: Moon,   label: "Sleep",          value: "I'm having trouble sleeping" },
  { icon: Heart,  label: "Stress",         value: "I'm feeling stressed" },
  { icon: Users,  label: "Relationships",  value: "I need relationship advice" },
  { icon: Smile,  label: "Mood",           value: "I'm feeling down" },
  { icon: Coffee, label: "Self-care",      value: "Self-care tips" },
];

const chipStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
  fontWeight: 400,
  fontSize: "clamp(11px, 3vw, 12px)",
  color: "var(--jb-text-icon)",
  background: "var(--jb-surface)",
  border: "1px solid var(--jb-border-2)",
  borderRadius: 100,
  padding: "5px 12px",
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  cursor: "pointer",
  transition: "background 0.15s, border-color 0.15s",
  outline: "none",
  WebkitFontSmoothing: "antialiased",
  textRendering: "optimizeLegibility",
};

export function QuickTopics({ onTopicSelect }: QuickTopicsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(5px, 1.5vw, 8px)" }}>
      {topics.map((topic) => {
        const Icon = topic.icon;
        return (
          <button
            key={topic.value}
            style={chipStyle}
            onClick={() => onTopicSelect(topic.value)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--jb-pill-bg)";
              e.currentTarget.style.borderColor = "var(--jb-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--jb-surface)";
              e.currentTarget.style.borderColor = "var(--jb-border-2)";
            }}
          >
            <Icon style={{ width: 12, height: 12, flexShrink: 0 }} />
            {topic.label}
          </button>
        );
      })}
    </div>
  );
}