/**
 * PostCard - Legal Feed Post with Aged Paper Effect
 * Displays professional legal posts with constitution-inspired design
 */

import { Heart, MessageSquare, Share2, Bookmark, MoreVertical, Scale } from 'lucide-react';

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
            <button className="flex items-center space-x-2 text-ink-gray/70 hover:text-constitution-gold transition-colors">
              <Heart className="w-5 h-5" />
              <span>{post.likeCount}</span>
            </button>
            <button className="flex items-center space-x-2 text-ink-gray/70 hover:text-constitution-gold transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span>{post.commentCount}</span>
            </button>
            <button className="flex items-center space-x-2 text-ink-gray/70 hover:text-constitution-gold transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button className="text-ink-gray/70 hover:text-constitution-gold transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="text-ink-gray/70 hover:text-constitution-gold transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Border */}
      <div className="absolute -bottom-4 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-constitution-gold/30 to-transparent"></div>
    </div>
  );
}
