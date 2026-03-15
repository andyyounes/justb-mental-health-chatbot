import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar, Check, X, ExternalLink, Droplet, Dumbbell, Moon, Activity, Book, Utensils } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Task {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  defaultTime?: string;
  duration?: number; // in minutes
  frequency?: "once" | "daily" | "weekly";
}

const recommendedTasks: Task[] = [
  {
    id: "morning-routine",
    title: "Morning Wake-up Time",
    description: "Set a consistent wake-up time to improve sleep quality",
    icon: Moon,
    color: "bg-indigo-100 text-indigo-600",
    defaultTime: "07:00",
    duration: 0,
    frequency: "daily",
  },
  {
    id: "gym",
    title: "Gym Session",
    description: "Physical exercise boosts mood and reduces stress",
    icon: Dumbbell,
    color: "bg-red-100 text-red-600",
    defaultTime: "17:00",
    duration: 60,
    frequency: "daily",
  },
  {
    id: "water-reminder",
    title: "Hourly Water Reminder",
    description: "Stay hydrated throughout the day",
    icon: Droplet,
    color: "bg-blue-100 text-blue-600",
    defaultTime: "09:00",
    duration: 5,
    frequency: "daily",
  },
  {
    id: "breathing-exercise",
    title: "Box Breathing Practice",
    description: "Daily calming exercise to reduce anxiety",
    icon: Activity,
    color: "bg-purple-100 text-purple-600",
    defaultTime: "12:00",
    duration: 10,
    frequency: "daily",
  },
  {
    id: "journaling",
    title: "Evening Gratitude Journal",
    description: "Reflect on positive moments from your day",
    icon: Book,
    color: "bg-pink-100 text-pink-600",
    defaultTime: "20:00",
    duration: 15,
    frequency: "daily",
  },
  {
    id: "mindful-eating",
    title: "Mindful Meal Time",
    description: "Eat without distractions, focus on the experience",
    icon: Utensils,
    color: "bg-green-100 text-green-600",
    defaultTime: "12:30",
    duration: 30,
    frequency: "daily",
  },
];

function formatDateForCalendar(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function createGoogleCalendarLink(task: Task, customTime?: string): string {
  const now = new Date();
  const startTime = customTime || task.defaultTime || "09:00";
  const [hours, minutes] = startTime.split(":").map(Number);
  
  const startDate = new Date(now);
  startDate.setHours(hours, minutes, 0, 0);
  
  // If the time has passed today, schedule for tomorrow
  if (startDate < now) {
    startDate.setDate(startDate.getDate() + 1);
  }
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + (task.duration || 30));
  
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: task.title,
    details: task.description + "\n\n✨ Added from MindfulChat - Your Mental Wellness Companion",
    dates: `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`,
  });

  // Add recurrence for daily/weekly tasks
  if (task.frequency === "daily") {
    params.append("recur", "RRULE:FREQ=DAILY");
  } else if (task.frequency === "weekly") {
    params.append("recur", "RRULE:FREQ=WEEKLY");
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function TaskRecommendations() {
  const [acceptedTasks, setAcceptedTasks] = useState<Set<string>>(new Set());
  const [declinedTasks, setDeclinedTasks] = useState<Set<string>>(new Set());

  const handleAccept = (task: Task) => {
    const calendarLink = createGoogleCalendarLink(task);
    window.open(calendarLink, "_blank");
    setAcceptedTasks(prev => new Set([...prev, task.id]));
    toast.success(`Added "${task.title}" to your calendar!`, {
      description: "The event has been opened in Google Calendar",
    });
  };

  const handleDecline = (taskId: string) => {
    setDeclinedTasks(prev => new Set([...prev, taskId]));
    toast.info("Task declined", {
      description: "You can always add it later",
    });
  };

  const handleReset = (taskId: string) => {
    setAcceptedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    setDeclinedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  };

  const visibleTasks = recommendedTasks.filter(
    task => !declinedTasks.has(task.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-600" />
        <h2 className="text-purple-800">Recommended Wellness Tasks</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Build healthy habits by scheduling these activities in your calendar. Click "Add to Calendar" to create the event in Google Calendar.
      </p>

      <div className="grid gap-3">
        {visibleTasks.map((task) => {
          const Icon = task.icon;
          const isAccepted = acceptedTasks.has(task.id);

          return (
            <Card
              key={task.id}
              className={`p-4 transition-all ${
                isAccepted ? "border-green-500 bg-green-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${task.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-800 mb-1">{task.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mb-3">
                    <span>⏰ {task.defaultTime}</span>
                    {task.duration && task.duration > 0 && (
                      <span>• {task.duration} min</span>
                    )}
                    {task.frequency === "daily" && (
                      <span>• Daily</span>
                    )}
                  </div>

                  {isAccepted ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Check className="w-4 h-4" />
                        <span>Added to calendar</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReset(task.id)}
                        className="text-xs h-7"
                      >
                        Reset
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleAccept(task)}
                        size="sm"
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Add to Calendar
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                      <Button
                        onClick={() => handleDecline(task.id)}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Not Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {declinedTasks.size > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeclinedTasks(new Set())}
          className="w-full text-gray-500"
        >
          Show declined tasks ({declinedTasks.size})
        </Button>
      )}
    </div>
  );
}