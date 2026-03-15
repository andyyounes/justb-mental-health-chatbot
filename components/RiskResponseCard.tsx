import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Phone, Heart, AlertTriangle, ExternalLink } from "lucide-react";
import { useState } from "react";

export type RiskLevel = "mild" | "moderate" | "acute";

interface RiskResponseCardProps {
  level: RiskLevel;
  onTryExercise?: () => void;
  onTalkMore?: () => void;
  onCall?: (number: string) => void;
  onAcknowledge?: () => void;
}

export function RiskResponseCard({
  level,
  onTryExercise,
  onTalkMore,
  onCall,
  onAcknowledge,
}: RiskResponseCardProps) {
  const [hasCalledHelp, setHasCalledHelp] = useState(false);

  // Level 1: Mild Risk
  if (level === "mild") {
    return (
      <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-yellow-900 mb-3">
              I hear you're feeling overwhelmed
            </h3>
            <p className="text-gray-700 mb-4">
              It takes courage to share what you're going through. I'm here to support you.
              Would you like to try something that might help you feel more grounded?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={onTryExercise}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                size="lg"
              >
                <Heart className="w-4 h-4 mr-2" />
                Try a Grounding Exercise
              </Button>
              <Button
                onClick={onTalkMore}
                variant="outline"
                className="border-yellow-400 hover:bg-yellow-50"
                size="lg"
              >
                Talk About What's Coming Up
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              You're not alone in this. Many people experience overwhelming feelings,
              and there are ways to work through them.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Level 2: Moderate Risk
  if (level === "moderate") {
    return (
      <Card className="border-2 border-orange-400 bg-gradient-to-br from-orange-50 to-red-50 p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-orange-900 mb-3">
              You're Not Alone
            </h3>
            <p className="text-gray-800 mb-4 font-medium">
              What you're feeling matters, and there are people who want to help.
              These resources are available 24/7:
            </p>

            <div className="bg-white rounded-lg p-4 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    National Suicide Prevention Lifeline
                  </p>
                  <p className="text-sm text-gray-600">Free, confidential support 24/7</p>
                </div>
                <Button
                  onClick={() => onCall?.("988")}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call 988
                </Button>
              </div>

              <div className="border-t pt-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Crisis Text Line</p>
                  <p className="text-sm text-gray-600">Text "HOME" to 741741</p>
                </div>
                <Button
                  onClick={() => {
                    window.open("sms:741741?body=HOME", "_blank");
                  }}
                  variant="outline"
                  className="border-orange-400"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Text
                </Button>
              </div>

              <div className="border-t pt-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">International Resources</p>
                  <p className="text-sm text-gray-600">Find help in your country</p>
                </div>
                <Button
                  onClick={() => {
                    window.open(
                      "https://findahelpline.com/i/iasp",
                      "_blank"
                    );
                  }}
                  variant="outline"
                  className="border-orange-400"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
            </div>

            <Button
              onClick={() => onCall?.("988")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
            >
              <Phone className="w-5 h-5 mr-2" />
              I Can Help You Call
            </Button>

            <p className="text-sm text-gray-700 mt-4 text-center">
              Trained counselors are standing by to listen and support you.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Level 3: Acute Risk
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="border-4 border-red-400 bg-gradient-to-br from-red-50 to-rose-50 p-8 shadow-2xl max-w-2xl w-full">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>

          <div className="bg-red-500 text-white px-6 py-4 rounded-lg mb-6">
            <h2 className="text-2xl font-bold mb-2">
              I'm Very Concerned About Your Safety
            </h2>
            <p className="text-red-50">
              Please reach out for immediate professional support
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6 space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 mb-2">988</p>
              <p className="text-lg font-semibold text-gray-800 mb-1">
                National Suicide Prevention Lifeline
              </p>
              <p className="text-sm text-gray-600">
                Free, confidential support available 24 hours a day, 7 days a week
              </p>
            </div>

            <Button
              onClick={() => {
                window.location.href = "tel:988";
                onCall?.("988");
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-xl animate-pulse"
              size="lg"
            >
              <Phone className="w-6 h-6 mr-3" />
              Call 988 Now
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  window.open("sms:741741?body=HOME", "_blank");
                }}
                variant="outline"
                className="border-2 border-red-300"
              >
                <Phone className="w-4 h-4 mr-2" />
                Text Crisis Line: 741741
              </Button>
              <Button
                onClick={() => {
                  window.location.href = "tel:911";
                }}
                variant="outline"
                className="border-2 border-red-300"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Emergency: 911
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 font-medium mb-2">
              💙 I'll stay here while you call
            </p>
            <p className="text-xs text-blue-800">
              You deserve support from trained professionals who can help you through this.
              This doesn't have to be the end of your story.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
            <Checkbox
              id="help-acknowledge"
              checked={hasCalledHelp}
              onCheckedChange={(checked) => {
                setHasCalledHelp(checked as boolean);
                if (checked) {
                  onAcknowledge?.();
                }
              }}
              className="mt-1"
            />
            <label
              htmlFor="help-acknowledge"
              className="text-sm text-gray-700 cursor-pointer"
            >
              I've reached out for help or I'm safe for now and will reach out if needed
            </label>
          </div>

          {hasCalledHelp && (
            <div className="mt-6">
              <p className="text-green-700 font-medium mb-3">
                Thank you for taking that brave step. 💚
              </p>
              <Button
                onClick={onTalkMore}
                variant="outline"
                className="border-green-400"
              >
                Continue Our Conversation
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Post-Crisis Follow-up Component
interface PostCrisisFollowUpProps {
  userName?: string;
  savedStrategies?: string[];
  onResponse: (response: "better" | "struggling" | "talk") => void;
}

export function PostCrisisFollowUp({
  userName,
  savedStrategies = [],
  onResponse,
}: PostCrisisFollowUpProps) {
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Heart className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-purple-900 mb-2">
            Just Checking In{userName ? `, ${userName}` : ""}
          </h3>
          <p className="text-gray-700 mb-4">
            How have you been since we last talked? I'm here for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Button
              onClick={() => onResponse("better")}
              className="bg-green-500 hover:bg-green-600"
            >
              Doing Better
            </Button>
            <Button
              onClick={() => onResponse("struggling")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Still Struggling
            </Button>
            <Button
              onClick={() => onResponse("talk")}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Want to Talk
            </Button>
          </div>

          {savedStrategies.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Your Saved Coping Strategies:
              </p>
              <div className="flex flex-wrap gap-2">
                {savedStrategies.map((strategy, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs"
                  >
                    {strategy}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Remember: It's okay to not be okay. Healing isn't linear, and you're doing
            your best. 💜
          </p>
        </div>
      </div>
    </Card>
  );
}
