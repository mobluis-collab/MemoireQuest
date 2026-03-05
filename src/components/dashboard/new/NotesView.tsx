"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { tw, bg } from "@/lib/color-utils";
import type { Note } from "@/types/notes";

interface NotesViewProps {
  textIntensity?: number;
  isDark?: boolean;
  onCountChange?: (count: number) => void;
}

/* ─── Helpers ─── */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function formatDate(dateStr: string, mode: "relative" | "full" = "relative"): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (mode === "full") {
    return (
      d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) +
      " à " +
      d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    );
  }

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;

  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `Aujourd'hui, ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Hier";

  if (diffHours < 24 * 7) return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Component ─── */
export default function NotesView({ textIntensity = 1.0, isDark = true, onCountChange }: NotesViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [savedIndicator, setSavedIndicator] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  // Fetch notes on mount
  useEffect(() => {
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        const fetched: Note[] = data.notes ?? [];
        setNotes(fetched);
        onCountChange?.(fetched.length);
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, [onCountChange]);

  // Sync editor when selection changes
  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      if (contentRef.current) {
        contentRef.current.innerHTML = selectedNote.content;
      }
    }
  }, [selectedId]);

  // Auto-save with debounce
  const saveNote = useCallback((id: string, title: string, content: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const res = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => prev.map((n) => (n.id === id ? data.note : n)));
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 2000);
      }
    }, 800);
  }, []);

  const handleTitleChange = (val: string) => {
    setEditTitle(val);
    if (selectedId) saveNote(selectedId, val, contentRef.current?.innerHTML ?? "");
  };

  const handleContentInput = () => {
    if (selectedId && contentRef.current) {
      saveNote(selectedId, editTitle, contentRef.current.innerHTML);
    }
  };

  // Create note
  const createNote = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const data = await res.json();
      setNotes((prev) => {
        const updated = [data.note, ...prev];
        onCountChange?.(updated.length);
        return updated;
      });
      setSelectedId(data.note.id);
      setIsListCollapsed(false);
    }
  };

  // Delete note
  const deleteNote = async () => {
    if (!selectedId) return;
    const confirmed = window.confirm("Supprimer cette note ?");
    if (!confirmed) return;

    const res = await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId }),
    });
    if (res.ok) {
      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== selectedId);
        onCountChange?.(updated.length);
        return updated;
      });
      setSelectedId(null);
    }
  };

  // Formatting commands
  const execCmd = (cmd: string) => {
    document.execCommand(cmd, false);
    contentRef.current?.focus();
  };

  const highlight = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const mark = document.createElement("mark");
    range.surroundContents(mark);
    handleContentInput();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" && e.key !== "n" && e.key !== "N") return;

      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          execCmd("bold");
          break;
        case "i":
          e.preventDefault();
          execCmd("italic");
          break;
        case "u":
          e.preventDefault();
          execCmd("underline");
          break;
        case "h":
          e.preventDefault();
          highlight();
          break;
        case "n":
          e.preventDefault();
          createNote();
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedId, editTitle]);

  // Filtered notes
  const filtered = search.trim()
    ? notes.filter((n) => {
        const q = search.toLowerCase();
        return n.title.toLowerCase().includes(q) || stripHtml(n.content).toLowerCase().includes(q);
      })
    : notes;

  const btnBase = {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    border: `1px solid ${bg(0.12, isDark)}`,
    background: bg(0.04, isDark),
    cursor: "pointer" as const,
    transition: "all 0.15s",
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Content editable styles */}
      <style>{`
        .mq-note-editor b, .mq-note-editor strong { font-weight: 600; color: ${tw(0.9, textIntensity, isDark)}; }
        .mq-note-editor i, .mq-note-editor em { font-style: italic; }
        .mq-note-editor u { text-decoration: underline; }
        .mq-note-editor mark { background: ${bg(0.12, isDark)}; color: ${tw(0.9, textIntensity, isDark)}; padding: 1px 3px; border-radius: 2px; }
        .mq-note-editor s { text-decoration: line-through; }
        .mq-note-editor:empty::before {
          content: 'Commence à écrire...';
          color: ${tw(0.2, textIntensity, isDark)};
          pointer-events: none;
        }
        .mq-notes-scroll::-webkit-scrollbar { width: 4px; }
        .mq-notes-scroll::-webkit-scrollbar-track { background: transparent; }
        .mq-notes-scroll::-webkit-scrollbar-thumb { background: ${bg(0.1, isDark)}; border-radius: 2px; }
      `}</style>

      {/* ── Left panel: notes list ── */}
      <div
        style={{
          width: isListCollapsed ? 0 : 280,
          flexShrink: 0,
          overflow: "hidden",
          borderRight: isListCollapsed ? "none" : `1px solid ${bg(0.06, isDark)}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 16px 12px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: tw(0.9, textIntensity, isDark), margin: 0 }}>
              Pense-b{"\u00EA"}tes
            </h2>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={createNote}
                style={{
                  ...btnBase,
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  color: tw(0.5, textIntensity, isDark),
                  fontSize: 18,
                }}
              >
                +
              </button>
              <button
                onClick={() => setIsListCollapsed(true)}
                style={{
                  ...btnBase,
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  color: tw(0.35, textIntensity, isDark),
                  fontSize: 14,
                }}
              >
                {"\u00AB"}
              </button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: tw(0.35, textIntensity, isDark), lineHeight: "1.5", margin: "0 0 12px" }}>
            {"\u00C9"}cris toutes tes id{"\u00E9"}es ici pour ne plus les perdre.
          </p>
          {/* Search */}
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 8,
              border: `1px solid ${bg(0.08, isDark)}`,
              background: bg(0.03, isDark),
              color: tw(0.7, textIntensity, isDark),
              fontSize: 12,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Notes list */}
        <div className="mq-notes-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}>
          {filtered.length === 0 && isLoaded && (
            <div
              style={{ textAlign: "center", padding: "24px 8px", color: tw(0.25, textIntensity, isDark), fontSize: 12 }}
            >
              {search ? "Aucun r\u00E9sultat" : "Aucune note"}
            </div>
          )}
          {filtered.map((note) => {
            const isActive = note.id === selectedId;
            return (
              <div
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: isActive ? bg(0.07, isDark) : "transparent",
                  transition: "background 0.1s",
                  marginBottom: 2,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = bg(0.04, isDark);
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: tw(0.85, textIntensity, isDark),
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {note.title || "Sans titre"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: tw(0.35, textIntensity, isDark),
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {stripHtml(note.content).slice(0, 60) || "Note vide"}
                </div>
                <div
                  suppressHydrationWarning
                  style={{ fontSize: 11, color: tw(0.2, textIntensity, isDark), marginTop: 3 }}
                >
                  {formatDate(note.updated_at)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right panel: editor ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {selectedNote ? (
          <>
            {/* Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "8px 16px",
                borderBottom: `1px solid ${bg(0.06, isDark)}`,
                flexShrink: 0,
              }}
            >
              {isListCollapsed && (
                <>
                  <button
                    onClick={() => setIsListCollapsed(false)}
                    style={{
                      ...btnBase,
                      width: 34,
                      height: 34,
                      borderRadius: 6,
                      color: tw(0.4, textIntensity, isDark),
                      fontSize: 14,
                    }}
                  >
                    {"\u00BB"}
                  </button>
                  <div style={{ width: 1, height: 20, background: bg(0.08, isDark), margin: "0 4px" }} />
                </>
              )}
              {/* Bold */}
              <button
                onClick={() => execCmd("bold")}
                style={{
                  ...btnBase,
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  color: tw(0.5, textIntensity, isDark),
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                G
              </button>
              {/* Italic */}
              <button
                onClick={() => execCmd("italic")}
                style={{
                  ...btnBase,
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  color: tw(0.5, textIntensity, isDark),
                  fontSize: 14,
                  fontStyle: "italic",
                }}
              >
                I
              </button>
              {/* Underline */}
              <button
                onClick={() => execCmd("underline")}
                style={{
                  ...btnBase,
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  color: tw(0.5, textIntensity, isDark),
                  fontSize: 14,
                  textDecoration: "underline",
                }}
              >
                S
              </button>

              <div style={{ width: 1, height: 20, background: bg(0.08, isDark), margin: "0 4px" }} />

              {/* Highlight */}
              <button
                onClick={highlight}
                style={{
                  ...btnBase,
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  color: tw(0.5, textIntensity, isDark),
                  fontSize: 13,
                }}
                title="Surligner"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
              {/* Strikethrough */}
              <button
                onClick={() => execCmd("strikethrough")}
                style={{
                  ...btnBase,
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  color: tw(0.5, textIntensity, isDark),
                  fontSize: 14,
                  textDecoration: "line-through",
                }}
              >
                B
              </button>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Delete */}
              <button
                onClick={deleteNote}
                style={{
                  ...btnBase,
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  color: tw(0.25, textIntensity, isDark),
                  border: "none",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,100,100,0.7)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,100,100,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = tw(0.25, textIntensity, isDark);
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
                title="Supprimer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>

            {/* Editor area */}
            <div className="mq-notes-scroll" style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
              {/* Title input */}
              <input
                type="text"
                value={editTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titre de la note"
                style={{
                  width: "100%",
                  fontSize: 24,
                  fontWeight: 600,
                  color: tw(0.9, textIntensity, isDark),
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  marginBottom: 4,
                }}
              />
              {/* Date + saved indicator */}
              <div
                style={{
                  fontSize: 12,
                  color: tw(0.25, textIntensity, isDark),
                  marginBottom: 20,
                  display: "flex",
                  gap: 8,
                }}
              >
                <span suppressHydrationWarning>{formatDate(selectedNote.updated_at, "full")}</span>
                {savedIndicator && (
                  <span style={{ color: tw(0.25, textIntensity, isDark), fontSize: 11 }}>Sauvegard{"\u00E9"}</span>
                )}
              </div>
              {/* Content editable */}
              <div
                ref={contentRef}
                className="mq-note-editor"
                contentEditable
                suppressContentEditableWarning
                onInput={handleContentInput}
                style={{
                  minHeight: 300,
                  fontSize: 15,
                  lineHeight: "1.75",
                  color: tw(0.75, textIntensity, isDark),
                  outline: "none",
                  cursor: "text",
                }}
              />
            </div>
          </>
        ) : (
          /* Empty state */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {isListCollapsed && (
              <button
                onClick={() => setIsListCollapsed(false)}
                style={{
                  ...btnBase,
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  color: tw(0.4, textIntensity, isDark),
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                {"\u00BB"}
              </button>
            )}
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke={tw(0.15, textIntensity, isDark)}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8.5L15.5 3z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
            <span style={{ fontSize: 14, color: tw(0.25, textIntensity, isDark) }}>
              S{"\u00E9"}lectionne ou cr{"\u00E9"}e une note
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
