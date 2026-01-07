import { useState } from 'react';
import { Reply, User, MoreVertical, Edit2, Trash2, Send, X } from 'lucide-react';
import { updateComment, deleteComment, createComment, Comment } from '../../api/postsAPI';
import { toast } from 'react-toastify';

interface CommentCardProps {
    comment: Comment;
    postId: string;
    postAuthorId?: string;
    currentUserId?: string;
    depth?: number;
    onCommentUpdated?: () => void;
    onCommentDeleted?: (commentId: string) => void;
}

export function CommentCard({
    comment,
    postId,
    postAuthorId,
    currentUserId,
    depth = 0,
    onCommentUpdated,
    onCommentDeleted
}: CommentCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showReplies, setShowReplies] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isOwner = currentUserId === comment.userId;
    const isPostAuthor = postAuthorId === comment.userId;
    const canReply = depth < 3; // Maximum 3 levels of nesting

    const handleUpdate = async () => {
        if (!editContent.trim() || editContent === comment.content) {
            setIsEditing(false);
            return;
        }

        try {
            setIsSubmitting(true);
            await updateComment(comment.id, editContent.trim());
            setIsEditing(false);
            toast.success('Comment updated');
            if (onCommentUpdated) onCommentUpdated();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            await deleteComment(comment.id);
            toast.success('Comment deleted');
            if (onCommentDeleted) onCommentDeleted(comment.id);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete comment');
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) return;

        try {
            setIsSubmitting(true);
            await createComment(postId, replyContent.trim(), comment.id);
            setReplyContent('');
            setIsReplying(false);
            toast.success('Reply added');
            if (onCommentUpdated) onCommentUpdated();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className={`flex flex-col ${depth > 0 ? 'ml-8 mt-3 border-l-2 border-constitution-gold/10 pl-4' : 'mt-4'}`}>
            <div className="flex gap-3 group">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full border border-constitution-gold/30 overflow-hidden bg-parchment-cream flex-shrink-0">
                    {comment.author.profilePhotoUrl ? (
                        <img src={comment.author.profilePhotoUrl} alt={comment.author.fullName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-constitution-gold" />
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="bg-constitution-gold/5 rounded-lg p-3 relative">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-ink-gray">{comment.author.fullName}</span>
                                {isPostAuthor && (
                                    <span className="px-1.5 py-0.5 bg-constitution-gold/20 border border-constitution-gold/30 rounded text-[8px] font-bold text-constitution-gold uppercase tracking-tighter">Author</span>
                                )}
                                {isOwner && (
                                    <span className="px-1.5 py-0.5 bg-ink-gray/10 border border-ink-gray/20 rounded text-[8px] font-bold text-ink-gray/60 uppercase tracking-tighter">You</span>
                                )}
                                <span className="text-[10px] text-ink-gray/40 uppercase tracking-wider">{formatDate(comment.createdAt)}</span>
                                {comment.isEdited && <span className="text-[10px] italic text-ink-gray/30">(edited)</span>}
                            </div>

                            {/* Options Menu */}
                            {isOwner && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="p-1 text-ink-gray/40 hover:text-constitution-gold transition-colors"
                                    >
                                        <MoreVertical className="w-3.5 h-3.5" />
                                    </button>

                                    {showMenu && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-constitution-gold/20 rounded shadow-lg z-20 py-1 overflow-hidden">
                                                <button
                                                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                                    className="w-full text-left px-3 py-1.5 text-xs text-ink-gray hover:bg-constitution-gold/5 flex items-center gap-2"
                                                >
                                                    <Edit2 className="w-3 h-3" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => { handleDelete(); setShowMenu(false); }}
                                                    className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Comment Body */}
                        {isEditing ? (
                            <div className="space-y-2 mt-2">
                                <textarea
                                    className="w-full parchment-bg border border-constitution-gold/30 rounded p-2 text-sm text-ink-gray focus:outline-none focus:border-constitution-gold resize-none"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={2}
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-gray/50 hover:text-ink-gray transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={isSubmitting || !editContent.trim()}
                                        className="px-2 py-1 bg-constitution-gold text-justice-black rounded text-[10px] font-bold uppercase tracking-wider shadow-sm hover:bg-constitution-gold/90 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-ink-gray/80 whitespace-pre-wrap">{comment.content}</p>
                        )}
                    </div>

                    {/* Actions bar */}
                    {!isEditing && (
                        <div className="flex items-center gap-4 mt-1.5 ml-1">
                            {canReply && (
                                <button
                                    onClick={() => setIsReplying(!isReplying)}
                                    className="flex items-center gap-1.5 text-ink-gray/40 hover:text-constitution-gold transition-colors"
                                >
                                    <Reply className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Reply</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Reply Input */}
                    {isReplying && (
                        <div className="mt-3 flex gap-2">
                            <textarea
                                className="flex-1 parchment-bg border border-constitution-gold/30 rounded-lg px-3 py-2 text-xs text-ink-gray focus:outline-none focus:border-constitution-gold resize-none"
                                placeholder="Write your reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                rows={2}
                                autoFocus
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleReply}
                                    disabled={isSubmitting || !replyContent.trim()}
                                    className="p-2 bg-constitution-gold text-justice-black rounded-lg shadow-sm hover:bg-constitution-gold/90 transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setIsReplying(false)}
                                    className="p-2 bg-ink-gray/5 text-ink-gray/40 rounded-lg hover:bg-ink-gray/10 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && showReplies && (
                        <div className="mt-2">
                            {comment.replies.map((reply) => (
                                <CommentCard
                                    key={reply.id}
                                    comment={reply}
                                    postId={postId}
                                    postAuthorId={postAuthorId}
                                    currentUserId={currentUserId}
                                    depth={depth + 1}
                                    onCommentUpdated={onCommentUpdated}
                                    onCommentDeleted={onCommentDeleted}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
