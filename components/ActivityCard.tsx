import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface ActivityCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  steps?: string[];
  onStart?: () => void;
}

export function ActivityCard({ title, description, icon: Icon, color, steps, onStart }: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow border-l-4 ${color}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`w-6 h-6 ${color.replace('border-', 'text-')}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          
          {steps && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mb-3"
            >
              {isExpanded ? "Hide Steps" : "Show Steps"}
            </Button>
          )}

          {isExpanded && steps && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <ol className="text-sm text-gray-700 space-y-2">
                {steps.map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-purple-500 shrink-0">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {onStart && (
            <Button
              onClick={onStart}
              size="sm"
              className={`${color.replace('border-', 'bg-')} hover:opacity-90 text-white`}
            >
              Try Now
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
