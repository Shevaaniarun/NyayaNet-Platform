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
  Link
} from 'lucide-react';
import { likePost, savePost, createComment, deletePost } from '../api/postsAPI';
import { toast } from 'react-toastify';

export interface Post {
  id: string;
  userId: string;
  author: {
    fullName: string;
    profilePhotoUrl: string;
    role: string;
    designation: string;
    organization: string;
  };
  postType: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  tags?: string[];
  media?: Array<{
    id: string;
    url: string;
    type: string;
  }>;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
  onAuthorClick?: (userId: string) => void; // Added prop
}

export function PostCard({ post, currentUserId, onDelete, onAuthorClick }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isBookmarked, setIsBookmarked] = useState(post.isSaved || false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; content: string; author: { fullName: string }; createdAt: string; userId: string }>>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === post.userId;

  // Get current user initials for comment input
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userInitials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleLike = async () => {
    try {
      const result = await likePost(post.id);
      setIsLiked(result.liked);
      setLikeCount(result.count);
      toast.success(result.liked ? 'Post liked' : 'Post unliked');
    } catch (error: any) {
      toast.error(error.message || 'Failed to like post');
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
      case 'delete':
        handleDelete();
        break;
    }
  };

  // Helper to render media
  const renderMedia = (media: any) => {
    const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(media.mimeType) ||
      media.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isImage) {
      return (
        <div
          key={media.id}
          className="rounded-lg overflow-hidden border border-constitution-gold/20 bg-parchment-cream aspect-video cursor-pointer hover:border-constitution-gold transition-colors"
          onClick={() => window.open(`${ASSETS_BASE_URL}${media.url}`, '_blank')}
        >
          <img
            src={`${ASSETS_BASE_URL}${media.url}`}
            alt="Post media"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    // Document / PDF UI
    return (
      <div
        key={media.id}
        className="rounded-lg border border-constitution-gold/30 bg-constitution-gold/5 p-4 flex items-center justify-between group cursor-pointer hover:bg-constitution-gold/10 transition-colors"
        onClick={() => window.open(`${ASSETS_BASE_URL}${media.url}`, '_blank')}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded bg-constitution-gold/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-constitution-gold" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-ink-gray truncate">{media.fileName || 'Document'}</p>
            <p className="text-xs text-ink-gray/60 uppercase">{media.mimeType?.split('/')[1] || 'File'}</p>
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
            <div
              className="w-12 h-12 rounded-full border-2 border-constitution-gold overflow-hidden bg-parchment-cream"
              onClick={onAuthorClick ? () => onAuthorClick(post.userId) : undefined}
              style={onAuthorClick ? { cursor: 'pointer' } : undefined}
            >
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
              <h3
                className="font-heading font-semibold text-ink-gray"
                onClick={onAuthorClick ? () => onAuthorClick(post.userId) : undefined}
                style={onAuthorClick ? { cursor: 'pointer' } : undefined}
              >
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
        </div>

        {/* Interaction Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-constitution-gold/20">
          <div className="flex space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-500' : 'text-ink-gray/70 hover:text-red-500'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-bold">{likeCount}</span>
            </button>
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
                    <button
                      onClick={() => handleMenuAction('delete')}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete post</span>
                    </button>
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
                {/* Existing Comments */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-constitution-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-constitution-gold">
                          {comment.author?.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 bg-constitution-gold/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-ink-gray">
                            {comment.author?.fullName || 'Anonymous'}
                          </span>
                          <span className="text-xs text-ink-gray/50">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-ink-gray/80">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-ink-gray/40 text-sm py-2">No comments yet. Be the first to share your thoughts!</p>
                  )}
                </div>

                {/* Comment Input */}
                <div className="flex gap-3 mt-4">
                  <div className="w-8 h-8 bg-constitution-gold rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-justice-black">{userInitials}</span>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                      placeholder="Share your legal perspective..."
                      className="flex-1 px-4 py-2 bg-white border border-constitution-gold/30 rounded-lg text-sm text-ink-gray focus:outline-none focus:border-constitution-gold transition-colors"
                    />
                    <button
                      onClick={submitComment}
                      disabled={!commentText.trim()}
                      className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-bold disabled:opacity-50 hover:bg-constitution-gold/90 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
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
