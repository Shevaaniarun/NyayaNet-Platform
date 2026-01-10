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
  rotationClass?: string;
  tapeRotationClass?: string;
};

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onExportPDF,
  rotationClass = '',
  tapeRotationClass = ''
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

  // Calculate content height to make UI consistent
  const getContentHeightClass = () => {
    const contentLength = note.content.length;
    if (contentLength < 100) return 'min-h-[300px]';
    if (contentLength < 300) return 'min-h-[350px]';
    if (contentLength < 600) return 'min-h-[400px]';
    if (contentLength < 1000) return 'min-h-[450px]';
    return 'min-h-[500px]';
  };

  const handleExportPDFInternal = async () => {
    if (!scrollRef.current) return;

    try {
      const original = scrollRef.current;

      // Create a clean version for PDF - simpler approach
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'fixed';
      pdfContainer.style.left = '-10000px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '600px'; // Fixed width for consistent PDF
      pdfContainer.style.padding = '40px 50px';
      pdfContainer.style.background = '#f5e6c8';
      pdfContainer.style.fontFamily = "'Palatino Linotype', 'Book Antiqua', serif";
      pdfContainer.style.color = '#4a3728';
      pdfContainer.style.border = '2px solid #8b4513';
      pdfContainer.style.borderRadius = '0';
      pdfContainer.style.boxShadow = '0 8px 32px rgba(101, 67, 33, 0.3)';

      // Add title
      const title = document.createElement('h1');
      title.textContent = note.title;
      title.style.fontFamily = "'Georgia', 'Times New Roman', serif";
      title.style.fontSize = '2.5rem';
      title.style.color = '#3c280d';
      title.style.marginBottom = '2rem';
      title.style.paddingBottom = '1.5rem';
      title.style.borderBottom = '2px solid rgba(139, 69, 19, 0.2)';
      pdfContainer.appendChild(title);

      // Add content
      const content = document.createElement('div');
      content.innerHTML = note.content.split('\n').map(line => `<p style="margin-bottom: 1rem; line-height: 1.8; text-align: justify;">${line}</p>`).join('');
      pdfContainer.appendChild(content);

      // Add divider
      const divider = document.createElement('div');
      divider.style.margin = '3rem 0';
      divider.style.height = '1px';
      divider.style.background = 'linear-gradient(to right, transparent 10%, rgba(139, 69, 19, 0.4) 50%, transparent 90%)';
      pdfContainer.appendChild(divider);

      // Add timestamp
      const timestamp = document.createElement('div');
      timestamp.textContent = `Recorded: ${formatDate(note.updatedAt)}`;
      timestamp.style.fontFamily = "'Georgia', serif";
      timestamp.style.fontSize = '0.95rem';
      timestamp.style.color = '#654321';
      timestamp.style.fontStyle = 'italic';
      timestamp.style.marginTop = '2rem';
      pdfContainer.appendChild(timestamp);

      document.body.appendChild(pdfContainer);

      // Calculate height based on content
      await new Promise(resolve => setTimeout(resolve, 100));
      const contentHeight = pdfContainer.scrollHeight;

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        backgroundColor: '#f5e6c8',
        useCORS: true,
        logging: false,
        width: 600,
        height: contentHeight,
        windowWidth: 600,
        windowHeight: contentHeight,
      });

      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      // Handle multi-page content
      let heightLeft = imgHeight;
      let position = 0;
      const pagePadding = 40; // Padding for better appearance

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${note.title.replace(/\s+/g, '_')}.pdf`);
      onExportPDF(note);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF.');
    }
  };

  const contentHeightClass = getContentHeightClass();

  return (
    <div className={`relative ${rotationClass}`}>
      {/* Glow effect from code 2 */}
      <div className="absolute inset-0 bg-constitution-gold/5 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

      {/* Ancient Scroll Card with tape INSIDE it */}
      <div className={`ancient-scroll group ${contentHeightClass}`} ref={scrollRef}>
        {/* Golden Tape Effect - Positioned absolutely to .ancient-scroll */}
        <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-4 md:w-20 md:h-6 bg-gradient-to-r from-constitution-gold/50 via-constitution-gold/60 to-constitution-gold/50 rounded-full z-20 ${tapeRotationClass} shadow-[0_2px_8px_rgba(0,0,0,0.2)]`}>
          {/* Tape shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>
          {/* Tape ends */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-3 bg-constitution-gold/50 rounded-r-full"></div>
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-3 bg-constitution-gold/50 rounded-l-full"></div>
        </div>

        {/* Scroll body - Dynamic height */}
        <div className={`scroll-body ${contentHeightClass}`}>
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
                {/* PDF EXPORT - Original icon */}
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

                {/* EDIT - Original icon */}
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

                {/* DELETE - Original icon */}
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
    </div>
  );
};

export default NoteCard;