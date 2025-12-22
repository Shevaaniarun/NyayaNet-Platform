/**
 * CreatePost - Post Creation Interface
 * Allows legal professionals to share insights, cases, and discussions
 */

import { Image, FileText, Video, Send } from 'lucide-react';
import { useState } from 'react';

export function CreatePost() {
  const [postContent, setPostContent] = useState('');

  return (
    <div className="aged-paper rounded-lg p-6 mb-8 relative">
      {/* Top Border Decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-constitution-gold to-transparent"></div>

      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div className="w-12 h-12 bg-constitution-gold rounded-full border-2 border-constitution-gold/30 flex items-center justify-center flex-shrink-0">
          <span className="font-heading font-bold text-justice-black">AP</span>
        </div>

        {/* Input Area */}
        <div className="flex-1">
          <textarea
            placeholder="Share legal insights, case updates, or professional thoughts..."
            className="w-full parchment-bg border border-constitution-gold/30 rounded-lg p-4 text-ink-gray font-body focus:outline-none focus:border-constitution-gold resize-none"
            rows={4}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />

          {/* Post Type Selection */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 bg-constitution-gold/10 border border-constitution-gold/30 rounded-lg text-constitution-gold hover:bg-constitution-gold/20 transition-colors flex items-center space-x-2" style={{ fontSize: '0.875rem' }}>
                <Image className="w-4 h-4" />
                <span>Image</span>
              </button>
              <button className="px-3 py-2 bg-constitution-gold/10 border border-constitution-gold/30 rounded-lg text-constitution-gold hover:bg-constitution-gold/20 transition-colors flex items-center space-x-2" style={{ fontSize: '0.875rem' }}>
                <FileText className="w-4 h-4" />
                <span>Document</span>
              </button>
              <button className="px-3 py-2 bg-constitution-gold/10 border border-constitution-gold/30 rounded-lg text-constitution-gold hover:bg-constitution-gold/20 transition-colors flex items-center space-x-2" style={{ fontSize: '0.875rem' }}>
                <Video className="w-4 h-4" />
                <span>Video</span>
              </button>
            </div>

            <button
              disabled={!postContent.trim()}
              className="px-6 py-2 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Publish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}