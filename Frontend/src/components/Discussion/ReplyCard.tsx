import { useState } from 'react';
import { Heart, Reply, Flag, MessageSquare, CheckCircle, User, MessageCircle } from 'lucide-react';

export interface ReplyType {
    id: string;
    content: string;
    upvoteCount: number;
    replyCount: number;
    isEdited: boolean;
    createdAt: string;
    author: {
        id: string;
        fullName?: string;
        role?: string;
        profilePhotoUrl?: string | null;
    };
    hasUpvoted?: boolean;
    replies: ReplyType[];
    isBestAnswer?: boolean;
}

interface ReplyCardProps {
    reply: ReplyType;
    depth?: number;
    canMarkBestAnswer?: boolean;
    onUpvote?: (replyId: string) => void;
    onReply?: (replyId: string, authorName: string) => void;
    onMarkBestAnswer?: (replyId: string) => void;
}

export function ReplyCard({
    reply,
    depth = 0,
    canMarkBestAnswer = false,
    onUpvote,
    onReply,
    onMarkBestAnswer,
}: ReplyCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const canReply = depth < 3;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className={`${depth > 0 ? 'ml-6 md:ml-10 mt-4 border-l-2 border-constitution-gold/10 pl-4 md:pl-6' : 'mt-8'}`}>
            <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full border border-constitution-gold/30 overflow-hidden bg-parchment-cream">
                        {reply.author.profilePhotoUrl ? (
                            <img
                                src={reply.author.profilePhotoUrl}
                                alt={reply.author.fullName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-constitution-gold" />
                            </div>
                        )}
                    </div>
                    {reply.isBestAnswer && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-constitution-gold rounded-full border-2 border-parchment-cream flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-3 h-3 text-justice-black" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-ink-gray text-sm">{reply.author.fullName}</span>
                            {reply.author.role && (
                                <span className="text-[10px] uppercase font-bold text-constitution-gold/60 tracking-wider">
                                    {reply.author.role.replace('_', ' ')}
                                </span>
                            )}
                            <span className="w-1 h-1 bg-ink-gray/20 rounded-full"></span>
                            <span className="text-ink-gray/40 text-xs">{formatDate(reply.createdAt)}</span>
                            {reply.isEdited && <span className="italic text-ink-gray/30 text-[10px]">(edited)</span>}
                        </div>

                        {canMarkBestAnswer && !reply.isBestAnswer && (
                            <button
                                onClick={() => onMarkBestAnswer?.(reply.id)}
                                className="text-[10px] font-bold uppercase tracking-widest text-constitution-gold hover:text-gavel-bronze transition-colors flex items-center gap-1"
                            >
                                <CheckCircle className="w-3 h-3" />
                                Select as Best
                            </button>
                        )}
                    </div>

                    <div className="constitution-texture p-4 rounded-xl border border-constitution-gold/5 shadow-sm">
                        <p className="text-ink-gray text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => onUpvote?.(reply.id)}
                            className={`flex items-center gap-1.5 transition-colors group ${reply.hasUpvoted ? 'text-constitution-gold' : 'text-ink-gray/40 hover:text-constitution-gold'
                                }`}
                        >
                            <Heart className={`w-3.5 h-3.5 ${reply.hasUpvoted ? 'fill-current' : ''}`} />
                            <span className="text-xs font-bold">{reply.upvoteCount}</span>
                        </button>

                        {canReply && (
                            <button
                                onClick={() => onReply?.(reply.id, reply.author.fullName || 'User')}
                                className="flex items-center gap-1.5 text-ink-gray/40 hover:text-constitution-gold transition-colors"
                            >
                                <Reply className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-tight">Reply</span>
                            </button>
                        )}

                        <button className="flex items-center gap-1.5 text-ink-gray/40 hover:text-seal-red transition-colors ml-auto">
                            <Flag className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {reply.replyCount > 0 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-3 flex items-center gap-2 text-constitution-gold hover:text-gavel-bronze transition-colors bg-constitution-gold/5 px-3 py-1.5 rounded-full"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">
                                {isExpanded ? 'Hide' : 'Show'} {reply.replyCount} {reply.replyCount === 1 ? 'Reply' : 'Replies'}
                            </span>
                        </button>
                    )}

                    {isExpanded && reply.replies.length > 0 && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            {reply.replies.map((nestedReply) => (
                                <ReplyCard
                                    key={nestedReply.id}
                                    reply={nestedReply}
                                    depth={depth + 1}
                                    canMarkBestAnswer={canMarkBestAnswer}
                                    onUpvote={onUpvote}
                                    onReply={onReply}
                                    onMarkBestAnswer={onMarkBestAnswer}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
