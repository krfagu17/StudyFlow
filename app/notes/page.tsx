"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Note {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  date: string;
  readTime: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface Folder {
  name: string;
  count: number;
}

export default function NotesPage() {
  const [folders, setFolders] = useState<Folder[]>([
    { name: "Neuroscience", count: 1 },
    { name: "Microeconomics", count: 0 },
  ]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string>("");
  const [activeFolder, setActiveFolder] = useState<string>("Neuroscience");
  const [isSaving, setIsSaving] = useState(false);
  const [saveTime, setSaveTime] = useState("Draft mode");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.notes && data.notes.length > 0) {
          setNotes(data.notes);
          setActiveNoteId(data.notes[0].id);
          setActiveFolder(data.notes[0].subject);
          
          // Re-calculate folder counts based on DB data
          const counts: Record<string, number> = {};
          data.notes.forEach((note: Note) => {
            counts[note.subject] = (counts[note.subject] || 0) + 1;
          });
          const updatedFolders = Object.entries(counts).map(([name, count]) => ({ name, count }));
          if (updatedFolders.length > 0) setFolders(updatedFolders);
        }
      })
      .catch((err) => console.error("Error loading notes:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const handleNoteUpdate = (field: keyof Note, value: string) => {
    if (!activeNote) return;
    setNotes((prevNotes) =>
      prevNotes.map((n) => {
        if (n.id === activeNote.id) {
          return { ...n, [field]: value };
        }
        return n;
      })
    );
    setSaveTime("Unsaved edits...");
  };

  const handleSave = async () => {
    if (!activeNote) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeNote),
      });
      const data = await res.json();
      if (data.success) {
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setSaveTime(`Last saved at ${time}`);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
      setSaveTime("Save failed. Retry.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    const title = prompt("Enter new note title:");
    if (!title) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject: activeFolder,
          subjectColor: "bg-primary/20 text-primary border border-primary/30",
          content: "",
        }),
      });

      const data = await res.json();
      if (data.success && data.note) {
        setNotes((prev) => [data.note, ...prev]);
        setActiveNoteId(data.note.id);
        
        // Increment folder count
        setFolders((prev) =>
          prev.map((f) => (f.name === activeFolder ? { ...f, count: f.count + 1 } : f))
        );
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  const handleAddFolder = () => {
    const name = prompt("Enter subject folder name:");
    if (name) {
      setFolders((prev) => [...prev, { name, count: 0 }]);
      setActiveFolder(name);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-6 gap-6 h-[calc(100vh-80px)] overflow-hidden max-w-[1440px] mx-auto">
      {/* Subject Sidebar (left) */}
      <div className="w-full md:w-72 flex flex-col gap-6 shrink-0 h-full overflow-y-auto custom-scrollbar pb-6">
        {/* Subject Folders */}
        <section className="glass-card rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-base text-on-surface">Subjects</h2>
            <button
              onClick={handleAddFolder}
              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm select-none">add</span>
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {folders.map((folder) => {
              const isActive = activeFolder === folder.name;
              return (
                <div
                  key={folder.name}
                  onClick={() => setActiveFolder(folder.name)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                    isActive
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "hover:bg-white/5 text-on-surface-variant border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl select-none" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>
                      folder
                    </span>
                    <span className="text-sm font-semibold">{folder.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-primary/25" : "bg-white/10"}`}>
                    {folder.count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pinned Notes in Active Folder */}
        <section className="glass-card rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-sm select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                push_pin
              </span>
              Notes
            </h2>
            <button
              onClick={handleAddNote}
              className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center hover:bg-tertiary/20 transition-all cursor-pointer"
              title="Add Note"
            >
              <span className="material-symbols-outlined text-sm select-none">add</span>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {notes.filter(n => n.subject === activeFolder).map((note) => {
              const isActive = activeNoteId === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                    isActive
                      ? "bg-surface-container-high border-primary/30"
                      : "bg-surface-container-high/40 hover:bg-surface-container-high border-white/5"
                  }`}
                >
                  <p className="text-[10px] font-bold text-tertiary mb-1 uppercase tracking-wider">
                    {note.subject}
                  </p>
                  <h3 className="text-sm font-semibold text-on-surface line-clamp-1">
                    {note.title || "Untitled Note"}
                  </h3>
                  <p className="text-[10px] text-on-surface-variant mt-1.5 font-medium">
                    {note.date}
                  </p>
                </div>
              );
            })}
            {notes.filter(n => n.subject === activeFolder).length === 0 && (
              <div className="text-xs text-on-surface-variant/40 italic text-center py-4 select-none">
                No notes in folder.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Editor Canvas (Right) */}
      <div className="flex-1 flex flex-col gap-6 h-full min-w-0">
        {/* Editor Toolbar */}
        <div className="glass-card rounded-2xl p-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            {["format_bold", "format_italic", "format_list_bulleted", "link", "image"].map((btn) => (
              <button
                key={btn}
                className="p-2 hover:bg-white/5 rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg select-none">{btn}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-on-surface-variant font-medium">{saveTime}</span>
            <button
              onClick={handleSave}
              disabled={!activeNote || isSaving}
              className="bg-primary text-on-primary px-4 py-2 rounded-xl font-bold text-xs hover:shadow-[0_0_15px_rgba(209,188,255,0.3)] transition-all cursor-pointer active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Note"
              )}
            </button>
          </div>
        </div>

        {/* Note Editor */}
        {loading ? (
          <div className="glass-card flex-grow rounded-3xl flex items-center justify-center">
            <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeNote ? (
          <div className="glass-card flex-grow rounded-3xl p-6 md:p-10 overflow-y-auto custom-scrollbar relative flex flex-col">
            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
              <div className="mb-8">
                <input
                  type="text"
                  className="w-full bg-transparent border-none text-3xl md:text-4xl font-bold text-on-surface focus:outline-none focus:ring-0 p-0 mb-4 placeholder:text-on-surface-variant/30"
                  placeholder="Enter title..."
                  value={activeNote.title}
                  onChange={(e) => handleNoteUpdate("title", e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-on-surface-variant">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${activeNote.subjectColor}`}>
                    {activeNote.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm select-none">calendar_today</span>
                    {activeNote.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm select-none">schedule</span>
                    {activeNote.readTime}
                  </span>
                </div>
              </div>

              <div className="flex-grow flex flex-col gap-6">
                <textarea
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm md:text-base leading-relaxed text-on-surface/90 placeholder:text-on-surface-variant/20 resize-none min-h-[300px] flex-1 font-sans"
                  placeholder="Write your study notes here..."
                  value={activeNote.content}
                  onChange={(e) => handleNoteUpdate("content", e.target.value)}
                />
                
                {activeNote.imageUrl && (
                  <div className="relative w-full h-64 rounded-3xl overflow-hidden my-6 group shrink-0 border border-white/10 shadow-xl">
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                      alt={activeNote.imageAlt}
                      src={activeNote.imageUrl}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 text-xs font-bold text-white/80">
                      {activeNote.imageAlt}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card flex-grow rounded-3xl flex flex-col items-center justify-center p-8 text-center text-xs text-on-surface-variant/40 italic">
            Select a note or add a new one in the left panel to begin.
          </div>
        )}
      </div>
    </div>
  );
}
