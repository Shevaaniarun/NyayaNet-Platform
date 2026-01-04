import React, { useEffect, useState } from "react";
import axios from "axios";
import NoteCard from "../components/Notes/NoteCard";
import AddNoteModal from "../components/Notes/AddNoteModal";

/* =======================
   Types
======================= */

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

/* =======================
   API Setup
======================= */

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
});

/**
 * ✅ FIXED AXIOS INTERCEPTOR
 * Axios v1 headers are NOT plain objects
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    // Use type assertion to avoid AxiosHeaders issues
    const headers = config.headers as Record<string, string>;
    headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =======================
   Component
======================= */

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =======================
     Fetch Notes
  ======================= */

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notes");

      const apiNotes = Array.isArray(res.data?.data) ? res.data.data : [];
      setNotes(apiNotes);
      setError(null);
    } catch (err) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Handlers
  ======================= */

  const handleAddNote = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch {
      alert("Failed to delete note");
    }
  };

  const handleExportPDF = (note: Note) => {
    console.log("PDF export requested for note:", note.id);
  };

  const handleSaveNote = async (noteData: {
    id?: string;
    title: string;
    content: string;
  }) => {
    try {
      if (noteData.id) {
        const res = await api.put(`/notes/${noteData.id}`, {
          title: noteData.title,
          content: noteData.content,
        });

        setNotes((prev) =>
          prev.map((note) =>
            note.id === noteData.id ? res.data.data : note
          )
        );
      } else {
        const res = await api.post("/notes", {
          title: noteData.title,
          content: noteData.content,
        });

        setNotes((prev) => [res.data.data, ...prev]);
      }

      setIsModalOpen(false);
      setSelectedNote(null);
    } catch {
      alert("Failed to save note");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  /* =======================
     Helpers
  ======================= */

  const filteredNotes =
    Array.isArray(notes) && notes.length > 0
      ? notes.filter(
          (note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  const getRotationClass = (index: number) => {
    const rotations = [
      "-rotate-1",
      "rotate-1",
      "-rotate-2",
      "rotate-0",
      "-rotate-3",
      "rotate-2",
    ];
    return rotations[index % rotations.length];
  };

  const getTapeRotationClass = (index: number) => {
    const rotations = [
      "rotate-3",
      "-rotate-3",
      "rotate-6",
      "-rotate-6",
      "rotate-2",
      "-rotate-2",
    ];
    return rotations[index % rotations.length];
  };

  /* =======================
     Render
  ======================= */

  return (
    <div className="min-h-screen bg-justice-black p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] bg-[length:30px_30px] opacity-[0.03]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-constitution-gold font-serif">
            Case Notes
          </h1>
          <p className="text-soft-gray font-serif mt-2">
            Secure workspace for your legal observations
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleAddNote}
            className="px-6 py-3 bg-constitution-gold text-justice-black font-serif font-semibold rounded-lg"
          >
            + Add Note
          </button>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 px-5 py-3 bg-justice-black/50 border border-constitution-gold/30 rounded-lg text-ivory font-serif"
          />
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center text-soft-gray font-serif">
            Loading notes...
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 font-serif">
            {error}
          </div>
        )}

        {/* Notes Grid */}
        {!loading && !error && (
          <>
            {filteredNotes.length === 0 ? (
              <div className="text-center text-soft-gray font-serif py-16">
                No notes found
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note, index) => (
                  <div
                    key={note.id}
                    className={`relative transition-all hover:scale-[1.02] ${getRotationClass(
                      index
                    )}`}
                  >
                    <NoteCard
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                      onExportPDF={handleExportPDF}
                      rotationClass={getRotationClass(index)}
                      tapeRotationClass={getTapeRotationClass(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AddNoteModal
        isOpen={isModalOpen}
        initialNote={selectedNote || undefined}
        onSave={handleSaveNote}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default NotesPage;
