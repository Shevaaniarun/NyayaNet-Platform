import React, { useState, useEffect } from 'react';
import './AddNoteModal.css';

type Note = {
  id?: string;
  title: string;
  content: string;
};

type AddNoteModalProps = {
  isOpen: boolean;
  initialNote?: Note;
  onSave: (note: Note) => void;
  onClose: () => void;
};

const AddNoteModal: React.FC<AddNoteModalProps> = ({ isOpen, initialNote, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [initialNote, isOpen]);

  const handleSave = () => {
    onSave({ id: initialNote?.id, title, content });
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="parchment-modal-overlay" onClick={handleCancel}>
      <div className="parchment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Aged paper base */}
        <div className="parchment-sheet">
          {/* Paper texture layers */}
          <div className="paper-texture-layer"></div>
          <div className="paper-stain-layer"></div>
          <div className="paper-edge-layer"></div>
          
          {/* Content */}
          <div className="parchment-content">
            {/* Header */}
            <div className="parchment-header">
              <h2 className="parchment-title">
                {initialNote ? 'Amend Legal Record' : 'Record Legal Observation'}
              </h2>
              <div className="parchment-subtitle">
                {initialNote ? 'Update the existing manuscript' : 'Document your legal reasoning'}
              </div>
            </div>

            {/* Form */}
            <div className="parchment-form">
              {/* Title input */}
              <div className="input-section">
                <label className="input-label">Title of Record</label>
                <div className="input-container">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter the legal title..."
                    className="parchment-input title-input"
                    autoFocus
                  />
                  <div className="input-underline"></div>
                </div>
              </div>

              {/* Content textarea */}
              <div className="input-section">
                <label className="input-label">Text of Record</label>
                <div className="textarea-container">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your legal analysis, precedents, and conclusions..."
                    className="parchment-textarea"
                    rows={12}
                  />
                  <div className="writing-lines">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="writing-line"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quill decoration */}
              <div className="quill-decoration">
                <div className="quill-feather"></div>
                <div className="quill-nib"></div>
              </div>
            </div>

            {/* Footer */}
            <div className="parchment-footer">
              <div className="inkwell-decoration">
                <div className="inkwell"></div>
                <div className="ink-drop"></div>
              </div>
              
              <div className="parchment-actions">
                <button
                  onClick={handleCancel}
                  className="parchment-button cancel-button"
                >
                  Abandon Record
                </button>
                <button
                  onClick={handleSave}
                  className="parchment-button save-button"
                >
                  Seal Record
                </button>
              </div>
            </div>
          </div>

          {/* Corner seals */}
          <div className="corner-seal top-left-seal"></div>
          <div className="corner-seal top-right-seal"></div>
          <div className="corner-seal bottom-left-seal"></div>
          <div className="corner-seal bottom-right-seal"></div>
        </div>
      </div>
    </div>
  );
};

export default AddNoteModal;