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
      content: 'The opposing counsel has exhibited questionable practices regarding confidential settlement discussions. Need to document timeline of communications.',
      updatedAt: '2024-03-15T14:30:00Z',
    },
    {
      id: '2',
      title: 'Evidence Admissibility Review',
      content: 'Digital forensics report indicates potential chain of custody issues with the submitted email evidence. Key dates: Jan 15 acquisition, Feb 3 analysis.',
      updatedAt: '2024-03-14T10:15:00Z',
    },
    {
      id: '3',
      title: 'Deposition Strategy',
      content: 'Key witness appears vulnerable on timeline inconsistencies. Focus on establishing pattern of behavior through exhibit 12-B.',
      updatedAt: '2024-03-13T16:45:00Z',
    },
    {
      id: '4',
      title: 'Case Law Research',
      content: 'Recent appellate decision in Johnson v. State could strengthen our position on digital evidence standards. Need to brief senior partner.',
      updatedAt: '2024-03-12T11:20:00Z',
    },
    {
      id: '5',
      title: 'Client Meeting Summary',
      content: 'Discussed settlement options with client. They are willing to consider mediation but want stronger guarantees on confidentiality.',
      updatedAt: '2024-03-11T09:45:00Z',
    },
    {
      id: '6',
      title: 'Motion to Compel',
      content: 'Opposition has failed to produce requested documents. Draft motion to compel due by Friday, include sanctions request.',
      updatedAt: '2024-03-10T14:20:00Z',
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

  const handleExportPDF = (note: Note) => {
    console.log("PDF export requested for note:", note.id);
    // You can trigger actual PDF generation here
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

  // Get rotation class based on note index
  const getRotationClass = (index: number) => {
    const rotations = [
      '-rotate-1',    // Slight left
      'rotate-1',     // Slight right  
      '-rotate-2',    // More left
      'rotate-0',     // No rotation
      '-rotate-3',    // Even more left
      'rotate-2',     // More right
    ];
    return rotations[index % rotations.length];
  };

  // Get tape rotation class based on note index
  const getTapeRotationClass = (index: number) => {
    const rotations = [
      'rotate-3',     // Tape right
      '-rotate-3',    // Tape left
      'rotate-6',     // Tape more right
      '-rotate-6',    // Tape more left
      'rotate-2',     // Tape slightly right
      '-rotate-2',    // Tape slightly left
    ];
    return rotations[index % rotations.length];
  };

  return (
    <div className="min-h-screen bg-justice-black p-4 md:p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] bg-[length:30px_30px] opacity-[0.03]"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-constitution-gold/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-constitution-gold/3 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8 md:mb-12">
          <div className="inline-block relative mb-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-constitution-gold font-serif mb-2 relative z-10 tracking-tight">
              Case Notes
            </h1>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-constitution-gold/30 transform -rotate-1"></div>
          </div>
          <p className="text-soft-gray font-serif text-base md:text-lg leading-relaxed max-w-2xl">
            Private space to record legal observations and reasoning. Each note appears as if taped securely to your digital case board.
          </p>
        </div>

        {/* Action Bar */}
        <div className="max-w-7xl mx-auto mb-8 md:mb-12 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button
            onClick={handleAddNote}
            className="group relative px-5 py-2.5 md:px-6 md:py-3 bg-constitution-gold text-justice-black font-serif font-semibold rounded-lg hover:bg-constitution-gold/90 transition-all duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.3)] whitespace-nowrap overflow-hidden flex items-center justify-center gap-2 min-w-[140px]"
          >
            <span className="relative z-10 flex items-center gap-2 text-sm md:text-base">
              <span className="text-lg md:text-xl transition-transform duration-300 group-hover:rotate-90">+</span>
              Add Note
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search through case notes by title or content..."
              className="w-full px-4 py-2.5 md:px-5 md:py-3 bg-justice-black/70 border border-constitution-gold/20 rounded-lg text-ivory placeholder-soft-gray/60 font-serif focus:outline-none focus:ring-2 focus:ring-constitution-gold/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-sm md:text-base"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-soft-gray/40 text-xs">
              ⌘K
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center justify-between text-xs md:text-sm text-soft-gray/70 font-serif">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-constitution-gold/60 rounded-full"></div>
                <span>{notes.length} total notes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-amber-200/60 rounded-full"></div>
                <span>{filteredNotes.length} showing</span>
              </div>
            </div>
            <div className="text-xs text-soft-gray/40 hidden md:block">
              Secure • Encrypted • Versioned
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="max-w-7xl mx-auto">
          {filteredNotes.length === 0 ? (
            <div className="relative bg-justice-black/40 border-2 border-dashed border-constitution-gold/15 rounded-xl md:rounded-2xl p-8 md:p-12 text-center backdrop-blur-sm">
              <div className="max-w-md mx-auto">
                <div className="text-4xl md:text-6xl mb-4 md:mb-6 text-constitution-gold/20">📝</div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-ivory font-serif mb-4 md:mb-6">
                  {searchQuery ? 'No matching notes found' : 'Your case board is empty'}
                </h3>
                <p className="text-soft-gray font-serif mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                  {searchQuery 
                    ? 'Try a different search term or create a new note.' 
                    : 'Start documenting important legal points, observations, and case strategies.'}
                </p>
                <button
                  onClick={handleAddNote}
                  className="group px-6 py-3 md:px-8 md:py-4 bg-constitution-gold text-justice-black font-serif font-semibold rounded-lg hover:bg-constitution-gold/90 transition-all duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)]"
                >
                  <span className="flex items-center gap-2 md:gap-3 text-sm md:text-base">
                    <span className="text-lg md:text-xl transition-transform duration-300 group-hover:rotate-90">+</span>
                    {searchQuery ? 'Create New Note' : 'Add Your First Note'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredNotes.map((note, index) => (
                <div 
                  key={note.id}
                  className={`relative transition-all duration-300 hover:scale-[1.02] hover:z-20 ${getRotationClass(index)} hover:rotate-0`}
                >
                  <NoteCard
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onExportPDF={handleExportPDF}
                    rotationClass={getRotationClass(index)}
                    tapeRotationClass={getTapeRotationClass(index)}
                  />
                  
                  {/* Drop shadow that follows rotation */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-constitution-gold/10 to-transparent rounded-lg transform translate-y-3 -z-10 blur-sm opacity-70 ${getRotationClass(index)}`}></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        {filteredNotes.length > 0 && (
          <div className="max-w-7xl mx-auto mt-8 md:mt-12 pt-6 border-t border-constitution-gold/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs md:text-sm text-soft-gray/50 font-serif">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-constitution-gold/20 to-constitution-gold/40"></div>
                <span>Drag and drop to reorder notes</span>
              </div>
              <div className="text-xs text-soft-gray/40">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
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