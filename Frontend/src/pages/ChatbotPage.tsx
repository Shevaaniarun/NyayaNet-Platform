import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, BookOpen, Scale, FileText, X, Plus, Trash2, MessageSquare, ChevronDown } from 'lucide-react';
import { sendChatMessage } from '../api/chatbotAPI';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
}

const SUGGESTED_QUESTIONS = [
  "What are the key provisions of Article 21?",
  "Explain the concept of fundamental rights",
  "What is the difference between civil and criminal law?",
  "How does the Indian judicial system work?",
  "What are the recent amendments in IPC?",
  "Explain Section 498A of IPC"
];

export function ChatbotPage() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      name: 'New Conversation',
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your AI Legal Assistant powered by advanced language models. I can help you with legal queries, case research, statutory interpretations, and much more. How can I assist you today?',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    }
  ]);
  const [activeChatId, setActiveChatId] = useState('1');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(chat => chat.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateChatName = (message: string) => {
    // Generate a name based on the first user message
    const words = message.split(' ').slice(0, 5).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  };

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: Chat = {
      id: newChatId,
      name: 'New Conversation',
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your AI Legal Assistant. How can I help you with this new conversation?',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    };
    
    setChats([...chats, newChat]);
    setActiveChatId(newChatId);
    setInputMessage('');
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Allow deleting all chats
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    
    if (updatedChats.length === 0) {
      // Create a new default chat if all are deleted
      const newChatId = Date.now().toString();
      const newChat: Chat = {
        id: newChatId,
        name: 'New Conversation',
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your AI Legal Assistant. How can I help you today?',
            timestamp: new Date()
          }
        ],
        createdAt: new Date()
      };
      setChats([newChat]);
      setActiveChatId(newChatId);
    } else {
      setChats(updatedChats);
      if (activeChatId === chatId) {
        setActiveChatId(updatedChats[0].id);
      }
    }
  };

  const updateChatName = (chatId: string, userMessage: string) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId && chat.name === 'New Conversation'
          ? { ...chat, name: generateChatName(userMessage) }
          : chat
      )
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !activeChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Update messages for the active chat
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    setInputMessage('');
    setIsLoading(true);

    // Update chat name if it's still "New Conversation"
    const currentChat = chats.find(c => c.id === activeChatId);
    if (currentChat && currentChat.name === 'New Conversation') {
      updateChatName(activeChatId, inputMessage.trim());
    }

    try {
      const response = await sendChatMessage(inputMessage.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === activeChatId 
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        )
      );

    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || 'Failed to get response. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date()
      };

      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === activeChatId 
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearCurrentChat = () => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === activeChatId 
          ? { 
              ...chat, 
              messages: [{
                id: '1',
                role: 'assistant',
                content: 'Chat cleared. How can I assist you today?',
                timestamp: new Date()
              }]
            }
          : chat
      )
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-justice-black via-justice-black/95 to-constitution-gold/5">
      {/* Sidebar - Chat History */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-justice-black/90 backdrop-blur-sm border-r border-constitution-gold/20 flex flex-col`}>
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-constitution-gold hover:bg-constitution-gold/90 text-justice-black rounded-xl transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`
                group flex items-center justify-between px-3 py-3 mb-1 rounded-lg cursor-pointer transition-all
                ${activeChatId === chat.id 
                  ? 'bg-constitution-gold/20 border border-constitution-gold/50' 
                  : 'hover:bg-constitution-gold/10 border border-transparent'
                }
              `}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                  activeChatId === chat.id ? 'text-constitution-gold' : 'text-constitution-gold/50'
                }`} />
                <span className="text-sm text-judge-ivory truncate">
                  {chat.name}
                </span>
              </div>
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-seal-red/20 rounded-full transition-all"
              >
                <Trash2 className="w-3 h-3 text-constitution-gold/70 hover:text-seal-red" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-constitution-gold/20">
          <button
            onClick={() => setShowSidebar(false)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-constitution-gold/10 hover:bg-constitution-gold/20 text-constitution-gold rounded-lg transition-all"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
            <span className="text-sm">Collapse Sidebar</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-justice-black/80 backdrop-blur-sm border-b border-constitution-gold/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 hover:bg-constitution-gold/10 rounded-lg transition-all"
                >
                  <MessageSquare className="w-5 h-5 text-constitution-gold" />
                </button>
              )}
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
            
            {activeChat && activeChat.messages.length > 1 && (
              <button
                onClick={clearCurrentChat}
                className="px-4 py-2 bg-constitution-gold/10 hover:bg-constitution-gold/20 text-constitution-gold rounded-lg transition-all flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Clear Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
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

        {/* Suggested Questions - Only show for new chats */}
        {activeChat && activeChat.messages.length <= 1 && (
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

        {/* Input Area - Always visible */}
        <div className="bg-justice-black/80 backdrop-blur-sm border-t border-constitution-gold/20 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
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