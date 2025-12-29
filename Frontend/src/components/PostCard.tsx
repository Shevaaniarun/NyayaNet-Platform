/**
 * PostCard - Legal Feed Post with Aged Paper Effect
 * Displays professional legal posts with constitution-inspired design
 */

import { useState } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, MoreVertical, Scale, X, Send, Flag, EyeOff, Link2 } from 'lucide-react';

export interface Post {
  id: string;
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
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; text: string; author: string; time: string }>>([]);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      alert('Post saved to bookmarks!');
    }
  };

  const handleShare = () => {
    const shareText = `Check out this legal insight from ${post.author.fullName} on NyayaNet:\n\n"${post.content.substring(0, 100)}..."`;

    if (navigator.share) {
      navigator.share({
        title: 'Legal Insight - NyayaNet',
        text: shareText,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        alert('Post link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Post link copied to clipboard!');
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const submitComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      text: commentText,
      author: 'You',
      time: 'Just now'
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    switch (action) {
      case 'copyLink':
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        alert('Post link copied!');
        break;
      case 'report':
        alert('Thank you for reporting. Our team will review this post.');
        break;
      case 'hide':
        alert('This post will be hidden from your feed.');
        break;
    }
  };

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
                src={post.author.profilePhotoUrl}
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
              <span className="text-ink-gray/70" style={{ fontSize: '0.875rem' }}>{post.author.designation}</span>
            </div>
            <div className="flex items-center text-ink-gray/60 space-x-3" style={{ fontSize: '0.75rem' }}>
              <span>{post.createdAt}</span>
              <span className="flex items-center">
                <Scale className="w-3 h-3 mr-1" />
                {post.author.organization}
              </span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-6">
          {/* Post Type Indicator */}
          <div className="inline-flex items-center px-3 py-1 mb-4 bg-constitution-gold/10 border border-constitution-gold/30 rounded-full">
            <span className="text-constitution-gold tracking-wide uppercase font-medium" style={{ fontSize: '0.75rem' }}>
              {post.postType.replace('_', ' ')}
            </span>
          </div>

          {/* Content */}
          <div className="constitution-texture p-6 rounded">
            <p className="text-ink-gray leading-relaxed font-body">
              {post.content}
            </p>
          </div>

          {/* Media Attachments */}
          {post.media && post.media.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {post.media.map((media) => (
                <div
                  key={media.id}
                  className="rounded-lg overflow-hidden border border-constitution-gold/20 bg-parchment-cream aspect-video"
                >
                  <img
                    src={media.url}
                    alt="Post media"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-constitution-gold/5 border border-constitution-gold/20 rounded-full text-ink-gray/80 hover:bg-constitution-gold/10 transition-colors cursor-pointer"
                  style={{ fontSize: '0.875rem' }}
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
              className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-500' : 'text-ink-gray/70 hover:text-constitution-gold'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={handleComment}
              className={`flex items-center space-x-2 transition-colors ${showComments ? 'text-constitution-gold' : 'text-ink-gray/70 hover:text-constitution-gold'}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>{post.commentCount + comments.length}</span>
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
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white border border-constitution-gold/20 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleMenuAction('copyLink')}
                  className="w-full px-4 py-2 text-left text-sm text-ink-gray hover:bg-constitution-gold/5 flex items-center gap-2"
                >
                  <Link2 className="w-4 h-4" /> Copy Link
                </button>
                <button
                  onClick={() => handleMenuAction('hide')}
                  className="w-full px-4 py-2 text-left text-sm text-ink-gray hover:bg-constitution-gold/5 flex items-center gap-2"
                >
                  <EyeOff className="w-4 h-4" /> Hide Post
                </button>
                <button
                  onClick={() => handleMenuAction('report')}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <Flag className="w-4 h-4" /> Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-constitution-gold/20">
            {/* Existing Comments */}
            {comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-constitution-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-constitution-gold">{comment.author.charAt(0)}</span>
                    </div>
                    <div className="flex-1 bg-constitution-gold/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-ink-gray">{comment.author}</span>
                        <span className="text-xs text-ink-gray/50">{comment.time}</span>
                      </div>
                      <p className="text-sm text-ink-gray/80">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-constitution-gold rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-justice-black">AP</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-sm text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
                <button
                  onClick={submitComment}
                  disabled={!commentText.trim()}
                  className="px-3 py-2 bg-constitution-gold text-justice-black rounded-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Decorative Border */}
      <div className="absolute -bottom-4 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-constitution-gold/30 to-transparent"></div>

      {/* Click outside to close menu */}
      {showMenu && <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />}
    </div>
  );
}
