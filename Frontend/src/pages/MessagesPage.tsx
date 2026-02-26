/**
 * Messages Page - WhatsApp/Instagram-style split-pane view
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getConversations,
  getMessages,
  sendMessage,
  sendMedia,
  getConversationDetails,
  startPrivateConversation,
  createGroup,
  editMessage,
  deleteMessage,
  markConversationRead,
  blockUser,
  unblockUser,
  getBlockedUsers,
  API_BASE_URL
} from '../api/messagesAPI';
import {
  ArrowLeft, Send, User, Clock, Calendar, Shield, Paperclip,
  Mic, MoreVertical, Check, CheckCheck, Info, VolumeX,
  MessageCircle, AlertCircle, Search, Gavel, Plus, X, Trash2, Edit2, Ban, Image as ImageIcon, FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Message {
  id: string;
  sender_id: string;
  message_type: 'TEXT' | 'IMAGE' | 'PDF' | 'SYSTEM';
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  sender_name: string;
  sender_photo: string;
  sender_role: string;
}

interface Conversation {
  id: string;
  conversation_type: 'PRIVATE' | 'GROUP';
  display_name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  other_user_id?: string;
}

interface MessagesPageProps {
  onNavigate: (path: string) => void;
  urlId?: string | null;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ onNavigate, urlId: propId }) => {
  const urlId = propId || null;
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvDetails, setActiveConvDetails] = useState<any | null>(null);

  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Group creation state
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');

  // Message edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser?.id;

  // 1. Fetch Conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConv(true);
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  }, []);

  // 2. Resolve Active Conversation
  useEffect(() => {
    const resolveChat = async () => {
      if (!urlId) {
        setActiveConvId(null);
        setMessages([]);
        setActiveConvDetails(null);
        return;
      }

      try {
        setLoading(true);
        // Try getting details (assuming urlId is conversationId)
        try {
          const details = await getConversationDetails(urlId);
          if (details) {
            setActiveConvId(urlId);
            setActiveConvDetails(details);
            const msgs = await getMessages(urlId);
            setMessages(msgs);
            return;
          }
        } catch (e) {
          // If 404/error, it might be a userId
          const { conversationId } = await startPrivateConversation(urlId);
          onNavigate(`/messages/${conversationId}`); // Redirect to canonical convo URL
        }
      } catch (err) {
        toast.error('Failed to load chat');
        onNavigate('/messages');
      } finally {
        setLoading(false);
      }
    };

    resolveChat();
  }, [urlId]);

  // 3. Polling for messages
  useEffect(() => {
    if (!activeConvId) return;

    const interval = setInterval(async () => {
      try {
        const msgs = await getMessages(activeConvId);
        setMessages(msgs);
        // Also update unread count for this convo in sidebar if needed
      } catch (e) { }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConvId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- ACTIONS ---

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    try {
      setSending(true);
      await sendMessage(activeConvId, newMessage);
      setNewMessage('');
      const msgs = await getMessages(activeConvId);
      setMessages(msgs);
      fetchConversations();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvId) return;

    const type = file.type.startsWith('image/') ? 'IMAGE' : 'PDF';
    if (type === 'PDF' && file.type !== 'application/pdf') {
      toast.warn('Only images and PDFs are supported');
      return;
    }

    try {
      setSending(true);
      await sendMedia(activeConvId, file, type);
      const msgs = await getMessages(activeConvId);
      setMessages(msgs);
      fetchConversations();
    } catch (err: any) {
      toast.error('Upload failed');
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (id: string, content: string) => {
    try {
      await editMessage(id, content);
      setEditingMessageId(null);
      const msgs = await getMessages(activeConvId!);
      setMessages(msgs);
      toast.success('Message updated');
    } catch (e) {
      toast.error('Failed to edit');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
      const msgs = await getMessages(activeConvId!);
      setMessages(msgs);
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupTitle.trim()) return;
    try {
      const { conversationId } = await createGroup(groupTitle, []);
      setShowCreateGroup(false);
      setGroupTitle('');
      onNavigate(`/messages/${conversationId}`);
      fetchConversations();
    } catch (e) {
      toast.error('Failed to create group');
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const filteredConversations = conversations.filter(c => {
    const name = c.display_name || 'Unnamed Conversation';
    return name.toLowerCase().includes(sidebarSearch.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-justice-black overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-constitution-gold/20 flex flex-col bg-justice-black/40 ${urlId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-constitution-gold/20 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-judge-ivory text-xl tracking-tight">Legal Chambers</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateGroup(true)}
                className="p-2 text-constitution-gold hover:bg-constitution-gold/10 rounded-lg transition-all"
                title="Create Group"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('/chat-with-us')}
                className="p-2 text-constitution-gold hover:bg-constitution-gold/10 rounded-lg transition-all"
                title="New Chat"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-constitution-gold/40" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-constitution-gold/5 border border-constitution-gold/10 rounded-xl text-sm text-judge-ivory placeholder-judge-ivory/20 focus:outline-none focus:border-constitution-gold/30 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingConv ? (
            <div className="p-10 flex flex-col items-center gap-4">
              <div className="w-6 h-6 border-2 border-constitution-gold/20 border-t-constitution-gold rounded-full animate-spin"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-10 text-center opacity-40">
              <Gavel className="w-12 h-12 mx-auto mb-4" />
              <p className="text-sm">No active case files</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => onNavigate(`/messages/${conv.id}`)}
                className={`p-4 flex gap-4 cursor-pointer transition-all border-l-4 hover:bg-white/5 ${activeConvId === conv.id ? 'bg-white/10 border-constitution-gold' : 'border-transparent'}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full border border-constitution-gold/20 overflow-hidden bg-constitution-gold/10 flex items-center justify-center">
                    {conv.avatar_url ? (
                      <img src={conv.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-constitution-gold/30" />
                    )}
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-constitution-gold rounded-full flex items-center justify-center text-[10px] font-bold text-justice-black shadow-lg">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-judge-ivory text-sm truncate">{conv.display_name}</h4>
                    <span className="text-[10px] text-judge-ivory/30 whitespace-nowrap ml-2">
                      {conv.last_message_at ? formatTime(conv.last_message_at) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-judge-ivory/50 truncate italic">
                    {conv.last_message || 'Start a new consultation...'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat area */}
      <div className={`flex-1 flex flex-col bg-justice-black/30 ${!urlId ? 'hidden md:flex' : 'flex'}`}>
        {!activeConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
            <Shield className="w-16 h-16 mb-6 text-constitution-gold/10" />
            <h2 className="text-2xl font-bold text-judge-ivory mb-2">Secure Communiqué</h2>
            <p className="max-w-xs text-sm">Select a legal consultation or initiate a new brief with an expert.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-constitution-gold/20 flex items-center justify-between bg-justice-black/20 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('/messages')} className="md:hidden p-2 text-constitution-gold"><ArrowLeft /></button>
                <div className="w-10 h-10 rounded-full border border-constitution-gold/30 overflow-hidden flex items-center justify-center bg-constitution-gold/5 text-constitution-gold/40">
                  <User />
                </div>
                <div>
                  <h3 className="font-bold text-judge-ivory leading-tight">{activeConvDetails?.display_name || 'Loading...'}</h3>
                  <p className="text-[10px] text-constitution-gold/60 uppercase font-black tracking-widest">
                    {activeConvDetails?.conversation_type || 'CONSULTATION'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-constitution-gold/60 hover:text-constitution-gold transition-colors"><Info className="w-5 h-5" /></button>
                <button className="p-2 text-constitution-gold/60 hover:text-constitution-gold transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
              {loading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                  <div className="w-8 h-8 border-2 border-constitution-gold/20 border-t-constitution-gold rounded-full animate-spin"></div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-constitution-gold">Reviewing Dossier</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 opacity-30 flex flex-col items-center">
                  <MessageCircle className="w-12 h-12 mb-4" />
                  <p className="text-sm font-medium">This consultation record is currently empty.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isSent = msg.sender_id === currentUserId;
                  const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;

                  return (
                    <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] flex gap-3 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="flex-shrink-0 w-8">
                          {!isSent && showAvatar && (
                            <div className="w-8 h-8 rounded-full border border-constitution-gold/20 overflow-hidden bg-constitution-gold/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-constitution-gold/30" />
                            </div>
                          )}
                        </div>

                        <div className={`group flex flex-col ${isSent ? 'items-end' : 'items-start'}`}>
                          {!isSent && showAvatar && (
                            <span className="text-[10px] font-bold text-constitution-gold/40 mb-1 ml-1">{msg.sender_name}</span>
                          )}

                          <div className="relative">
                            <div className={`px-4 py-3 rounded-2xl text-sm transition-all shadow-sm ${isSent
                              ? 'bg-constitution-gold text-justice-black rounded-tr-none'
                              : 'bg-judge-ivory/5 text-judge-ivory border border-white/10 rounded-tl-none'
                              }`}>
                              {editingMessageId === msg.id ? (
                                <div className="flex flex-col gap-2 min-w-[200px]">
                                  <textarea
                                    className="bg-black/20 p-2 rounded border border-white/20 text-white outline-none w-full"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingMessageId(null)} className="text-[10px] opacity-70">Cancel</button>
                                    <button onClick={() => handleEditMessage(msg.id, editContent)} className="text-[10px] font-bold">Save</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {msg.message_type === 'IMAGE' && (
                                    <img
                                      src={`${API_BASE_URL.replace('/api', '')}/api/messages/media/${msg.id}`}
                                      alt="Attachment"
                                      className="max-w-xs rounded-lg mb-2 border border-white/10 cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all"
                                      onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/api/messages/media/${msg.id}`, '_blank')}
                                    />
                                  )}
                                  {msg.message_type === 'PDF' && (
                                    <div
                                      className="flex items-center gap-3 p-3 bg-black/20 rounded-xl mb-2 cursor-pointer border border-white/5 hover:bg-black/30 transition-all"
                                      onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/api/messages/media/${msg.id}`, '_blank')}
                                    >
                                      <FileText className="w-8 h-8 text-red-400" />
                                      <div className="flex-1 overflow-hidden">
                                        <p className="text-xs font-bold truncate">Legal Document.pdf</p>
                                        <p className="text-[10px] opacity-50 uppercase">Open PDF</p>
                                      </div>
                                    </div>
                                  )}
                                  <span className="leading-relaxed whitespace-pre-wrap">{msg.content}</span>
                                </>
                              )}
                            </div>

                            {/* Message Actions */}
                            {isSent && !editingMessageId && (
                              <div className="absolute top-0 right-full mr-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity self-center h-full">
                                <button onClick={() => { setEditingMessageId(msg.id); setEditContent(msg.content); }} className="p-1.5 hover:bg-white/10 rounded-md"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                          </div>

                          <div className={`flex items-center gap-2 mt-1 px-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[9px] text-judge-ivory/20 font-bold uppercase">{formatTime(msg.created_at)}</span>
                            {msg.is_edited && <span className="text-[9px] text-judge-ivory/20 italic">(edited)</span>}
                            {isSent && (
                              <CheckCheck className="w-3 h-3 text-emerald-500 opacity-50" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-justice-black/60 border-t border-constitution-gold/10 backdrop-blur-xl">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-3 translate-y-0 active:translate-y-0 transition-transform">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl text-constitution-gold hover:bg-white/10 transition-all active:scale-90"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,application/pdf"
                />

                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Brief your expert..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-judge-ivory placeholder-judge-ivory/20 focus:outline-none focus:border-constitution-gold/40 transition-all resize-none min-h-[56px] max-h-40 shadow-inner"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e as any);
                      }
                    }}
                    onInput={(e) => {
                      const t = e.target as HTMLTextAreaElement;
                      t.style.height = 'auto';
                      t.style.height = t.scrollHeight + 'px';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className={`p-4 rounded-2xl transition-all ${!newMessage.trim() || sending ? 'opacity-20 grayscale' : 'bg-constitution-gold text-justice-black shadow-[0_0_20px_rgba(184,134,11,0.3)] hover:scale-105 active:scale-95'}`}
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
              <p className="text-[10px] text-center mt-4 opacity-20 uppercase font-black tracking-[0.2em]">End-to-End Encrypted Privilege</p>
            </div>
          </>
        )}
      </div>

      {/* Group Creation Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-justice-black border border-constitution-gold/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-judge-ivory">Establish Legal Circle</h2>
              <button onClick={() => setShowCreateGroup(false)} className="p-1 hover:bg-white/10 rounded-full"><X /></button>
            </div>
            <input
              type="text"
              placeholder="Circle Title (e.g., Supreme Court Prep)"
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 mb-6 outline-none focus:border-constitution-gold transition-all"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
            />
            <button
              onClick={handleCreateGroup}
              disabled={!groupTitle.trim()}
              className="w-full py-4 bg-constitution-gold text-justice-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30"
            >
              Initialize Circle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
