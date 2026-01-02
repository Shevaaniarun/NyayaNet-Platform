/**
 * CreatePost - Post Creation Interface
 * Allows legal professionals to share insights, cases, and discussions
 */

import { Image, FileText, Video, Send, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';

interface AttachedFile {
  id: string;
  file: File;
  type: 'image' | 'document';
  preview?: string;
}

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [postContent, setPostContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [postType, setPostType] = useState<'POST' | 'QUESTION' | 'ARTICLE' | 'ANNOUNCEMENT'>('POST');
  const [isPublishing, setIsPublishing] = useState(false);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  const user = getCurrentUser();
  const userInitials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (type: 'image' | 'document') => {
    if (type === 'image') imageInputRef.current?.click();
    else if (type === 'document') documentInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    Array.from(files).forEach((file) => {
      const newFile: AttachedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type,
      };

      // Create preview for images
      if (type === 'image') {
        newFile.preview = URL.createObjectURL(file);
      }

      newFiles.push(newFile);
    });

    setAttachedFiles([...attachedFiles, ...newFiles]);
    e.target.value = ''; // Reset input
  };

  const removeFile = (id: string) => {
    setAttachedFiles(attachedFiles.filter(f => {
      if (f.id === id && f.preview) {
        URL.revokeObjectURL(f.preview);
      }
      return f.id !== id;
    }));
  };

  const handlePublish = async () => {
    if (!postContent.trim() && attachedFiles.length === 0) return;

    setIsPublishing(true);

    try {
      const { createPost, uploadFiles } = await import('../api/postsAPI');

      let media: any[] = [];
      if (attachedFiles.length > 0) {
        toast.info('Uploading files...');
        media = await uploadFiles(attachedFiles.map(af => af.file));
      }

      // Process manual hashtags
      const hashtagsArray = hashtags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('#') ? tag.slice(1) : tag);

      await createPost({
        content: postContent.trim(),
        postType,
        tags: hashtagsArray,
        isPublic: true,
        media
      });

      // Success - reset form
      setPostContent('');
      setHashtags('');
      setPostType('POST');
      attachedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setAttachedFiles([]);

      toast.success('Post published successfully!');
      if (onPostCreated) onPostCreated();
    } catch (error: any) {
      console.error('Failed to publish post:', error);
      toast.error(`Failed to publish post: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="aged-paper rounded-lg p-6 mb-8 relative">
      {/* Top Border Decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-constitution-gold to-transparent"></div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleFileChange(e, 'image')}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={documentInputRef}
        onChange={(e) => handleFileChange(e, 'document')}
        accept=".pdf,.doc,.docx,.txt"
        multiple
        className="hidden"
      />

      {/* Post Type Selector */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {(['POST', 'QUESTION', 'ARTICLE', 'ANNOUNCEMENT'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setPostType(type)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${postType === type
              ? 'bg-constitution-gold text-justice-black shadow-md'
              : 'bg-constitution-gold/10 text-constitution-gold hover:bg-constitution-gold/20'
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div className="w-12 h-12 bg-constitution-gold rounded-full border-2 border-constitution-gold/30 flex items-center justify-center flex-shrink-0">
          <span className="font-heading font-bold text-justice-black">{userInitials}</span>
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

          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachedFiles.map((file) => (
                <div key={file.id} className="relative group">
                  {file.type === 'image' && file.preview ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-constitution-gold/30">
                      <img src={file.preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-constitution-gold/10 border border-constitution-gold/30 rounded-lg flex items-center gap-2">
                      <FileText className="w-4 h-4 text-constitution-gold" />
                      <span className="text-sm text-ink-gray max-w-[100px] truncate">{file.file.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hashtag Input */}
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Add hashtags (comma separated, e.g. legal, court, advice)"
                className="w-full parchment-bg border border-constitution-gold/30 rounded-lg py-2 px-4 text-ink-gray font-body focus:outline-none focus:border-constitution-gold text-sm"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
              />
            </div>
          </div>

          {/* Post Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFileSelect('image')}
                className="px-3 py-2 bg-constitution-gold/10 border border-constitution-gold/30 rounded-lg text-constitution-gold hover:bg-constitution-gold/20 transition-colors flex items-center space-x-2"
                style={{ fontSize: '0.875rem' }}
              >
                <Image className="w-4 h-4" />
                <span>Image</span>
              </button>
              <button
                onClick={() => handleFileSelect('document')}
                className="px-3 py-2 bg-constitution-gold/10 border border-constitution-gold/30 rounded-lg text-constitution-gold hover:bg-constitution-gold/20 transition-colors flex items-center space-x-2"
                style={{ fontSize: '0.875rem' }}
              >
                <FileText className="w-4 h-4" />
                <span>Document</span>
              </button>
            </div>

            <button
              onClick={handlePublish}
              disabled={(!postContent.trim() && attachedFiles.length === 0) || isPublishing}
              className="px-6 py-2 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
