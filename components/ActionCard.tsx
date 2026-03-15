import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Check, X, Sparkles, Calendar, Phone } from "lucide-react";

export interface ActionItem {
  id: string;
  type: "exercise" | "task" | "breathing" | "emergency";
  title: string;
  description: string;
  duration?: string;
  time?: string;
}

interface ActionCardProps {
  action: ActionItem;
  onAccept: (action: ActionItem) => void;
  onDecline: (action: ActionItem) => void;
}

export function ActionCard({ action, onAccept, onDecline }: ActionCardProps) {
  const isEmergency = action.type === "emergency";
  const isExercise = action.type === "exercise";

  const Icon = isEmergency ? Phone : isExercise ? Sparkles : Calendar;

  const bgColor = isEmergency
    ? "bg-red-50"
    : isExercise
    ? "bg-purple-50"
    : "bg-blue-50";

  const borderColor = isEmergency
    ? "border-red-300"
    : isExercise
    ? "border-purple-200"
    : "border-blue-200";

  const textColor = isEmergency
    ? "text-red-700"
    : isExercise
    ? "text-purple-700"
    : "text-blue-700";

  const iconBg = isEmergency
    ? "bg-red-100"
    : isExercise
    ? "bg-purple-100"
    : "bg-blue-100";

  const acceptBg = isEmergency
    ? "bg-red-600 hover:bg-red-700"
    : isExercise
    ? "bg-purple-500 hover:bg-purple-600"
    : "bg-blue-500 hover:bg-blue-600";

  return (
    <Card className={`${bgColor} ${borderColor} border-2 p-4 space-y-3`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${textColor}`}>{action.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{action.description}</p>
          {action.duration && (
            <p className="text-xs text-gray-500 mt-1">Duration: {action.duration}</p>
          )}
          {action.time && (
            <p className="text-xs text-gray-500 mt-1">Suggested time: {action.time}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onAccept(action)}
          className={`flex-1 text-white ${acceptBg}`}
          size="sm"
        >
          <Check className="w-4 h-4 mr-1" />
          {isEmergency ? "Call Now" : "Accept"}
        </Button>
        <Button
          onClick={() => onDecline(action)}
          variant="outline"
          size="sm"
          className="border-gray-300"
        >
          <X className="w-4 h-4 mr-1" />
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
