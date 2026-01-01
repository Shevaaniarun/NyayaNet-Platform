import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './NoteCard.css';

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

type NoteCardProps = {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onExportPDF: (note: Note) => void;
};

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onExportPDF,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * REAL PDF EXPORT (frontend)
   * Captures the ancient scroll exactly as seen
   */
  const handleExportPDFInternal = async () => {
    if (!scrollRef.current) return;

    const canvas = await html2canvas(scrollRef.current, {
      scale: 2,
      backgroundColor: '#f5e6c8',
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
    pdf.save(`${note.title.replace(/\s+/g, '_')}.pdf`);

    // Optional callback (for analytics / backend later)
    onExportPDF(note);
  };

  return (
    <div className="ancient-scroll" ref={scrollRef}>
      {/* Rolled parchment top */}
      <div className="scroll-top">
        <div className="scroll-cylinder">
          <div className="cylinder-highlight"></div>
        </div>
        <div className="scroll-end left-end"></div>
        <div className="scroll-end right-end"></div>
      </div>

      {/* Scroll body */}
      <div className="scroll-body">
        {/* Aged paper texture overlays */}
        <div className="paper-texture"></div>
        <div className="age-stain stain-1"></div>
        <div className="age-stain stain-2"></div>

        {/* Content */}
        <div className="scroll-content">
          <h3 className="manuscript-title">{note.title}</h3>

          <div className="manuscript-content">
            <p>{note.content}</p>
          </div>

          {/* Divider */}
          <div className="manuscript-divider">
            <div className="divider-line"></div>
            <div className="divider-ornament"></div>
          </div>

          {/* Footer */}
          <div className="scroll-footer">
            <div className="timestamp">
              Recorded: {formatDate(note.updatedAt)}
            </div>

            <div className="scroll-actions">
              {/* PDF EXPORT */}
              <button
                className="action-btn"
                onClick={handleExportPDFInternal}
                aria-label="Download as PDF"
              >
                <svg
                  className="action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>

              {/* EDIT */}
              <button
                className="action-btn"
                onClick={() => onEdit(note)}
                aria-label="Edit note"
              >
                <svg
                  className="action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>

              {/* DELETE */}
              <button
                className="action-btn"
                onClick={() => onDelete(note.id)}
                aria-label="Delete note"
              >
                <svg
                  className="action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Corner marks */}
        <div className="corner-mark top-left"></div>
        <div className="corner-mark top-right"></div>
        <div className="corner-mark bottom-left"></div>
        <div className="corner-mark bottom-right"></div>
      </div>

      {/* Shadow */}
      <div className="scroll-shadow"></div>
    </div>
  );
};

export default NoteCard;
