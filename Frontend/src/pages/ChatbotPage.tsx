import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Scale, X, Plus, Menu, ChevronLeft, ChevronRight, Edit2, Trash2, MoreVertical, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessages {
  [key: string]: Message[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const SUGGESTED_QUESTIONS = [
  "What are the key provisions of Article 21?",
  "Explain the concept of fundamental rights",
  "What is the difference between civil and criminal law?",
  "How does the Indian judicial system work?",
  "What are the recent amendments in IPC?",
  "Explain Section 498A of IPC"
];

export function ChatbotPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessages>({});
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatName, setEditingChatName] = useState('');
  const [showChatMenu, setShowChatMenu] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentChatId, chatMessages]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingChatId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowChatMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      setIsLoadingChats(true);
      const response = await axiosInstance.get('/chatbot/history');
      const fetchedChats = response.data;
      setChats(fetchedChats);
      
      // If there are chats, load the most recent one
      if (fetchedChats.length > 0) {
        setCurrentChatId(fetchedChats[0]._id);
        await fetchChatMessages(fetchedChats[0]._id);
      } else {
        // Create a new chat if none exists
        createNewChat();
      }
    } catch (error: any) {
      console.error('Failed to fetch chat history:', error);
      if (error.response?.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/login';
      } else {
        toast.error('Failed to load chat history');
      }
    } finally {
      setIsLoadingChats(false);
    }
  };

  const fetchChatMessages = async (chatId: string) => {
    try {
      // Check if we already have messages for this chat
      if (chatMessages[chatId]) {
        return;
      }

      const response = await axiosInstance.get(`/chatbot/chat/${chatId}`);
      const messages = response.data.map((msg: any) => ({
        ...msg,
        id: msg._id || Date.now().toString() + Math.random(),
        timestamp: new Date(msg.timestamp)
      }));
      
      setChatMessages(prev => ({
        ...prev,
        [chatId]: messages
      }));
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const createNewChat = async () => {
    try {
      // Create a temporary local chat
      const tempChat: Chat = {
        _id: 'temp-' + Date.now(),
        name: 'New Conversation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setChats(prev => [tempChat, ...prev]);
      setCurrentChatId(tempChat._id);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Hello! I\'m your AI Legal Assistant. How can I help you today?',
        timestamp: new Date()
      };
      
      setChatMessages(prev => ({
        ...prev,
        [tempChat._id]: [welcomeMessage]
      }));
      
      setShowChatMenu(null);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      toast.error('Failed to create new chat');
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // If it's a temporary chat (not saved to server), just remove locally
      if (chatId.startsWith('temp-')) {
        setChats(prev => prev.filter(chat => chat._id !== chatId));
        setChatMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[chatId];
          return newMessages;
        });
        
        if (currentChatId === chatId) {
          const remainingChats = chats.filter(chat => chat._id !== chatId);
          if (remainingChats.length > 0) {
            setCurrentChatId(remainingChats[0]._id);
          } else {
            createNewChat();
          }
        }
      } else {
        // Delete from server
        await axiosInstance.delete(`/chatbot/chat/${chatId}`);
        
        setChats(prev => prev.filter(chat => chat._id !== chatId));
        setChatMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[chatId];
          return newMessages;
        });
        
        if (currentChatId === chatId) {
          const remainingChats = chats.filter(chat => chat._id !== chatId);
          if (remainingChats.length > 0) {
            setCurrentChatId(remainingChats[0]._id);
            await fetchChatMessages(remainingChats[0]._id);
          } else {
            createNewChat();
          }
        }
      }
      
      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat');
    }
    
    setShowChatMenu(null);
  };

  const startEditingChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditingChatName(chat.name);
    setShowChatMenu(null);
  };

  const saveChatName = async (chatId: string) => {
    if (!editingChatName.trim()) {
      setEditingChatId(null);
      return;
    }

    try {
      // If it's a temporary chat, update locally
      if (chatId.startsWith('temp-')) {
        setChats(prev => prev.map(chat => 
          chat._id === chatId 
            ? { ...chat, name: editingChatName.trim() }
            : chat
        ));
      } else {
        // Update on server
        await axiosInstance.put(`/chatbot/chat/${chatId}`, { name: editingChatName.trim() });
        
        setChats(prev => prev.map(chat => 
          chat._id === chatId 
            ? { ...chat, name: editingChatName.trim() }
            : chat
        ));
      }
      
      toast.success('Chat renamed successfully');
    } catch (error) {
      console.error('Failed to rename chat:', error);
      toast.error('Failed to rename chat');
    }
    
    setEditingChatId(null);
    setEditingChatName('');
  };

  // FIXED: Renamed from handleKeyPress to handleKeyDown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingChatId) {
        saveChatName(editingChatId);
      } else {
        handleSendMessage();
      }
    } else if (e.key === 'Escape' && editingChatId) {
      e.preventDefault();
      setEditingChatId(null);
      setEditingChatName('');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentChatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Update UI with user message
    setChatMessages(prev => ({
      ...prev,
      [currentChatId]: [...(prev[currentChatId] || []), userMessage]
    }));

    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/chatbot/chat', {
        message: inputMessage.trim(),
        chatId: currentChatId.startsWith('temp-') ? null : currentChatId
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      };

      // Update messages with assistant response
      setChatMessages(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), assistantMessage]
      }));

      // If this was a temporary chat (new), update its ID and name from server
      if (currentChatId.startsWith('temp-') && response.data.chatId) {
        const oldChatId = currentChatId;
        const newChatId = response.data.chatId;
        
        // Update chats list with the new server chat
        setChats(prev => prev.map(chat => 
          chat._id === oldChatId 
            ? { 
                ...chat, 
                _id: newChatId, 
                name: response.data.chatName || chat.name 
              }
            : chat
        ));
        
        // Move messages to new chat ID
        setChatMessages(prev => {
          const newMessages = { ...prev };
          newMessages[newChatId] = newMessages[oldChatId];
          delete newMessages[oldChatId];
          return newMessages;
        });
        
        setCurrentChatId(newChatId);
      } else {
        // Update chat name if it was the first message
        if (chats.find(c => c._id === currentChatId)?.name === 'New Conversation') {
          setChats(prev => prev.map(chat => 
            chat._id === currentChatId 
              ? { ...chat, name: inputMessage.trim().substring(0, 30) + (inputMessage.length > 30 ? '...' : '') }
              : chat
          ));
        }
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      
      if (error.response?.status === 401) {
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.message || 'Failed to get response');
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
          timestamp: new Date()
        };
        
        setChatMessages(prev => ({
          ...prev,
          [currentChatId]: [...(prev[currentChatId] || []), errorMessage]
        }));
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const switchChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    if (!chatMessages[chatId]) {
      await fetchChatMessages(chatId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const currentMessages = chatMessages[currentChatId] || [];

  return (
    <div className="flex h-screen bg-gradient-to-br from-justice-black via-justice-black/95 to-constitution-gold/5">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 relative border-r border-constitution-gold/20 bg-justice-black/90 backdrop-blur-sm`}
      >
        {isSidebarOpen && (
          <div className="flex flex-col h-full">
            {/* New Chat Button */}
            <div className="p-4">
              <button
                onClick={createNewChat}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-constitution-gold/10 hover:bg-constitution-gold/20 border border-constitution-gold/30 rounded-xl text-constitution-gold transition-all group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="font-medium">New Chat</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto px-3">
              {isLoadingChats ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-constitution-gold animate-spin" />
                </div>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div
                      key={chat._id}
                      onClick={() => switchChat(chat._id)}
                      className={`group relative flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all ${
                        currentChatId === chat._id
                          ? 'bg-constitution-gold/20 border border-constitution-gold/40'
                          : 'hover:bg-constitution-gold/5 border border-transparent'
                      }`}
                    >
                      {editingChatId === chat._id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingChatName}
                          onChange={(e) => setEditingChatName(e.target.value)}
                          onBlur={() => saveChatName(chat._id)}
                          onKeyDown={handleKeyDown}
                          className="flex-1 bg-justice-black text-judge-ivory border border-constitution-gold rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-constitution-gold"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-judge-ivory text-sm font-medium truncate">
                              {chat.name}
                            </p>
                            <p className="text-constitution-gold/50 text-xs mt-1">
                              {formatDate(chat.updatedAt)}
                            </p>
                          </div>

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowChatMenu(showChatMenu === chat._id ? null : chat._id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-constitution-gold/20 rounded transition-all"
                            >
                              <MoreVertical className="w-4 h-4 text-constitution-gold/70" />
                            </button>

                            {showChatMenu === chat._id && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 top-full mt-1 w-40 bg-justice-black border border-constitution-gold/20 rounded-lg shadow-xl z-50 py-1"
                              >
                                <button
                                  onClick={(e) => startEditingChat(chat, e)}
                                  className="w-full px-4 py-2 text-left text-sm text-judge-ivory hover:bg-constitution-gold/10 flex items-center space-x-2"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-constitution-gold/70" />
                                  <span>Rename</span>
                                </button>
                                <button
                                  onClick={(e) => deleteChat(chat._id, e)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-constitution-gold/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-justice-black/80 backdrop-blur-sm border-b border-constitution-gold/20 px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-constitution-gold/10 rounded-lg transition-all"
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="w-5 h-5 text-constitution-gold" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-constitution-gold" />
                )}
              </button>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-constitution-gold to-constitution-gold/70 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-7 h-7 text-justice-black" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-justice-black animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-heading text-judge-ivory tracking-wide">AI Legal Assistant</h1>
                <p className="text-constitution-gold/70 text-sm">Powered by Advanced Language Models</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {currentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-4 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-constitution-gold to-constitution-gold/70'
                      : 'bg-seal-red'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="w-6 h-6 text-justice-black" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 max-w-3xl ${
                    message.role === 'user' ? 'flex justify-end' : ''
                  }`}
                >
                  <div
                    className={`rounded-2xl px-6 py-4 ${
                      message.role === 'assistant'
                        ? 'bg-constitution-gold/5 border border-constitution-gold/20'
                        : 'bg-seal-red/20 border border-seal-red/30'
                    }`}
                  >
                    <p className="text-judge-ivory leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className="text-constitution-gold/50 text-xs mt-2">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-constitution-gold to-constitution-gold/70 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-justice-black" />
                </div>
                <div className="flex-1">
                  <div className="bg-constitution-gold/5 border border-constitution-gold/20 rounded-2xl px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-5 h-5 text-constitution-gold animate-spin" />
                      <span className="text-constitution-gold/70">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Questions */}
        {currentMessages.length <= 1 && (
          <div className="px-4 pb-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-constitution-gold" />
                <p className="text-constitution-gold/70 text-sm font-medium">Suggested Questions</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-left px-4 py-3 bg-constitution-gold/5 hover:bg-constitution-gold/10 border border-constitution-gold/20 rounded-lg transition-all text-judge-ivory/80 hover:text-judge-ivory text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-justice-black/80 backdrop-blur-sm border-t border-constitution-gold/20 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about law, cases, or legal procedures..."
                  className="w-full px-6 py-4 bg-constitution-gold/5 border border-constitution-gold/20 rounded-xl text-judge-ivory placeholder-constitution-gold/40 focus:outline-none focus:ring-2 focus:ring-constitution-gold/50 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 text-constitution-gold/40 text-xs">
                  <Scale className="w-4 h-4" />
                  <span>Legal AI</span>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-4 bg-constitution-gold hover:bg-constitution-gold/90 disabled:bg-constitution-gold/20 disabled:cursor-not-allowed text-justice-black font-medium rounded-xl transition-all flex items-center space-x-2 shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>Send</span>
              </button>
            </div>
            <p className="text-constitution-gold/40 text-xs mt-3 text-center">
              AI responses may not be 100% accurate. Always verify important legal information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}