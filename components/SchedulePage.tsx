import { useState, useEffect } from "react";
import {
  Calendar,
  Check,
  ExternalLink,
  Droplet,
  Dumbbell,
  Moon,
  Activity,
  Book,
  Utensils,
  ChevronLeft,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { LogoWidget } from "./JustBLogo";

// ── types ────────────────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  description: string;
  icon: any;
  defaultTime: string;
  duration: number;
  frequency: "once" | "daily" | "weekly";
}

// ── style tokens ─────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: "var(--jb-surface)",
  borderRadius: 16,
  boxShadow: "0 1px 8px var(--jb-card-shadow)",
  padding: "clamp(14px, 4vw, 18px)",
  width: "100%",
  boxSizing: "border-box",
  transition: "box-shadow 0.2s",
};

const sectionLabel: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "var(--jb-text-3)",
  marginBottom: 12,
};

const timePill = (time: string): React.CSSProperties => ({
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--jb-pill-text)",
  background: "var(--jb-pill-bg)",
  borderRadius: 100,
  padding: "2px 10px",
  display: "inline-block",
  whiteSpace: "nowrap",
});

// ── tasks data ───────────────────────────────────────────────────
const recommendedTasks: Task[] = [
  {
    id: "morning-routine",
    title: "Morning Wake-up",
    description: "Set a consistent wake-up time to improve sleep quality",
    icon: Moon,
    defaultTime: "07:00",
    duration: 0,
    frequency: "daily",
  },
  {
    id: "gym",
    title: "Gym Session",
    description: "Physical exercise boosts mood and reduces stress",
    icon: Dumbbell,
    defaultTime: "17:00",
    duration: 60,
    frequency: "daily",
  },
  {
    id: "water-reminder",
    title: "Hourly Water Reminder",
    description: "Stay hydrated throughout the day",
    icon: Droplet,
    defaultTime: "09:00",
    duration: 5,
    frequency: "daily",
  },
  {
    id: "breathing-exercise",
    title: "Box Breathing",
    description: "Daily calming practice to reduce anxiety",
    icon: Activity,
    defaultTime: "12:00",
    duration: 10,
    frequency: "daily",
  },
  {
    id: "journaling",
    title: "Evening Gratitude Journal",
    description: "Reflect on positive moments from your day",
    icon: Book,
    defaultTime: "20:00",
    duration: 15,
    frequency: "daily",
  },
  {
    id: "mindful-eating",
    title: "Mindful Meal Time",
    description: "Eat without distractions, focus on the experience",
    icon: Utensils,
    defaultTime: "12:30",
    duration: 30,
    frequency: "daily",
  },
];

// ── helpers ──────────────────────────────────────────────────────
function formatDateForCalendar(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function createGoogleCalendarLink(task: Task, customTime?: string): string {
  const now = new Date();
  const startTime = customTime || task.defaultTime || "09:00";
  const [hours, minutes] = startTime.split(":").map(Number);

  const startDate = new Date(now);
  startDate.setHours(hours, minutes, 0, 0);
  if (startDate < now) startDate.setDate(startDate.getDate() + 1);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + (task.duration || 30));

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: task.title,
    details: task.description + "\n\n✨ Added from JustB — Your Mental Wellness Companion",
    dates: `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`,
  });

  if (task.frequency === "daily") params.append("recur", "RRULE:FREQ=DAILY");
  else if (task.frequency === "weekly") params.append("recur", "RRULE:FREQ=WEEKLY");

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ── task card ────────────────────────────────────────────────────
function TaskCard({
  task,
  isAdded,
  onAdd,
  onDismiss,
}: {
  task: Task;
  isAdded: boolean;
  onAdd: (t: Task) => void;
  onDismiss: (id: string) => void;
}) {
  const Icon = task.icon;

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: isAdded ? "#d4f5e9" : "#ede8ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.3s",
          }}
        >
          {isAdded ? (
            <Check style={{ width: 18, height: 18, color: "#22c55e" }} />
          ) : (
            <Icon style={{ width: 18, height: 18, color: "#7c3aed" }} />
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: "clamp(13px, 3.5vw, 14px)",
                color: isAdded ? "#22c55e" : "var(--jb-text-2)",
                margin: 0,
                transition: "color 0.3s",
              }}
            >
              {task.title}
            </p>
            {/* Dismiss */}
            {!isAdded && (
              <button
                onClick={() => onDismiss(task.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(140,100,220,0.3)",
                  padding: 2,
                  flexShrink: 0,
                  lineHeight: 1,
                }}
                aria-label="Dismiss"
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          <p
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(11px, 3vw, 12px)",
              color: "var(--jb-text-3)",
              margin: "3px 0 8px",
            }}
          >
            {task.description}
          </p>

          {/* Meta pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            <span style={timePill(task.defaultTime)}>{formatTime(task.defaultTime)}</span>
            {task.duration > 0 && (
              <span style={timePill(task.defaultTime)}>{task.duration} min</span>
            )}
            <span style={timePill(task.defaultTime)}>
              {task.frequency === "daily" ? "daily" : task.frequency}
            </span>
          </div>

          {/* Action */}
          {isAdded ? (
            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 12,
                color: "#22c55e",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 5,
                margin: 0,
              }}
            >
              <Check style={{ width: 13, height: 13 }} /> added to calendar
            </p>
          ) : (
            <button
              onClick={() => onAdd(task)}
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 500,
                fontSize: 12,
                color: "#fff",
                background: "linear-gradient(135deg, #8b6fd4, #6a4fc0)",
                border: "none",
                borderRadius: 100,
                padding: "6px 16px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <Calendar style={{ width: 12, height: 12 }} />
              Add to Calendar
              <ExternalLink style={{ width: 10, height: 10 }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────
interface SchedulePageProps {
  onBack: () => void;
}

export function SchedulePage({ onBack }: SchedulePageProps) {
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());
  const [dismissedTasks, setDismissedTasks] = useState<Set<string>>(new Set());

  const handleAdd = (task: Task) => {
    const link = createGoogleCalendarLink(task);
    window.open(link, "_blank");
    setAddedTasks((prev) => new Set([...prev, task.id]));
    toast.success(`"${task.title}" opened in Google Calendar`);
  };

  const handleDismiss = (id: string) => {
    setDismissedTasks((prev) => new Set([...prev, id]));
  };

  const visibleTasks = recommendedTasks.filter((t) => !dismissedTasks.has(t.id));

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--jb-bg)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        overflowX: "hidden",
        paddingBottom: `calc(env(safe-area-inset-bottom) + 80px)`,
      }}
    >
      {/* ── compact header ── */}
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
        }}
      >
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
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <LogoWidget size={30} />
            <span style={{ fontFamily: "'Black Ops One', 'DM Sans', system-ui, sans-serif", fontWeight: 400, fontSize: 13, color: "var(--jb-text-2)", letterSpacing: "0.2em" }}>
              JUSTB
            </span>
          </div>

          <div style={{ flex: 1 }} />

          <button
            onClick={onBack}
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 500, fontSize: 12,
              color: "var(--jb-text-icon)",
              background: "var(--jb-back-btn-bg)",
              border: "none", borderRadius: 100, padding: "5px 14px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.15)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--jb-back-btn-bg)")}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} /> Chat
          </button>
        </div>
      </div>

      {/* ── content ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          margin: "0 auto",
          padding: "20px clamp(12px, 4vw, 20px) 32px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Page title */}
        <div>
          <p style={sectionLabel}>Schedule</p>
          <h1
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(20px, 5vw, 24px)",
              color: "var(--jb-text-2)",
              margin: 0,
            }}
          >
            wellness tasks
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 13,
              color: "var(--jb-text-3)",
              marginTop: 4,
            }}
          >
            small habits add up — pick one to start
          </p>
        </div>

        {/* Task list */}
        <div>
          <p style={sectionLabel}>recommended for you</p>
          {visibleTasks.length === 0 ? (
            <div
              style={{
                ...cardStyle,
                textAlign: "center",
                padding: "32px 20px",
              }}
            >
              <p style={{ fontSize: 28, margin: "0 0 8px" }}>✦</p>
              <p
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  color: "var(--jb-text-3)",
                  margin: 0,
                }}
              >
                nothing scheduled yet. add something small ✦
              </p>
              {dismissedTasks.size > 0 && (
                <button
                  onClick={() => setDismissedTasks(new Set())}
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: 12,
                    color: "var(--jb-text-icon)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginTop: 12,
                    textDecoration: "underline",
                  }}
                >
                  show all tasks
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isAdded={addedTasks.has(task.id)}
                  onAdd={handleAdd}
                  onDismiss={handleDismiss}
                />
              ))}
              {dismissedTasks.size > 0 && (
                <button
                  onClick={() => setDismissedTasks(new Set())}
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: 12,
                    color: "var(--jb-text-3)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0",
                    textDecoration: "underline",
                    textAlign: "center",
                  }}
                >
                  show {dismissedTasks.size} hidden task{dismissedTasks.size > 1 ? "s" : ""}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Google Calendar tip */}
        <div
          style={{
            ...cardStyle,
            background: "var(--jb-pill-bg)",
            boxShadow: "none",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Calendar style={{ width: 20, height: 20, color: "var(--jb-text-icon)", flexShrink: 0 }} />
          <p
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 12,
              color: "var(--jb-text-icon)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            tapping <strong>Add to Calendar</strong> opens Google Calendar in a new tab so you can confirm the event.
          </p>
        </div>
      </div>

      {/* ── floating add button ── */}
      <div
        style={{
          position: "fixed",
          bottom: `calc(env(safe-area-inset-bottom) + 20px)`,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
        }}
      >
        <button
          onClick={() => {
            // scroll to top of task list
            window.scrollTo({ top: 0, behavior: "smooth" });
            toast.info("tap any task above to add it to your calendar");
          }}
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: "#fff",
            background: "linear-gradient(135deg, #8b6fd4, #6a4fc0)",
            border: "none",
            borderRadius: 100,
            padding: "12px 28px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 20px rgba(109,40,217,0.35)",
            transition: "opacity 0.15s, transform 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "translateX(-50%) scale(1.03)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateX(-50%) scale(1)";
          }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          add a task
        </button>
      </div>
    </div>
  );
}
