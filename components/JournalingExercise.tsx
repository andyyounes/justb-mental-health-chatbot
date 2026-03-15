import { useState, useEffect, useRef } from "react";
import { Camera, Trash2, ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface JournalEntry {
  id: string;
  prompt: string;
  content: string;
  date: string;
  timestamp: number;
  imageDataUrl?: string;
}

const PROMPTS = [
  { id: "gratitude", title: "gratitude", description: "what are you grateful for today?", emoji: "🌸" },
  { id: "thought-dump", title: "thought dump", description: "write down whatever's on your mind", emoji: "🌊" },
  { id: "reframe", title: "reframe a worry", description: "write a worry, then find a gentler way to see it", emoji: "🌤️" },
];

const DM = "'DM Sans', system-ui, sans-serif";

const gradBtn: React.CSSProperties = {
  background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  border: "none", borderRadius: 100,
  padding: "13px 24px",
  fontFamily: DM, fontWeight: 500, fontSize: 14, color: "#fff",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  boxShadow: "0 4px 16px rgba(109,40,217,0.3)",
  transition: "transform 0.15s",
  width: "100%",
};

const outlineBtn: React.CSSProperties = {
  background: "var(--jb-surface)", border: "1.5px solid var(--jb-border-2)",
  borderRadius: 100, padding: "12px 20px",
  fontFamily: DM, fontWeight: 400, fontSize: 13, color: "var(--jb-text-icon)",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  transition: "background 0.15s",
};

const wrapper: React.CSSProperties = {
  minHeight: "100%",
  background: "var(--jb-bg-grad)",
  padding: "clamp(16px, 5vw, 28px)",
  fontFamily: DM,
  display: "flex", flexDirection: "column", gap: 16,
};

const card: React.CSSProperties = {
  background: "var(--jb-surface)", borderRadius: 20,
  boxShadow: "0 2px 16px var(--jb-card-shadow)",
  padding: "clamp(16px, 5vw, 24px)",
};

export function JournalingExercise() {
  const [view, setView] = useState<"list" | "write" | "read">("list");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [entryText, setEntryText] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [entryImage, setEntryImage] = useState<string | undefined>(undefined);
  const [focusedTextarea, setFocusedTextarea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("justb_journal_entries");
    if (saved) {
      try { setEntries(JSON.parse(saved)); } catch (e) { console.error("Failed to load entries:", e); }
    }
  }, []);

  const handleStartWriting = (promptId: string) => {
    const prompt = PROMPTS.find(p => p.id === promptId);
    if (prompt) {
      setSelectedPrompt(prompt.title);
      setEntryText(""); setEntryImage(undefined);
      setView("write");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setEntryImage(ev.target?.result as string); };
    reader.readAsDataURL(file);
  };

  const handleSaveEntry = () => {
    if (!entryText.trim() || !selectedPrompt) { toast.error("write something first"); return; }
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      prompt: selectedPrompt,
      content: entryText,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      timestamp: Date.now(),
      imageDataUrl: entryImage,
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("justb_journal_entries", JSON.stringify(updated));
    toast.success("entry saved ✦");
    setEntryText(""); setEntryImage(undefined);
    setView("list");
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem("justb_journal_entries", JSON.stringify(updated));
    toast.success("entry deleted");
    setViewingEntry(null);
    setView("list");
  };

  // ── Read entry ──
  if (view === "read" && viewingEntry) {
    return (
      <div style={wrapper}>
        <div style={card}>
          <button
            onClick={() => { setView("list"); setViewingEntry(null); }}
            style={{ ...outlineBtn, width: "auto", marginBottom: 20, paddingLeft: 14 }}
          >
            <ArrowLeft size={14} /> back
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <p style={{ fontFamily: DM, fontWeight: 500, fontSize: 16, color: "var(--jb-text-2)", margin: "0 0 4px" }}>
                {viewingEntry.prompt}
              </p>
              <p style={{ fontFamily: DM, fontWeight: 400, fontSize: 12, color: "var(--jb-text-3)", margin: 0 }}>
                {viewingEntry.date}
              </p>
            </div>
            <button
              onClick={() => handleDeleteEntry(viewingEntry.id)}
              style={{ background: "rgba(254,202,202,0.3)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}
            >
              <Trash2 size={15} />
            </button>
          </div>

          {viewingEntry.imageDataUrl && (
            <img
              src={viewingEntry.imageDataUrl}
              alt="journal"
              style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 14, marginBottom: 16 }}
            />
          )}

          <div style={{ background: "var(--jb-pill-bg)", borderRadius: 14, padding: "16px", whiteSpace: "pre-wrap", fontFamily: DM, fontWeight: 400, fontSize: 14, color: "var(--jb-text-form)", lineHeight: 1.7 }}>
            {viewingEntry.content}
          </div>
        </div>
      </div>
    );
  }

  // ── Write ──
  if (view === "write") {
    const prompt = PROMPTS.find(p => p.title === selectedPrompt);
    return (
      <div style={wrapper}>
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>{prompt?.emoji}</span>
            <h2 style={{ margin: 0, fontFamily: DM, fontWeight: 600, fontSize: 17, color: "var(--jb-text-2)" }}>
              {selectedPrompt}
            </h2>
          </div>
          <p style={{ margin: "0 0 20px", fontFamily: DM, fontWeight: 400, fontSize: 13, color: "var(--jb-text-3)", lineHeight: 1.6 }}>
            {prompt?.description}
          </p>

          {/* Image preview */}
          {entryImage && (
            <div style={{ position: "relative", marginBottom: 12 }}>
              <img
                src={entryImage}
                alt="entry"
                style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 14 }}
              />
              <button
                onClick={() => setEntryImage(undefined)}
                style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}

          {/* Textarea */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <textarea
              value={entryText}
              onChange={e => setEntryText(e.target.value)}
              placeholder="start writing… there's no right or wrong here."
              rows={7}
              onFocus={() => setFocusedTextarea(true)}
              onBlur={() => setFocusedTextarea(false)}
              style={{
                width: "100%",
                background: "var(--jb-pill-bg)",
                border: `1.5px solid ${focusedTextarea ? "rgba(139,92,246,0.4)" : "var(--jb-border-2)"}`,
                borderRadius: 16, padding: "14px 16px",
                fontFamily: DM, fontWeight: 400, fontSize: 14, color: "var(--jb-text-form)",
                lineHeight: 1.7, resize: "none", outline: "none",
                boxShadow: focusedTextarea ? "0 0 0 3px rgba(139,92,246,0.08)" : "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
              }}
            />
            {/* Camera button inside textarea */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "absolute", bottom: 12, right: 12,
                background: "var(--jb-pill-bg)", border: "1px solid var(--jb-border-2)",
                borderRadius: "50%", width: 34, height: 34,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--jb-text-icon)",
              }}
              title="add image"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file" accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleSaveEntry}
              disabled={!entryText.trim()}
              style={{
                ...gradBtn,
                flex: 1, width: "auto",
                background: !entryText.trim() ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                cursor: !entryText.trim() ? "not-allowed" : "pointer",
              }}
            >
              save entry
            </button>
            <button
              onClick={() => { setView("list"); setEntryText(""); setEntryImage(undefined); }}
              style={{ ...outlineBtn, flexShrink: 0 }}
            >
              cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List ──
  return (
    <div style={wrapper}>
      {/* Prompts */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <BookOpen size={18} color="#8b5cf6" />
          <h2 style={{ margin: 0, fontFamily: DM, fontWeight: 600, fontSize: 18, color: "var(--jb-text-2)" }}>
            guided journal
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PROMPTS.map(prompt => (
            <button
              key={prompt.id}
              onClick={() => handleStartWriting(prompt.id)}
              style={{
                background: "var(--jb-pill-bg)",
                border: "1.5px solid var(--jb-border)",
                borderRadius: 16, padding: "14px 16px",
                cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 12,
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--jb-border)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--jb-border-2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--jb-pill-bg)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--jb-border)";
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{prompt.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 3px", fontFamily: DM, fontWeight: 500, fontSize: 14, color: "var(--jb-text-2)" }}>
                  {prompt.title}
                </p>
                <p style={{ margin: 0, fontFamily: DM, fontWeight: 400, fontSize: 12, color: "var(--jb-text-3)" }}>
                  {prompt.description}
                </p>
              </div>
              <ChevronRight size={16} color="rgba(109,40,217,0.4)" />
            </button>
          ))}
        </div>
      </div>

      {/* Saved entries */}
      <div style={card}>
        <p style={{ fontFamily: DM, fontWeight: 500, fontSize: 12, color: "var(--jb-text-3)", marginBottom: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          saved journals {entries.length > 0 && `· ${entries.length}`}
        </p>

        {entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✦</div>
            <p style={{ fontFamily: DM, fontWeight: 400, fontSize: 13, color: "var(--jb-text-3)", fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>
              no entries yet.<br />your thoughts are safe here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map(entry => (
              <div
                key={entry.id}
                onClick={() => { setViewingEntry(entry); setView("read"); }}
                style={{
                  background: "var(--jb-pill-bg)",
                  border: "1.5px solid var(--jb-border)",
                  borderRadius: 16, padding: "12px 14px",
                  cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--jb-border)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--jb-pill-bg)")}
              >
                {/* Thumbnail */}
                {entry.imageDataUrl ? (
                  <img
                    src={entry.imageDataUrl}
                    alt="thumb"
                    style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 10, flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                    background: "var(--jb-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}>
                    {PROMPTS.find(p => p.title === entry.prompt)?.emoji || "📝"}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontFamily: DM, fontWeight: 500, fontSize: 13, color: "var(--jb-text-2)" }}>
                      {entry.prompt}
                    </span>
                    <span style={{ fontFamily: DM, fontWeight: 400, fontSize: 11, color: "var(--jb-text-3)", flexShrink: 0, marginLeft: 8 }}>
                      {entry.date}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: DM, fontWeight: 400, fontSize: 12,
                    color: "var(--jb-text-3)", margin: 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {entry.content}
                  </p>
                </div>

                <button
                  onClick={e => { e.stopPropagation(); handleDeleteEntry(entry.id); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(239,68,68,0.5)", padding: 4, borderRadius: 6,
                    display: "flex", alignItems: "center", flexShrink: 0,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(239,68,68,0.5)")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}