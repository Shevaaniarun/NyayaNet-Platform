import React, { useState } from 'react';
import NoteCard from "../components/Notes/NoteCard";
import AddNoteModal from "../components/Notes/AddNoteModal";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Client Confidentiality Breach Analysis',
      content:
        'The opposing counsel has exhibited questionable practices regarding confidential settlement discussions. Need to document timeline of communications.',
      updatedAt: '2024-03-15T14:30:00Z',
    },
    {
      id: '2',
      title: 'Evidence Admissibility Review',
      content:
        'Digital forensics report indicates potential chain of custody issues with the submitted email evidence. Key dates: Jan 15 acquisition, Feb 3 analysis.',
      updatedAt: '2024-03-14T10:15:00Z',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleAddNote = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  /**
   * Frontend-only trigger
   * Actual PDF logic lives inside NoteCard
   */
  const handleExportPDF = (note: Note) => {
    console.log("PDF export requested for note:", note.id);
  };

  const handleSaveNote = (noteData: { id?: string; title: string; content: string }) => {
    if (noteData.id) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteData.id
            ? {
                ...note,
                title: noteData.title,
                content: noteData.content,
                updatedAt: new Date().toISOString(),
              }
            : note
        )
      );
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteData.title,
        content: noteData.content,
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
    }

    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-justice-black p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-4xl font-bold text-constitution-gold font-serif mb-3">
          Case Notes
        </h1>
        <p className="text-soft-gray font-serif text-lg leading-relaxed">
          Private space to record legal observations and reasoning
        </p>
      </div>

      {/* Action Bar */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleAddNote}
          className="px-6 py-3 bg-constitution-gold text-justice-black font-serif font-semibold rounded-lg hover:bg-constitution-gold/90 transition-colors duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.3)] whitespace-nowrap"
        >
          + Add Note
        </button>

        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full px-5 py-3 bg-justice-black/50 border border-constitution-gold/30 rounded-lg text-ivory placeholder-soft-gray/60 font-serif focus:outline-none focus:ring-2 focus:ring-constitution-gold focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredNotes.length === 0 ? (
          <div className="bg-justice-black/50 border border-constitution-gold/20 rounded-xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-ivory font-serif mb-4">
                You have no case notes yet.
              </h3>
              <p className="text-soft-gray font-serif mb-8 leading-relaxed">
                Start documenting important legal points and observations.
              </p>
              <button
                onClick={handleAddNote}
                className="px-6 py-3 bg-constitution-gold text-justice-black font-serif font-semibold rounded-lg hover:bg-constitution-gold/90 transition-colors duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.3)]"
              >
                + Add your first note
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onExportPDF={handleExportPDF}
              />
            ))}
          </div>
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
