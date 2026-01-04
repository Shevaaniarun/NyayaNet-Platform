import { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreVertical,
  Scale,
  Send,
  Flag,
  EyeOff,
  Link2,
  Trash2,
  Loader2,
  FileText,
  X,
  ExternalLink,
  Link,
  Eye,
  Smile,
  Zap,
  Award,
  ThumbsUp,
  Lightbulb,
  Info,
  HelpCircle,
  Edit2
} from 'lucide-react';
import { likePost, savePost, createComment, deletePost, updatePost, uploadFiles } from '../api/postsAPI';
import { toast } from 'react-toastify';
import { CommentCard } from './Post/CommentCard';
import { useRef } from 'react';

export interface Post {
  id: string;
  userId: string;
  title?: string;
  author: {
    fullName: string;
    profilePhotoUrl: string | null;
    role?: string;
    designation?: string;
    organization?: string;
  };
  postType: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  tags?: string[];
  media?: Array<{
    id: string;
    mediaUrl: string;
    mediaType: string;
    fileName?: string;
    mimeType?: string;
  }>;
  isLiked?: boolean;
  isSaved?: boolean;
  reactionType?: string | null;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [reactionType, setReactionType] = useState<string | null>(post.reactionType || null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post.isSaved || false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content);
  const [editPostType, setEditPostType] = useState<any>(post.postType);
  const [editMedia, setEditMedia] = useState<any[]>(post.media || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isSavingPost, setIsSavingPost] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const isOwner = currentUserId === post.userId;

  // Get current user initials for comment input
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userInitials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleReaction = async (type: string = 'LIKE') => {
    try {
      const result = await likePost(post.id, type);
      setIsLiked(result.liked);
      setLikeCount(result.count);
      setReactionType(result.reactionType);
      setShowReactionPicker(false);

      if (result.liked) {
        toast.success(`You reacted with ${type.toLowerCase().replace('_', ' ')}`);
      } else {
        toast.info('Reaction removed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process reaction');
    }
  };

  const handleLikeClick = () => {
    // If already liked, toggle it off. If not, open picker or just like.
    if (isLiked) {
      handleReaction(reactionType || 'LIKE');
    } else {
      handleReaction('LIKE');
    }
  };

  const handleBookmark = async () => {
    try {
      const result = await savePost(post.id);
      setIsBookmarked(result.saved);
      toast.success(result.saved ? 'Post saved to bookmarks!' : 'Post removed from bookmarks');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save post');
    }
  };

  const handleShare = () => {
    const shareText = `Check out this legal insight from ${post.author.fullName} on NyayaNet:\n\n"${post.content.substring(0, 100)}..."`;

    if (navigator.share) {
      navigator.share({
        title: 'Legal Insight - NyayaNet',
        text: shareText,
        url: `${window.location.origin}/post/${post.id}`
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        toast.info('Post link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.info('Post link copied to clipboard!');
    }
  };

  const handleCommentToggle = async () => {
    const newState = !showComments;
    setShowComments(newState);
    if (newState && comments.length === 0) {
      fetchComments();
    }
  };

  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      const { getComments } = await import('../api/postsAPI');
      const data = await getComments(post.id);
      setComments(data as any);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleEditPost = () => {
    setIsEditingPost(true);
    setEditTitle(post.title || '');
    setEditContent(post.content);
    setEditMedia(post.media || []);
    setNewFiles([]);
    setShowMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    setNewFiles([...newFiles, ...fileList]);

    // Create temporary media objects for preview
    const tempMedia = fileList.map(file => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      mediaUrl: type === 'image' ? URL.createObjectURL(file) : '',
      mediaType: type === 'image' ? 'IMAGE' : 'DOCUMENT',
      fileName: file.name,
      file,
      isNew: true
    }));

    setEditMedia([...editMedia, ...tempMedia]);
    e.target.value = '';
  };

  const removeMedia = (mediaId: string) => {
    const mediaToRemove = editMedia.find(m => m.id === mediaId);
    if (mediaToRemove?.isNew && mediaToRemove.mediaUrl) {
      URL.revokeObjectURL(mediaToRemove.mediaUrl);
    }
    setEditMedia(editMedia.filter(m => m.id !== mediaId));
    // Also remove from newFiles if it's there
    if (mediaToRemove?.isNew) {
      setNewFiles(newFiles.filter(f => f !== mediaToRemove.file));
    }
  };

  const handleSavePost = async () => {
    if (!editContent.trim()) return;

    try {
      setIsSavingPost(true);

      let uploadedMedia: any[] = editMedia.filter(m => !m.isNew).map(m => ({
        mediaType: m.mediaType,
        mediaUrl: m.mediaUrl,
        fileName: m.fileName,
        mimeType: m.mimeType
      }));

      if (newFiles.length > 0) {
        toast.info('Uploading new files...');
        const newUploaded = await uploadFiles(newFiles);
        uploadedMedia = [...uploadedMedia, ...newUploaded];
      }

      await updatePost(post.id, {
        title: editTitle.trim() || undefined,
        content: editContent.trim(),
        postType: editPostType,
        media: uploadedMedia as any[]
      });

      toast.success('Post updated successfully');
      setIsEditingPost(false);
      // Refresh the page or update local state if needed
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update post');
    } finally {
      setIsSavingPost(false);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;

    try {
      const newComment = await createComment(post.id, commentText);
      setComments([newComment as any, ...comments]);
      setCommentText('');
      toast.success('Comment added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setIsDeleting(true);
      await deletePost(post.id);
      toast.success('Post deleted successfully');
      if (onDelete) onDelete(post.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMenuAction = async (action: string) => {
    setShowMenu(false);
    switch (action) {
      case 'copy':
        try {
          const postUrl = `${window.location.origin}/posts/${post.id}`;
          await navigator.clipboard.writeText(postUrl);
          toast.success('Post link copied to clipboard!');
        } catch (err) {
          toast.error('Failed to copy link');
        }
        break;
      case 'report':
        toast.info('Thank you for reporting. Our team will review this post.');
        break;
      case 'hide':
        toast.info('This post will be hidden from your feed.');
        break;
      case 'edit':
        handleEditPost();
        break;
      case 'delete':
        handleDelete();
        break;
    }
  };

  // Helper to render media
  const renderMedia = (media: any) => {
    const isImage = media.mediaType === 'IMAGE' ||
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(media.mimeType) ||
      media.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isImage) {
      return (
        <div
          key={media.id}
          className="rounded-lg overflow-hidden border border-constitution-gold/20 bg-parchment-cream aspect-video cursor-pointer hover:border-constitution-gold transition-colors"
          onClick={() => window.open(`${ASSETS_BASE_URL}${media.mediaUrl}`, '_blank')}
        >
          <img
            src={`${ASSETS_BASE_URL}${media.mediaUrl}`}
            alt="Post media"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Media+Not+Found';
            }}
          />
        </div>
      );
    }

    // Document / PDF UI
    return (
      <div
        key={media.id}
        className="rounded-lg border border-constitution-gold/30 bg-constitution-gold/5 p-4 flex items-center justify-between group cursor-pointer hover:bg-constitution-gold/10 transition-colors"
        onClick={() => window.open(`${ASSETS_BASE_URL}${media.mediaUrl}`, '_blank')}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded bg-constitution-gold/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-constitution-gold" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-ink-gray truncate">{media.fileName || 'Document'}</p>
            <p className="text-xs text-ink-gray/60 uppercase">{media.mimeType?.split('/')[1] || media.mediaType || 'File'}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-constitution-gold text-justice-black opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>
    );
  };

  // Fix: Display Post Type Badge
  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'QUESTION': return 'Question';
      case 'ARTICLE': return 'Article';
      case 'ANNOUNCEMENT': return 'Announcement';
      default: return 'Insight';
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'QUESTION': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'ARTICLE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      case 'ANNOUNCEMENT': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      default: return 'text-constitution-gold bg-constitution-gold/10 border-constitution-gold/30';
    }
  };

  const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
  const ASSETS_BASE_URL = API_BASE_URL.replace('/api', '');

  return (
    <div className="relative mb-8">
      {/* Aged Paper Container */}
      <div className="aged-paper rounded-lg p-6 relative overflow-hidden">
        {/* Top Border Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-constitution-gold to-transparent"></div>

        {/* Corner Accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-constitution-gold opacity-30"></div>
        <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-constitution-gold opacity-30"></div>

        {/* Author Section */}
        <div className="flex items-center mb-6 pb-4 border-b border-constitution-gold/20">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-constitution-gold overflow-hidden bg-parchment-cream">
              <img
                src={post.author.profilePhotoUrl || 'https://via.placeholder.com/150'}
                alt={post.author.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Role Badge */}
            <div className="absolute -bottom-1 -right-1">
              <div className="w-6 h-6 bg-constitution-gold rounded-full border-2 border-parchment-cream flex items-center justify-center">
                <Scale className="w-3 h-3 text-justice-black" />
              </div>
            </div>
          </div>

          <div className="ml-4 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-heading font-semibold text-ink-gray">
                {post.author.fullName}
              </h3>
              <span className="text-constitution-gold">•</span>
              <span className="text-ink-gray/70" style={{ fontSize: '0.875rem' }}>{post.author.designation || 'Legal Professional'}</span>
            </div>
            <div className="flex items-center text-ink-gray/60 space-x-3" style={{ fontSize: '0.75rem' }}>
              <span>{post.createdAt}</span>
              {post.author.organization && (
                <span className="flex items-center">
                  <Scale className="w-3 h-3 mr-1" />
                  {post.author.organization}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-6">
          {/* Post Type Indicator */}
          <div className={`inline-flex items-center px-3 py-1 mb-4 border rounded-full ${getPostTypeColor(post.postType)}`}>
            <span className="tracking-wide uppercase font-bold" style={{ fontSize: '0.7rem' }}>
              {getPostTypeLabel(post.postType)}
            </span>
          </div>

          {isEditingPost ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full parchment-bg border border-constitution-gold/30 rounded-lg p-3 text-ink-gray font-heading font-semibold focus:outline-none focus:border-constitution-gold"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Content..."
                rows={4}
                className="w-full parchment-bg border border-constitution-gold/30 rounded-lg p-4 text-ink-gray font-body focus:outline-none focus:border-constitution-gold resize-none"
              />

              {/* Media Management */}
              <div className="flex flex-wrap gap-2">
                {editMedia.map((m) => (
                  <div key={m.id} className="relative group">
                    {m.mediaType === 'IMAGE' ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-constitution-gold/30">
                        <img src={m.isNew ? m.mediaUrl : `${ASSETS_BASE_URL}${m.mediaUrl}`} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="px-3 py-2 bg-constitution-gold/10 border border-constitution-gold/30 rounded-lg flex items-center gap-2">
                        <FileText className="w-4 h-4 text-constitution-gold" />
                        <span className="text-xs text-ink-gray max-w-[80px] truncate">{m.fileName}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeMedia(m.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'image')} />
                <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx" multiple onChange={(e) => handleFileChange(e, 'document')} />
                <button onClick={() => imageInputRef.current?.click()} className="px-3 py-1.5 bg-constitution-gold/10 border border-constitution-gold/30 rounded text-constitution-gold text-xs font-bold uppercase">Add Image</button>
                <button onClick={() => docInputRef.current?.click()} className="px-3 py-1.5 bg-constitution-gold/10 border border-constitution-gold/30 rounded text-constitution-gold text-xs font-bold uppercase">Add Doc</button>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsEditingPost(false)}
                  className="px-4 py-2 text-sm font-bold uppercase text-ink-gray/50 hover:text-ink-gray transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePost}
                  disabled={isSavingPost || !editContent.trim()}
                  className="px-6 py-2 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors shadow-lg flex items-center gap-2"
                >
                  {isSavingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Title (if present) */}
              {post.title && (
                <h2 className="text-2xl font-heading font-bold text-ink-gray mb-4">
                  {post.title}
                </h2>
              )}

              {/* Content */}
              <div className="constitution-texture p-6 rounded">
                <p className="text-ink-gray leading-relaxed font-body whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Media Attachments */}
              {post.media && post.media.length > 0 && (
                <div className="mt-4 flex flex-col gap-3">
                  {post.media.map((media) => renderMedia(media))}
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-constitution-gold/5 border border-constitution-gold/20 rounded-full text-constitution-gold font-medium hover:bg-constitution-gold/10 transition-colors cursor-pointer"
                      style={{ fontSize: '0.8rem' }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Interaction Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-constitution-gold/20">
          <div className="flex space-x-6">
            <div className="relative group/reactions">
              <button
                onClick={handleLikeClick}
                onMouseEnter={() => setShowReactionPicker(true)}
                className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-constitution-gold' : 'text-ink-gray/70 hover:text-constitution-gold'}`}
              >
                {reactionType === 'INSIGHTFUL' ? (
                  <Lightbulb className="w-5 h-5 fill-amber-500 text-amber-500" />
                ) : reactionType === 'INFORMATIVE' ? (
                  <Info className="w-5 h-5 fill-blue-500 text-blue-500" />
                ) : reactionType === 'NEED_CLARIFICATION' ? (
                  <HelpCircle className="w-5 h-5 fill-purple-500 text-purple-500" />
                ) : (
                  <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                )}
                <span className="font-bold">{likeCount}</span>
              </button>

              {/* Reaction Picker Popover */}
              {showReactionPicker && (
                <div
                  className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-full shadow-xl border border-constitution-gold/20 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 z-50"
                  onMouseLeave={() => setShowReactionPicker(false)}
                >
                  <button
                    onClick={() => handleReaction('LIKE')}
                    className="p-2 hover:bg-constitution-gold/10 rounded-full transition-colors group/reaction"
                    title="Like"
                  >
                    <ThumbsUp className={`w-6 h-6 ${reactionType === 'LIKE' ? 'fill-constitution-gold text-constitution-gold' : 'text-ink-gray/40 group-hover/reaction:text-constitution-gold'}`} />
                  </button>
                  <button
                    onClick={() => handleReaction('INSIGHTFUL')}
                    className="p-2 hover:bg-amber-50 rounded-full transition-colors group/reaction"
                    title="Insightful"
                  >
                    <Lightbulb className={`w-6 h-6 ${reactionType === 'INSIGHTFUL' ? 'fill-amber-500 text-amber-500' : 'text-ink-gray/40 group-hover/reaction:text-amber-500'}`} />
                  </button>
                  <button
                    onClick={() => handleReaction('INFORMATIVE')}
                    className="p-2 hover:bg-blue-50 rounded-full transition-colors group/reaction"
                    title="Informative"
                  >
                    <Info className={`w-6 h-6 ${reactionType === 'INFORMATIVE' ? 'fill-blue-500 text-blue-500' : 'text-ink-gray/40 group-hover/reaction:text-blue-500'}`} />
                  </button>
                  <button
                    onClick={() => handleReaction('NEED_CLARIFICATION')}
                    className="p-2 hover:bg-purple-50 rounded-full transition-colors group/reaction"
                    title="Need Clarification"
                  >
                    <HelpCircle className={`w-6 h-6 ${reactionType === 'NEED_CLARIFICATION' ? 'fill-purple-500 text-purple-500' : 'text-ink-gray/40 group-hover/reaction:text-purple-500'}`} />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleCommentToggle}
              className={`flex items-center space-x-2 transition-colors ${showComments ? 'text-constitution-gold' : 'text-ink-gray/70 hover:text-constitution-gold'}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-bold">{post.commentCount + comments.length}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-ink-gray/70 hover:text-constitution-gold transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3 relative">
            <button
              onClick={handleBookmark}
              className={`transition-colors ${isBookmarked ? 'text-constitution-gold' : 'text-ink-gray/70 hover:text-constitution-gold'}`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-ink-gray/70 hover:text-constitution-gold transition-colors"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreVertical className="w-5 h-5" />}
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-constitution-gold/20 rounded-lg shadow-2xl z-[101] py-2 overflow-hidden ring-1 ring-black ring-opacity-5">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Options</p>
                  </div>
                  <button
                    onClick={() => handleMenuAction('copy')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-constitution-gold/5 flex items-center space-x-3 transition-colors"
                  >
                    <Link className="w-4 h-4 text-constitution-gold" />
                    <span>Copy link to post</span>
                  </button>
                  {isOwner && (
                    <>
                      <button
                        onClick={() => handleMenuAction('edit')}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-constitution-gold/5 flex items-center space-x-3 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-constitution-gold" />
                        <span>Edit post</span>
                      </button>
                      <button
                        onClick={() => handleMenuAction('delete')}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete post</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleMenuAction('report')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-constitution-gold/5 flex items-center space-x-3 transition-colors"
                  >
                    <Flag className="w-4 h-4 text-gray-400" />
                    <span>Report post</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction('hide')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-constitution-gold/5 flex items-center space-x-3 transition-colors"
                  >
                    <EyeOff className="w-4 h-4 text-gray-400" />
                    <span>Hide post</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-constitution-gold/20">
            {isLoadingComments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-constitution-gold animate-spin" />
              </div>
            ) : (
              <>
                {/* Existing Comments (Recursive) */}
                <div className="space-y-4 mb-6">
                  {comments.map((comment: any) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      postId={post.id}
                      currentUserId={currentUserId}
                      onCommentUpdated={fetchComments}
                      onCommentDeleted={fetchComments}
                    />
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-ink-gray/40 text-sm py-4 italic">
                      No legal insights shared yet. Be the first to analyze this post.
                    </p>
                  )}
                </div>

                {/* Comment Input */}
                <div className="flex gap-4 items-start bg-constitution-gold/5 p-4 rounded-xl border border-constitution-gold/10">
                  <div className="w-10 h-10 bg-constitution-gold rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-sm font-bold text-justice-black">{userInitials}</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your legal perspective..."
                      className="w-full px-4 py-3 bg-white border border-constitution-gold/20 rounded-xl text-sm text-ink-gray focus:outline-none focus:border-constitution-gold transition-all shadow-inner resize-none"
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={submitComment}
                        disabled={!commentText.trim()}
                        className="px-6 py-2 bg-constitution-gold text-justice-black rounded-lg font-bold disabled:opacity-50 hover:bg-constitution-gold/90 transition-all flex items-center gap-2 shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                        <span>Insight</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Decorative Border */}
      <div className="absolute -bottom-4 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-constitution-gold/30 to-transparent"></div>
    </div>
  );
}
