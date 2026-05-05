// FULLY REWRITTEN App.tsx — Clean, Stable, and Complete
// Includes: Authentication handling, logout, clear history fix, breathing pop-up, session logic, routing.
// --- This version is COMPLETE and ready to run. ---

import { useState, useRef, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { ChatMessage } from "./components/ChatMessage";
import { BoxBreathing } from "./components/BoxBreathing";
import { QuickTopics } from "./components/QuickTopics";
import { ActivitiesPage } from "./components/ActivitiesPage";
import { TaskRecommendations } from "./components/TaskRecommendations";
import { SchedulePage } from "./components/SchedulePage";
import { ChatHistorySidebar, ChatSession } from "./components/ChatHistorySidebar";
import { ActionItem } from "./components/ActionCard";
import { CrisisEmergencyModal } from "./components/CrisisEmergencyModal";
import { CrisisCallWidget } from "./components/CrisisCallWidget";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { LogoWidget, JustBLogo } from "./components/JustBLogo";
import { ChatBackground } from "./components/ChatBackground";
import { MoodCheckIn } from "./components/MoodCheckIn";
import { DailyAffirmation } from "./components/DailyAffirmation";
import {
  Send,
  Sparkles,
  Calendar,
  ArrowLeft,
  Trash2,
  Menu,
  LogOut,
  Sun,
  Moon,
  Mic,
  MicOff,
} from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { projectId } from "./utils/supabase/info";
import { addToCalendar } from "./utils/calendar";

// ====== TYPES ======
interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
  actions?: ActionItem[];
  type?: "breathing" | "grounding" | "normal";
  riskLevel?: "mild" | "moderate" | "acute";
  isPostCrisis?: boolean;
}

// ====== APP START ======
export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<
    "chat" | "activities" | "tasks"
  >("chat");
  const [activitiesExercise, setActivitiesExercise] = useState<string | null>(null); // exercise to auto-launch
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutPopover, setShowLogoutPopover] = useState(false);
  // Theme: "system" | "light" | "dark"
  const [themeMode, setThemeMode] = useState<"system" | "light" | "dark">(() => {
    return (localStorage.getItem("justb_theme") as any) || "system";
  });
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showCrisisWidget, setShowCrisisWidget] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  // Visual viewport height — drives root container so keyboard pushes layout up
  const [vvHeight, setVvHeight] = useState(() =>
    typeof window !== "undefined"
      ? (window.visualViewport?.height ?? window.innerHeight)
      : 600
  );
  // ── New feature states ──
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ====== FAVICON — JustB planet logo (onboarding dark style) ======
  useEffect(() => {
    const svgFavicon = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 110 110" fill="none">',
      '<defs>',
      '<radialGradient id="fpg" cx="40%" cy="34%" r="70%">',
      '<stop offset="0%" stop-color="#ddd0ff"/>',
      '<stop offset="28%" stop-color="#9060e0"/>',
      '<stop offset="68%" stop-color="#5828a8"/>',
      '<stop offset="100%" stop-color="#100620"/>',
      '</radialGradient>',
      '<linearGradient id="frl1" x1="0%" y1="0%" x2="100%" y2="100%">',
      '<stop offset="0%" stop-color="#8b6fd4" stop-opacity="0"/>',
      '<stop offset="18%" stop-color="#ffffff" stop-opacity="0.95"/>',
      '<stop offset="50%" stop-color="#c4b0f7" stop-opacity="1"/>',
      '<stop offset="82%" stop-color="#ffffff" stop-opacity="0.95"/>',
      '<stop offset="100%" stop-color="#8b6fd4" stop-opacity="0"/>',
      '</linearGradient>',
      '<linearGradient id="frl2" x1="0%" y1="0%" x2="100%" y2="100%">',
      '<stop offset="0%" stop-color="#a484e8" stop-opacity="0"/>',
      '<stop offset="20%" stop-color="#d8d0f8" stop-opacity="0.88"/>',
      '<stop offset="50%" stop-color="#f0ecff" stop-opacity="0.94"/>',
      '<stop offset="80%" stop-color="#d8d0f8" stop-opacity="0.88"/>',
      '<stop offset="100%" stop-color="#a484e8" stop-opacity="0"/>',
      '</linearGradient>',
      '<clipPath id="fth"><rect x="0" y="0" width="110" height="55"/></clipPath>',
      '<clipPath id="fbh"><rect x="0" y="55" width="110" height="55"/></clipPath>',
      '<clipPath id="fop"><path d="M0 0 H110 V110 H0 Z M55 54 m-29 0 a29 29 0 1 0 58 0 a29 29 0 1 0 -58 0"/></clipPath>',
      '</defs>',
      '<rect width="110" height="110" rx="24" fill="#060410"/>',
      '<circle cx="10" cy="14" r="1" fill="white" opacity="0.6"/>',
      '<circle cx="95" cy="12" r="0.8" fill="#c4b0f7" opacity="0.7"/>',
      '<circle cx="100" cy="88" r="1" fill="white" opacity="0.6"/>',
      '<circle cx="12" cy="90" r="0.8" fill="#c4b0f7" opacity="0.55"/>',
      '<circle cx="55" cy="6" r="0.6" fill="white" opacity="0.5"/>',
      '<path d="M90 28 L91.2 31.5 L95 32.5 L91.2 33.5 L90 37 L88.8 33.5 L85 32.5 L88.8 31.5Z" fill="#c4b0f7" opacity="0.55"/>',
      '<g clip-path="url(#fth)" opacity="0.38">',
      '<ellipse cx="55" cy="54" rx="51" ry="15" fill="none" stroke="url(#frl2)" stroke-width="3"/>',
      '<ellipse cx="55" cy="54" rx="42" ry="12" fill="none" stroke="url(#frl1)" stroke-width="5"/>',
      '</g>',
      '<circle cx="55" cy="54" r="29" fill="url(#fpg)"/>',
      '<circle cx="42" cy="40" r="4.5" fill="white" opacity="0.22"/>',
      '<circle cx="38" cy="36" r="2.2" fill="white" opacity="0.3"/>',
      '<g clip-path="url(#fbh)">',
      '<ellipse cx="55" cy="54" rx="51" ry="15" fill="none" stroke="url(#frl2)" stroke-width="3" opacity="0.88"/>',
      '<ellipse cx="55" cy="54" rx="42" ry="12" fill="none" stroke="url(#frl1)" stroke-width="5" opacity="0.98"/>',
      '</g>',
      '<g clip-path="url(#fop)"><g clip-path="url(#fth)">',
      '<ellipse cx="55" cy="54" rx="51" ry="15" fill="none" stroke="url(#frl2)" stroke-width="3" opacity="0.85"/>',
      '<ellipse cx="55" cy="54" rx="42" ry="12" fill="none" stroke="url(#frl1)" stroke-width="5" opacity="0.95"/>',
      '</g></g>',
      '<g clip-path="url(#fbh)">',
      '<path id="ftp" d="M14 54 Q55 72 96 54" fill="none"/>',
      '<text font-family="Black Ops One, sans-serif" font-size="7" letter-spacing="4" fill="white" opacity="0.95">',
      '<textPath href="#ftp" startOffset="10%">J U S T B</textPath>',
      '</text>',
      '</g>',
      '</svg>',
    ].join('');

    const encoded = 'data:image/svg+xml,' + encodeURIComponent(svgFavicon);
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = encoded;
    document.title = 'JustB';
  }, []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load DM Sans for chat UI
  useEffect(() => {
    // 1. Ensure viewport-fit=cover so env(safe-area-inset-*) works on real iPhones
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (existingViewport) {
      existingViewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, viewport-fit=cover"
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1, viewport-fit=cover";
      document.head.appendChild(meta);
    }

    // 2. Load DM Sans
    if (!document.querySelector("#justb-dmfont")) {
      const link = document.createElement("link");
      link.id = "justb-dmfont";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // ── Visual Viewport: track soft keyboard on mobile ──────────────────
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => {
      const offset = Math.max(0, window.innerHeight - vv.offsetTop - vv.height);
      setKeyboardOffset(offset);
      // When keyboard opens, scroll to the latest message so it's visible
      if (offset > 0) {
        setTimeout(scrollToBottom, 60);
      }
      setVvHeight(vv.height);
    };
    vv.addEventListener("resize", handler);
    vv.addEventListener("scroll", handler);
    return () => {
      vv.removeEventListener("resize", handler);
      vv.removeEventListener("scroll", handler);
    };
  }, []);

  // ── Auto-resize textarea when input changes ─────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 112) + "px";
  }, [input]);

  // ── Apply theme to document root ──────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (themeMode === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("justb_theme", themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === "system") return "dark";
      if (prev === "dark") return "light";
      return "system";
    });
  };

  // Is current effective mode dark? (for icon display)
  const isDark = themeMode === "dark" ||
    (themeMode === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // ====== MERGE MESSAGES (preserve actions already rendered) ======
  const mergeMessagesPreservingActions = (
    incoming: Message[],
    previous: Message[]
  ) => {
    const map = new Map<string, Message>();
    previous.forEach((msg) => {
      const key = `${msg.text}|${msg.isBot}|${msg.timestamp}`;
      map.set(key, msg);
    });

    return incoming.map((msg) => {
      const key = `${msg.text}|${msg.isBot}|${msg.timestamp}`;
      const old = map.get(key);
      if (old) return { ...msg, id: old.id, actions: old.actions };
      return msg;
    });
  };

  // =================================================================
  // Check for existing session on mount (same as reference)
  // =================================================================
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem("justb_access_token");
      const storedUsername = localStorage.getItem("justb_username");
      const storedDisplayName = localStorage.getItem("justb_display_name");
      const storedUserId = localStorage.getItem("justb_user_id");

      if (storedToken && storedUsername && storedDisplayName && storedUserId) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-97cb3ddd/session`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${storedToken}` },
            }
          );

          if (response.ok) {
            setAccessToken(storedToken);
            setUsername(storedUsername);
            setDisplayName(storedDisplayName);
            setUserId(storedUserId);
            setIsAuthenticated(true);
            await loadChatSessions(storedToken);
          } else {
            localStorage.removeItem("justb_access_token");
            localStorage.removeItem("justb_username");
            localStorage.removeItem("justb_display_name");
            localStorage.removeItem("justb_user_id");
            setIsLoadingHistory(false);
          }
        } catch (error) {
          console.error("Session validation error:", error);
          setIsLoadingHistory(false);
        }
      } else {
        setIsLoadingHistory(false);
      }
    };

    checkSession();
  }, []);

  // =================================================================
  // Load all chat sessions
  // =================================================================
  const loadChatSessions = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-97cb3ddd/chat/sessions`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const sessions: ChatSession[] = data.sessions.map((s: any) => ({
          id: s.id,
          title: s.title,
          lastMessage: s.lastMessage,
          timestamp: new Date(s.updatedAt).toLocaleDateString(),
          messageCount: s.messageCount,
        }));

        setChatSessions(sessions);

        if (sessions.length > 0) {
          await loadSessionMessages(token, sessions[0].id);
          setCurrentSessionId(sessions[0].id);
        } else {
          await createNewSession(token);
        }
      }

      setIsLoadingHistory(false);
    } catch (error) {
      console.error("Error loading chat sessions:", error);
      setIsLoadingHistory(false);
    }
  };

  // =================================================================
  // Create a new chat session
  // =================================================================
  const createNewSession = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-97cb3ddd/chat/sessions/new`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();

        const newSession: ChatSession = {
          id: data.session.id,
          title: data.session.title,
          lastMessage: "",
          timestamp: new Date(data.session.updatedAt).toLocaleDateString(),
          messageCount: 0,
        };

        setChatSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);

        // Inactivity check: if last chat > 3 days ago, use a warm nudge
        const lastChat = localStorage.getItem("justb_last_chat");
        const daysSince = lastChat
          ? (Date.now() - parseInt(lastChat)) / (1000 * 60 * 60 * 24)
          : 999;
        const welcomeText = daysSince > 3
          ? "haven't seen you in a bit — how have you been holding up? 💙"
          : "hey, good to see you.\n\nwhat's on your mind today?";

        setMessages([
          {
            id: "1",
            text: welcomeText,
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        // Show mood check-in for every new session
        setShowMoodCheckIn(true);
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  // =================================================================
  // Load messages for a specific session
  // =================================================================
  const loadSessionMessages = async (token: string, sessionId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-97cb3ddd/chat/sessions/${sessionId}/messages`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
          setMessages((prev) =>
            mergeMessagesPreservingActions(data.messages, prev)
          );
          setShowMoodCheckIn(false); // existing session — skip mood check-in
        } else {
          setMessages([
            {
              id: "1",
              text: "hey, good to see you.\n\nwhat's on your mind today?",
              isBot: true,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
          setShowMoodCheckIn(true);
        }
      }
    } catch (error) {
      console.error("Error loading session messages:", error);
    }
  };

  // =================================================================
  // Save message to history (same idea as reference)
  // =================================================================
  const saveMessage = async (
    message: string,
    isBot: boolean,
    timestamp: string
  ) => {
    if (!accessToken || !currentSessionId) return;

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-97cb3ddd/chat/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            sessionId: currentSessionId,
            message,
            isBot,
            timestamp,
          }),
        }
      );

      // Update session metadata locally (don't reload all sessions — that resets currentSessionId)
      setChatSessions(prev =>
        prev.map(s =>
          s.id === currentSessionId
            ? { ...s, messageCount: s.messageCount + 1, timestamp: new Date().toLocaleDateString() }
            : s
        )
      );
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  // =================================================================
  // Breathing intent detection
  // =================================================================
  const detectBreathingIntent = (text: string) => {
    const triggers = [
      "breathing",
      "breath",
      "breathe",
      "calm down",
      "relaxation",
      "respiration",
    ];
    return triggers.some((word) => text.toLowerCase().includes(word));
  };

  // =================================================================
  // Handle sending message with Groq LLM
  // =================================================================
  const handleSendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || !accessToken) return;

    // Haptic feedback on mobile
    if (navigator.vibrate) navigator.vibrate([10]);

    // If breathing intent -> show action card
    if (!overrideText && detectBreathingIntent(text)) {
      const breatheMessage: Message = {
        id: Date.now().toString(),
        text: "Would you like to try a guided breathing exercise?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        actions: [
          {
            id: "breathingStart",
            type: "breathing",
            title: "Start Breathing Exercise",
            description: "A short guided breathing session.",
          },
        ],
      };

      setMessages((prev) => [...prev, breatheMessage]);
      if (!overrideText) setInput("");
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp,
    };

    // Optimistic: add to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    if (!overrideText) setInput("");
    setIsTyping(true);

    // Track last chat timestamp for inactivity nudge
    localStorage.setItem("justb_last_chat", Date.now().toString());

    // Save user message — fire and forget (no await)
    saveMessage(userMessage.text, false, timestamp);

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.isBot ? "assistant" : "user",
        content: msg.text,
      }));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-97cb3ddd/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: text,
            chatHistory,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Chat API error response:", data);
        throw new Error(data.error || "Failed to get response");
      }

      const botTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isBot: true,
        timestamp: botTimestamp,
        actions: data.actions,
      };

      setMessages((prev) => [...prev, botMessage]);
      saveMessage(data.response, true, botTimestamp); // fire and forget
      setIsTyping(false);

      // Crisis flagging
      if (data.crisisLevel >= 2) {
        setChatSessions(prev => prev.map(s =>
          s.id === currentSessionId ? { ...s, hasCrisis: true } : s
        ));
      }
      // Tier 3 crisis: show undismissable emergency modal
      if (data.crisisLevel === 3) {
        setShowEmergencyModal(true);
      }
    } catch (error) {
      console.error("Chat error:", error);

      const errTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        isBot: true,
        timestamp: errTimestamp,
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
      toast.error("Failed to get response. Please try again.");
    }
  };

  // ── Mood check-in handler ────────────────────────────────────────────
  const handleMoodSelect = (mood: string, emoji: string) => {
    setShowMoodCheckIn(false);
    handleSendMessage(`feeling ${mood} ${emoji}`);
  };

  const handleTopicSelect = (topic: string) => {
    handleSendMessage(topic);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── Voice input ───────────────────────────────────────────────────────
  const toggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }

    // ── Detect iframe sandbox (Figma Make preview runs in an iframe that
    //    blocks mic access). Prompt the user to open in a new tab instead. ──
    const isInIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();

    if (isInIframe) {
      toast("Mic blocked by preview sandbox", {
        description: "Open the app in a new tab — voice input works there.",
        duration: 8000,
        action: {
          label: "Open in new tab ↗",
          onClick: () => window.open(window.location.href, "_blank"),
        },
      });
      return;
    }

    // If already listening, stop gracefully
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    // Abort any stale instance before starting fresh
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    // ── Set isListening AFTER the browser confirms it started ──
    recognition.onstart = () => {
      setIsListening(true);
      if (navigator.vibrate) navigator.vibrate([8]);
    };

    recognition.onresult = (e: any) => {
      const transcript = e.results[0]?.[0]?.transcript;
      if (transcript) {
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        if (navigator.vibrate) navigator.vibrate([6]);
        // Auto-focus textarea so user can review / hit send
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    };

    // ── Capture the error event so we can give specific feedback ──
    recognition.onerror = (e: any) => {
      console.error("SpeechRecognition error:", e.error);
      const errorMessages: Record<string, string> = {
        "not-allowed":         "Microphone access denied — allow it in your browser settings and try again.",
        "audio-capture":       "No microphone found. Please check your device.",
        "no-speech":           "No speech detected. Please try again.",
        "network":             "Network error during voice input. Check your connection.",
        "service-not-allowed": "Voice input is blocked here — try opening in a new tab.",
        "aborted":             "", // user-triggered stop — no toast needed
      };
      const msg = errorMessages[e.error as string];
      if (msg === undefined) toast.error(`Voice input error: ${e.error}`);
      else if (msg) toast.error(msg);
      // cleanup is handled by onend which always fires after onerror
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    // ── Wrap start() in try/catch — it throws synchronously in some browsers ──
    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error("SpeechRecognition start error:", err);
      toast.error("Could not start voice input — please try again.");
      setIsListening(false);
      recognitionRef.current = null;
    }
  };
  
  // =================================================================
  // LOGOUT (same format/place as reference)
  // =================================================================
  const handleLogout = async () => {
    if (!accessToken) return;

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-97cb3ddd/logout`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear local storage
    localStorage.removeItem("justb_access_token");
    localStorage.removeItem("justb_username");
    localStorage.removeItem("justb_display_name");
    localStorage.removeItem("justb_user_id");

    // Reset state
    setIsAuthenticated(false);
    setAccessToken(null);
    setUsername("");
    setDisplayName("");
    setUserId("");
    setMessages([]);
    setHasEntered(false);

    toast.success("Logged out successfully");
  };

const handleClearHistory = async () => {
  if (!accessToken || !currentSessionId) return;

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-97cb3ddd/chat/sessions/${currentSessionId}/messages/clear`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      setMessages([
        {
          id: "1",
          text: "Hello! I'm your mental wellness companion powered by AI.",
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      toast.success("Chat history cleared!");
    } else {
      toast.error("Failed to clear chat history");
    }
  } catch (err) {
    console.error(err);
    toast.error("Clear history failed");
  }
};


  const handleAuthSuccess = (
    token: string,
    user: string,
    display: string,
    id: string
  ) => {
    setAccessToken(token);
    setUsername(user);
    setDisplayName(display);
    setUserId(id);
    setIsAuthenticated(true);
    setIsLoadingHistory(false);
    loadChatSessions(token);
  };

  // Handle session selection
  const handleSelectSession = async (sessionId: string) => {
    if (!accessToken) return;

    setCurrentSessionId(sessionId);
    await loadSessionMessages(accessToken, sessionId);
    setIsSidebarOpen(false);
    toast.success("Chat session loaded");
  };

  // Handle new chat creation
  const handleNewChat = async () => {
    if (!accessToken) return;

    await createNewSession(accessToken);
    setIsSidebarOpen(false);
    toast.success("New chat started!");
  };

  // =================================================================
  // ACTION HANDLING (exercise + task + breathing)
  // =================================================================
  const handleAcceptAction = (action: ActionItem) => {
    if (action.type === "breathing") {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Starting your guided breathing exercise...",
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "breathing",
        },
      ]);
      return;
    }

    if (action.type === "emergency") {
      setShowCrisisWidget(true);
      return;
    }

    if (action.type === "exercise") {
      // Map action ID → specific exercise key in ActivitiesPage
      const EXERCISE_MAP: Record<string, string> = {
        "478-breathing":     "box-breathing",
        "box-breathing":     "box-breathing",
        "sleep-breathing":   "box-breathing",
        "cooling-breath":    "box-breathing",
        "energizing-breath": "box-breathing",
        "grounding":         "grounding",
        "visualization":     "visualization",
        "safe-place":        "visualization",
        "pmr":               "pmr",
        "body-scan":         "pmr",
        "gentle-movement":   "pmr",
        "mindful-walk":      "pmr",
        "gratitude":         "journaling",
        "self-compassion":   "journaling",
        "findahelpline":     "", // no exercise to launch
      };
      const exerciseKey = EXERCISE_MAP[action.id] ?? null;
      setActivitiesExercise(exerciseKey || null);
      setCurrentPage("activities");
      return;
    }

    if (action.type === "task") {
      addToCalendar({
        title: action.title,
        description: action.description,
        startTime: action.time,
        duration: 30,
      });
      toast.success(`${action.title} added to your calendar!`);
      return;
    }
  };

  const handleDeclineAction = () => {
    toast.info("No problem! Let me know if you'd like to try something else.");
  };

  // =================================================================
  // RENDER (same order as reference)
  // =================================================================
  if (!hasEntered) {
    return <LandingPage onEnter={() => setHasEntered(true)} />;
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (isLoadingHistory) {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--jb-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <LogoWidget size={56} />
          <p style={{ color: "var(--jb-text-3)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>Loading your wellness space...</p>
        </div>
      </div>
    );
  }

  if (currentPage === "activities") {
    return (
      <ActivitiesPage
        onBack={() => { setCurrentPage("chat"); setActivitiesExercise(null); }}
        onNavigateToTasks={() => setCurrentPage("tasks")}
        startExercise={activitiesExercise}
      />
    );
  }

  if (currentPage === "tasks") {
    return (
      <>
        <SchedulePage onBack={() => setCurrentPage("chat")} />
        <Toaster />
      </>
    );
  }

  // =================================================================
  // MAIN CHAT UI
  // =================================================================
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--jb-bg)",
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
      } as React.CSSProperties}
    >
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        sessions={chatSessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onClose={() => setIsSidebarOpen(false)}
        isOpen={isSidebarOpen}
        onNavigateActivities={() => setCurrentPage("activities")}
        onNavigateSchedule={() => setCurrentPage("tasks")}
        onLogout={handleLogout}
        displayName={displayName || username}
        accessToken={accessToken}
        isLoading={isLoadingHistory}
        onSessionDeleted={(sessionId) => {
          setChatSessions(prev => prev.filter(s => s.id !== sessionId));
          if (currentSessionId === sessionId) {
            setCurrentSessionId(null);
            setMessages([]);
          }
        }}
        onSessionRenamed={(sessionId, newTitle) => {
          setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));
        }}
      />

      {/* ── Floating X — only visible when sidebar is open, no background bar ── */}
      <button
        onClick={() => setIsSidebarOpen(false)}
        aria-label="Close menu"
        style={{
          position: "fixed",
          top: "max(env(safe-area-inset-top), 59px)",
          left: "clamp(10px, 3vw, 16px)",
          zIndex: 200,
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          gap: 0,
          opacity: isSidebarOpen ? 1 : 0,
          pointerEvents: isSidebarOpen ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
      >
        {/* Bar 1 → top arm of X */}
        <span style={{
          display: "block", width: 20, height: 2, borderRadius: 2,
          background: "var(--jb-text-icon)", margin: "2px 0",
          transform: isSidebarOpen ? "translateY(6px) rotate(45deg)" : "translateY(0) rotate(0deg)",
          transition: "transform 0.28s cubic-bezier(.4,0,.2,1)",
          transformOrigin: "center",
        }} />
        {/* Bar 2 → disappears */}
        <span style={{
          display: "block", width: 20, height: 2, borderRadius: 2,
          background: "var(--jb-text-icon)", margin: "2px 0",
          transform: isSidebarOpen ? "scaleX(0)" : "scaleX(1)",
          opacity: isSidebarOpen ? 0 : 1,
          transition: "transform 0.28s cubic-bezier(.4,0,.2,1), opacity 0.18s",
          transformOrigin: "center",
        }} />
        {/* Bar 3 → bottom arm of X */}
        <span style={{
          display: "block", width: 20, height: 2, borderRadius: 2,
          background: "var(--jb-text-icon)", margin: "2px 0",
          transform: isSidebarOpen ? "translateY(-6px) rotate(-45deg)" : "translateY(0) rotate(0deg)",
          transition: "transform 0.28s cubic-bezier(.4,0,.2,1)",
          transformOrigin: "center",
        }} />
      </button>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-hidden">
        {/* ── Sticky header — hidden entirely when sidebar open ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            flexShrink: 0,
            background: "var(--jb-header-bg)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid var(--jb-border)",
            maxHeight: isSidebarOpen ? 0 : 200,
            overflow: "hidden",
            opacity: isSidebarOpen ? 0 : 1,
            pointerEvents: isSidebarOpen ? "none" : "auto",
            transition: "max-height 0.28s cubic-bezier(.4,0,.2,1), opacity 0.22s ease",
          } as React.CSSProperties}
        >
          {/* Row 1: hamburger | JustB | avatar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            paddingTop: "max(env(safe-area-inset-top), 59px)",
            paddingInline: "clamp(10px, 3vw, 16px)",
            paddingBottom: 8,
            gap: 10,
          }}>
            {/* Hamburger */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: "transparent", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: 0, gap: 0, flexShrink: 0,
              }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: "block", width: 20, height: 2, borderRadius: 2,
                  background: "var(--jb-text-icon)", margin: "2px 0",
                }} />
              ))}
            </button>

            {/* JustB logo widget — planet + JUSTB text */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LogoWidget size={36} />
              <span style={{
                fontFamily: "'Black Ops One', 'DM Sans', system-ui, sans-serif",
                fontWeight: 400, fontSize: 14,
                color: "var(--jb-text-2)", letterSpacing: "0.2em",
              }}>
                JUSTB
              </span>
            </div>

            {/* Spacer pushes avatar to the right */}
            <div style={{ flex: 1 }} />

            {/* Avatar + dropdown: user initial, dark/light toggle, logout */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setShowLogoutPopover(v => !v)}
                aria-label="Account menu"
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b6fd4, #6a4fc0)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, cursor: "pointer", border: "none", padding: 0,
                  boxShadow: showLogoutPopover ? "0 0 0 3px rgba(180,160,255,0.3)" : "0 2px 8px rgba(109,40,217,0.25)",
                  transition: "box-shadow 0.18s",
                }}
              >
                <span style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 700, fontSize: 14, color: "#fff",
                }}>
                  {(displayName || username || "?")[0].toUpperCase()}
                </span>
              </button>
            </div>
          </div>

          {/* Row 2: Activities · Schedule · Clear pills */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingInline: "clamp(10px, 3vw, 16px)",
            paddingBottom: 10,
            paddingTop: 2,
          }}>
            {[
              { label: "activities", icon: <Sparkles style={{ width: 11, height: 11 }} />, action: () => setCurrentPage("activities") },
              { label: "schedule",   icon: <Calendar  style={{ width: 11, height: 11 }} />, action: () => setCurrentPage("tasks") },
              { label: "clear",      icon: <Trash2    style={{ width: 11, height: 11 }} />, action: handleClearHistory },
            ].map(({ label, icon, action }) => (
              <button
                key={label}
                onClick={action}
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 400, fontSize: 11, color: "var(--jb-text-icon)",
                  background: "var(--jb-surface)",
                  border: "1px solid var(--jb-border-2)",
                  borderRadius: 100, padding: "4px 11px",
                  display: "inline-flex", alignItems: "center", gap: 4,
                  cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--jb-pill-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--jb-surface)")}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* ── Daily Affirmation banner ── */}
          <DailyAffirmation />
        </div>

        {/* ── Messages area ── full width so wallpaper stretches edge-to-edge */}
        <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
          {/* Scroll area — wallpaper lives ONLY here, behind messages */}
          <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
            {/* Wallpaper — absolutely fills the full-width box */}
            <ChatBackground />

            {/* Scrollable messages on top of wallpaper */}
            <div
              style={{
                position: "relative", zIndex: 1,
                height: "100%", overflowY: "auto",
                background: "transparent",
              }}
            >
              {/* Inner centering wrapper — caps readable width on wide screens */}
              <div style={{
                maxWidth: 760,
                margin: "0 auto",
                padding: "clamp(12px, 3vw, 20px)",
                display: "flex", flexDirection: "column", gap: 16,
              }}>
                {messages.map((m) =>
                  m.type === "breathing" ? (
                    <div key={m.id} className="flex justify-center w-full">
                      <div className="w-full max-w-sm">
                        <BoxBreathing />
                      </div>
                    </div>
                  ) : (
                    <ChatMessage
                      key={m.id}
                      id={m.id}
                      message={m.text}
                      isBot={m.isBot}
                      timestamp={m.timestamp}
                      username={username}
                      displayName={displayName}
                      actions={m.actions}
                      onAcceptAction={handleAcceptAction}
                      onDeclineAction={handleDeclineAction}
                    />
                  )
                )}

                {/* ── Mood check-in — appears after first bot message ── */}
                {showMoodCheckIn && messages.length >= 1 && !isTyping && (
                  <MoodCheckIn onSelect={handleMoodSelect} />
                )}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-2.5 items-end">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(139,92,246,0.12)" }}
                    >
                      <LogoWidget size={22} />
                    </div>
                    <div
                      className="rounded-2xl px-4 py-3"
                      style={{
                        background: "var(--jb-bubble-bot)",
                        boxShadow: "0 1px 8px var(--jb-bubble-shadow)",
                        borderBottomLeftRadius: 4,
                      }}
                    >
                      <div className="flex gap-1">
                        {[0, 150, 300].map((d) => (
                          <div
                            key={d}
                            className="w-2 h-2 rounded-full animate-bounce"
                            style={{ background: "#a78bfa", animationDelay: `${d}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>{/* end inner centering wrapper */}
            </div>{/* end scrollable messages */}
          </div>

          {/* Quick Topics — below wallpaper, always rendered in flow */}
          {messages.length <= 2 && !showMoodCheckIn && (
            <div
              className="flex-shrink-0 overflow-x-hidden"
              style={{
                borderTop: "1px solid var(--jb-border)",
                background: "var(--jb-input-area)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div style={{ maxWidth: 760, margin: "0 auto", padding: "10px clamp(12px, 3vw, 20px) 12px" }}>
                <p
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontWeight: 400,
                    fontSize: 11,
                    color: "var(--jb-text-3)",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Quick topics
                </p>
                <QuickTopics onTopicSelect={handleTopicSelect} />
              </div>
            </div>
          )}

          {/* ── Input Bar — pinned to bottom ── */}
          <div
            className="flex-shrink-0 w-full"
            style={{
              background: "var(--jb-input-bar)",
              borderTop: "1px solid var(--jb-border)",
              paddingBottom: "env(safe-area-inset-bottom)",
            } as React.CSSProperties}
          >
            <div
              className="w-full flex flex-col"
              style={{ maxWidth: 760, margin: "0 auto", padding: "10px clamp(12px, 3vw, 16px) 10px" }}
            >
              <div className="flex gap-2 items-end">
                {/* Voice mic button */}
                <button
                  onClick={toggleVoice}
                  aria-label={isListening ? "Stop listening" : "Voice input"}
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: isListening
                      ? "linear-gradient(135deg, #ef4444, #dc2626)"
                      : "var(--jb-surface)",
                    border: isListening ? "none" : "1.5px solid var(--jb-border-2)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s",
                    boxShadow: isListening ? "0 0 0 4px rgba(239,68,68,0.2)" : "none",
                    animation: isListening ? "micPulse 1.2s ease-in-out infinite" : "none",
                  }}
                >
                  <style>{`
                    @keyframes micPulse {
                      0%, 100% { box-shadow: 0 0 0 4px rgba(239,68,68,0.2); }
                      50%       { box-shadow: 0 0 0 9px rgba(239,68,68,0.06); }
                    }
                  `}</style>
                  {isListening
                    ? <MicOff style={{ width: 18, height: 18, color: "#fff" }} />
                    : <Mic style={{ width: 18, height: 18, color: "var(--jb-text-icon)" }} />
                  }
                </button>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={isListening ? "listening…" : "Share what's on your mind…"}
                  rows={1}
                  ref={textareaRef}
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontWeight: 400,
                    fontSize: 16,
                    background: "var(--jb-surface)",
                    border: isListening ? "1.5px solid rgba(239,68,68,0.4)" : "1.5px solid var(--jb-border-2)",
                    borderRadius: 24,
                    padding: "10px 16px",
                    color: "var(--jb-text-form)",
                    resize: "none",
                    minHeight: 44,
                    maxHeight: 112,
                    outline: "none",
                    transition: "border-color 0.2s, height 0.1s",
                    flex: 1,
                    minWidth: 0,
                    width: "100%",
                    boxSizing: "border-box",
                    overflowY: "hidden",
                  } as React.CSSProperties}
                  onFocus={e => (e.target.style.borderColor = isListening ? "rgba(239,68,68,0.4)" : "rgba(139,92,246,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "var(--jb-border-2)")}
                  className="placeholder:text-purple-300 focus:outline-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isTyping}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: input.trim() && !isTyping
                      ? "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
                      : "rgba(139,92,246,0.25)",
                    border: "none",
                    cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.2s, transform 0.15s",
                    boxShadow: input.trim() && !isTyping
                      ? "0 4px 14px rgba(109,40,217,0.3)"
                      : "none",
                  }}
                  onMouseEnter={e => { if (input.trim() && !isTyping) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 300,
                  fontSize: "clamp(9px, 2.5vw, 11px)",
                  color: "var(--jb-text-3)",
                  textAlign: "center",
                  marginTop: 6,
                  letterSpacing: "0.02em",
                }}
              >
                crisis support · 988 · 116 123 · +61 13 11 14
              </p>
            </div>
          </div>

        </div>
      </div>

      <Toaster />

      {/* ── Profile dropdown — rendered at root level, never clipped ── */}
      {showLogoutPopover && (
        <>
          {/* Backdrop — click outside to close */}
          <div
            onClick={() => setShowLogoutPopover(false)}
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
          />
          {/* Dropdown panel */}
          <div
            style={{
              position: "fixed",
              top: "calc(env(safe-area-inset-top, 0px) + 56px)",
              right: 16,
              zIndex: 9999,
              width: 220,
              minWidth: 180,
              background: "var(--jb-surface)",
              borderRadius: 16,
              boxShadow: "0 8px 24px rgba(120,80,220,0.15), 0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid var(--jb-border-2)",
              overflow: "hidden",
              padding: 0,
              animation: "dropIn 0.16s cubic-bezier(.4,0,.2,1)",
            }}
          >
            {/* User chip */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 16px 12px",
              borderBottom: "1px solid var(--jb-border)",
              background: "linear-gradient(135deg, rgba(180,160,255,0.13) 0%, transparent 100%)",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #8b6fd4, #6a4fc0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 6px rgba(109,40,217,0.22)",
              }}>
                <span style={{ fontFamily: "'DM Sans', system-ui", fontWeight: 700, fontSize: 13, color: "#fff" }}>
                  {(displayName || username || "?")[0].toUpperCase()}
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: "'DM Sans', system-ui", fontSize: 13, fontWeight: 600, color: "var(--jb-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName || username || "User"}
                </p>
                <p style={{ margin: 0, fontFamily: "'DM Sans', system-ui", fontSize: 11, color: "var(--jb-text-3)", marginTop: 2 }}>
                  your space ✦
                </p>
              </div>
            </div>

            {/* Theme toggle row */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid var(--jb-border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--jb-pill-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isDark
                    ? <Moon style={{ width: 13, height: 13, color: "var(--jb-text-icon)" }} />
                    : <Sun  style={{ width: 13, height: 13, color: "var(--jb-text-icon)" }} />
                  }
                </div>
                <span style={{ fontFamily: "'DM Sans', system-ui", fontSize: 13, fontWeight: 400, color: "var(--jb-text-body)" }}>
                  {themeMode === "system" ? "auto" : themeMode === "dark" ? "dark" : "light"}
                </span>
              </div>
              {/* Toggle pill */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                style={{
                  width: 42, height: 24, borderRadius: 12,
                  background: isDark ? "linear-gradient(135deg, #6d28d9, #8b5cf6)" : "rgba(180,160,255,0.35)",
                  border: "none", cursor: "pointer", position: "relative",
                  transition: "background 0.25s",
                  flexShrink: 0, padding: 0,
                }}
              >
                <span style={{
                  position: "absolute", top: 3,
                  left: isDark ? "calc(100% - 21px)" : 3,
                  width: 18, height: 18, borderRadius: "50%",
                  background: isDark ? "#e0d0ff" : "#8b6fd4",
                  transition: "left 0.22s cubic-bezier(.4,0,.2,1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isDark
                    ? <Moon style={{ width: 10, height: 10, color: "#4a3a8a" }} />
                    : <Sun  style={{ width: 10, height: 10, color: "#fff" }} />
                  }
                </span>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={() => { setShowLogoutPopover(false); handleLogout(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "12px 16px",
                background: "transparent", border: "none", cursor: "pointer",
                fontFamily: "'DM Sans', system-ui", fontSize: 13, fontWeight: 400,
                color: "#ef4444", transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(239,68,68,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LogOut style={{ width: 13, height: 13, color: "#ef4444" }} />
              </div>
              log out
            </button>
          </div>
        </>
      )}

      {showCrisisWidget && (
        <CrisisCallWidget onClose={() => setShowCrisisWidget(false)} />
      )}
      <CrisisEmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </div>
  );
}
