/**
 * Messages Page - View and send messages to legal experts
 * Updated with better error handling
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getConversationWithUser, sendMessage, markMessagesAsRead } from '../api/messagesAPI';
import { ArrowLeft, Send, User, Clock, Calendar, Shield, Paperclip, Mic, MoreVertical, Check, CheckCheck, Info, VolumeX, MessageCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string;
  message: string;
  content?: string; // Some APIs might use 'content' instead of 'message'
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_photo: string;
  recipient_name?: string;
  recipient_photo?: string;
  sender_role?: string;
}

interface MessagesPageProps {
  onNavigate: (path: string) => void;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ onNavigate }) => {
  // Extract userId from URL
  const getUserIdFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/messages\/([^\/]+)/);
    return match ? match[1] : null;
  };

  const userId = getUserIdFromUrl();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{ name: string; photo: string; role?: string; isOnline?: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No user found in localStorage');
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  };
  
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!userId) {
      console.error('No userId provided in URL');
      setError('No user selected for conversation');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const data = await getConversationWithUser(userId);
      
      // Normalize message data
      const normalizedMessages = Array.isArray(data) ? data.map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        message: msg.message || msg.content || '', // Handle both 'message' and 'content' fields
        is_read: msg.is_read || false,
        created_at: msg.created_at,
        sender_name: msg.sender_name || 'Unknown',
        sender_photo: msg.sender_photo || '',
        recipient_name: msg.recipient_name,
        recipient_photo: msg.recipient_photo,
        sender_role: msg.sender_role
      })) : [];
      
      setMessages(normalizedMessages);
      
      // Determine other user info
      if (normalizedMessages.length > 0) {
        const firstMessage = normalizedMessages[0];
        
        const otherUserInfo = firstMessage.sender_id === currentUserId 
          ? { 
              name: firstMessage.recipient_name || 'Legal Expert', 
              photo: firstMessage.recipient_photo || '',
              role: firstMessage.sender_role
            }
          : { 
              name: firstMessage.sender_name || 'Legal Expert', 
              photo: firstMessage.sender_photo || '',
              role: firstMessage.sender_role
            };
        
        setOtherUser(otherUserInfo);
      } else {
        // If no messages, we need to get expert info from somewhere else
        // For now, set a placeholder
        setOtherUser({
          name: 'Legal Expert',
          photo: '',
          role: 'LAWYER'
        });
      }
      
      // Mark messages as read
      if (normalizedMessages.length > 0) {
        const unreadMessages = normalizedMessages.filter((msg: Message) => 
          !msg.is_read && msg.sender_id !== currentUserId
        );
        if (unreadMessages.length > 0) {
          await markMessagesAsRead(userId);
        }
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      const errorMessage = err.message || 'Failed to load messages';
      setError(errorMessage);
      
      // Show toast only for non-404 errors (404 might mean no conversation yet)
      if (!err.message?.includes('404') && !err.message?.includes('Not Found')) {
        toast.error(`Failed to load conversation: ${errorMessage}`);
      }
      
      // Set empty messages array
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [userId, currentUserId]);

  useEffect(() => {
    if (userId) {
      fetchMessages();
      
      // Set up polling for new messages
      const interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    } else {
      setError('No conversation selected');
      setLoading(false);
    }
  }, [userId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !userId) {
      toast.error('Please enter a message');
      return;
    }
    
    try {
      setSending(true);
      await sendMessage(userId, newMessage);
      setNewMessage('');
      
      // Refresh messages
      await fetchMessages();
      
      toast.success('Message sent!');
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      toast.error(`Failed to send message: ${errorMessage}`);
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    onNavigate('/chat-with-us');
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const formatHeaderDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else if (date.getFullYear() === today.getFullYear()) {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    } catch (error) {
      return 'Unknown date';
    }
  };

  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message: Message) => {
      try {
        const date = formatHeaderDate(message.created_at);
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
      } catch (error) {
        console.error('Error grouping message:', error);
      }
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-justice-black p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center h-64 flex-col gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-constitution-gold/20 border-t-constitution-gold rounded-full animate-spin"></div>
              <MessageCircle className="w-8 h-8 text-constitution-gold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-ink-gray/60">Loading conversation...</p>
            <p className="text-ink-gray/40 text-sm">User ID: {userId}</p>
          </div>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex flex-col h-screen bg-justice-black">
      {/* Header */}
      <div className="aged-paper border-b border-constitution-gold/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-constitution-gold/10 transition-colors group"
            title="Back to experts"
          >
            <ArrowLeft className="w-5 h-5 text-constitution-gold group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-constitution-gold overflow-hidden bg-parchment-cream">
                {otherUser?.photo ? (
                  <img 
                    src={otherUser.photo} 
                    alt={otherUser.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                            <svg class="w-6 h-6 text-constitution-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-constitution-gold" />
                  </div>
                )}
              </div>
              {/* Online indicator */}
              {otherUser?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-parchment-cream"></div>
              )}
            </div>
            
            <div>
              <h2 className="font-heading font-bold text-judge-ivory text-lg">{otherUser?.name || 'Legal Expert'}</h2>
              <div className="flex items-center gap-2">
                {otherUser?.role && (
                  <span className="px-2 py-0.5 bg-constitution-gold/10 text-constitution-gold border border-constitution-gold/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {otherUser.role.replace('_', ' ')}
                  </span>
                )}
                <span className="text-ink-gray/60 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Usually replies within 2 hours
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-constitution-gold/10 transition-colors" title="Conversation info">
            <Info className="w-5 h-5 text-constitution-gold" />
          </button>
          <button className="p-2 rounded-full hover:bg-constitution-gold/10 transition-colors" title="Mute notifications">
            <VolumeX className="w-5 h-5 text-constitution-gold" />
          </button>
          <button className="p-2 rounded-full hover:bg-constitution-gold/10 transition-colors" title="More options">
            <MoreVertical className="w-5 h-5 text-constitution-gold" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-parchment-cream/5"
      >
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          {error && messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-constitution-gold/20 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-seal-red" />
              </div>
              <h3 className="font-heading font-bold text-ink-gray text-xl mb-2">
                {error.includes('404') || error.includes('Not Found') 
                  ? 'Start a Conversation' 
                  : 'Error Loading Messages'}
              </h3>
              <p className="text-ink-gray/60 mb-6 max-w-md mx-auto">
                {error.includes('404') || error.includes('Not Found') 
                  ? 'No conversation found. Send a message to start chatting!'
                  : error}
              </p>
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <p className="text-ink-gray/40 text-sm">
                  Current User: {currentUserId || 'Not logged in'}
                </p>
                <p className="text-ink-gray/40 text-sm">
                  Other User: {userId || 'No user selected'}
                </p>
              </div>
            </div>
          ) : Object.keys(messageGroups).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-constitution-gold/20 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-constitution-gold/40" />
              </div>
              <h3 className="font-heading font-bold text-ink-gray text-xl mb-2">
                No messages yet
              </h3>
              <p className="text-ink-gray/60 mb-6 max-w-md mx-auto">
                Start the conversation with your legal expert
              </p>
              <p className="text-ink-gray/40 text-sm mb-4">
                Send a message to begin your consultation
              </p>
            </div>
          ) : (
            Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date} className="mb-8">
                {/* Date Header */}
                <div className="flex items-center justify-center mb-6">
                  <div className="px-4 py-1.5 bg-constitution-gold/10 text-constitution-gold border border-constitution-gold/20 rounded-full">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {date}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-6">
                  {dateMessages.map((msg: Message) => {
                    const isSent = msg.sender_id === currentUserId;
                    const showAvatar = true;
                    const messageText = msg.message || msg.content || '';
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isSent ? 'order-2' : 'order-1'} flex gap-3`}>
                          {/* Avatar for received messages */}
                          {!isSent && showAvatar && (
                            <div className="w-8 h-8 rounded-full border border-constitution-gold/20 overflow-hidden bg-parchment-cream flex-shrink-0">
                              {msg.sender_photo ? (
                                <img
                                  src={msg.sender_photo}
                                  alt={msg.sender_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const parent = (e.target as HTMLImageElement).parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                                          <svg class="w-4 h-4 text-constitution-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                          </svg>
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                                  <User className="w-4 h-4 text-constitution-gold" />
                                </div>
                              )}
                            </div>
                          )}

                          <div className={`${isSent ? 'ml-auto' : ''}`}>
                            {/* Sender name for received messages */}
                            {!isSent && (
                              <p className="text-xs font-bold text-ink-gray mb-1 ml-1">
                                {msg.sender_name}
                              </p>
                            )}
                            
                            {/* Message bubble */}
                            <div
                              className={`rounded-2xl px-4 py-3 ${isSent
                                ? 'bg-constitution-gold text-justice-black rounded-br-none shadow-lg'
                                : 'bg-justice-black text-judge-ivory border border-constitution-gold/20 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                                {messageText || '(Empty message)'}
                              </p>
                            </div>
                            
                            {/* Timestamp and read status */}
                            <div className={`flex items-center gap-2 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-ink-gray/40 text-[10px] font-medium uppercase tracking-wider">
                                {formatMessageTime(msg.created_at)}
                              </span>
                              {isSent && (
                                <span className={`${msg.is_read ? 'text-emerald-500' : 'text-ink-gray/30'}`}>
                                  {msg.is_read ? (
                                    <CheckCheck className="w-3 h-3" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Avatar for sent messages */}
                          {isSent && showAvatar && (
                            <div className="w-8 h-8 rounded-full border border-constitution-gold/20 overflow-hidden bg-parchment-cream flex-shrink-0">
                              {currentUser?.profilePhotoUrl ? (
                                <img
                                  src={currentUser.profilePhotoUrl}
                                  alt="You"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const parent = (e.target as HTMLImageElement).parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                                          <svg class="w-4 h-4 text-constitution-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                          </svg>
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                                  <User className="w-4 h-4 text-constitution-gold" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="aged-paper border-t border-constitution-gold/20 p-4 md:p-6">
        {error && !error.includes('404') && !error.includes('Not Found') && (
          <div className="mb-4 px-4 py-2 bg-seal-red/10 text-seal-red border border-seal-red/20 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="relative">
          <div className="flex items-center gap-3">
            {/* Attachment Button */}
            <button
              type="button"
              className="p-3 rounded-full hover:bg-constitution-gold/10 transition-colors group"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5 text-constitution-gold group-hover:rotate-12 transition-transform" />
            </button>
            
            {/* Voice Message Button */}
            <button
              type="button"
              className="p-3 rounded-full hover:bg-constitution-gold/10 transition-colors group"
              title="Voice message"
            >
              <Mic className="w-5 h-5 text-constitution-gold" />
            </button>
            
            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your legal query or message..."
                className="w-full px-5 py-4 parchment-bg border-2 border-constitution-gold/20 rounded-2xl text-judge-ivory placeholder-ink-gray/40 focus:outline-none focus:border-constitution-gold resize-none text-base leading-relaxed pr-24"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
                disabled={sending || !userId}
              />
              
              {/* Character count */}
              <div className="absolute right-4 bottom-4 text-xs text-ink-gray/30">
                {newMessage.length}/2000
              </div>
            </div>
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={sending || !newMessage.trim() || !userId}
              className={`p-4 rounded-2xl font-bold transition-all flex items-center justify-center ${sending || !newMessage.trim() || !userId
                ? 'bg-ink-gray/10 text-ink-gray/30 cursor-not-allowed'
                : 'bg-constitution-gold text-justice-black hover:bg-constitution-gold/90 hover:scale-105 active:scale-95'
              }`}
              title={!userId ? "Select a user to message" : "Send message"}
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-justice-black/30 border-t-justice-black rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Helper text */}
          <p className="text-ink-gray/40 text-xs mt-3 ml-3 flex items-center gap-2">
            <Shield className="w-3 h-3" />
            Your conversations are confidential and protected by attorney-client privilege
          </p>
          
          {/* Debug info (remove in production) */}
          <div className="text-ink-gray/20 text-[10px] mt-2">
            Debug: User ID: {userId} | Messages: {messages.length} | Status: {loading ? 'Loading' : 'Ready'}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessagesPage;