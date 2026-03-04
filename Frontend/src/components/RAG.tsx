import { useState, useRef, useEffect } from "react";
import { Search, Loader2, BookOpen, X, Send, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { nyayanetAI } from "../api/RAGAPI";

interface Result {
  source: string;
  score: number;
  chapter?: string;
  chapter_title?: string;
  section_desc: string;
  act_id?: string;
  section_id?: string;
}

interface ChatMessage {
  type: "user" | "ai";
  text: string;
  results?: Result[];
}

interface RAGProps {
  onClose?: () => void;
  mode?: "inline" | "panel";
}

export function RAG({ onClose, mode = "inline" }: RAGProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const askAI = async () => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = { type: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");

    try {
      setLoading(true);
      const data = await nyayanetAI.ask(userMsg.text);
      const aiMsg: ChatMessage = {
        type: "ai",
        text:
          data.results?.length > 0
            ? `Found ${data.results.length} relevant section(s):`
            : "No relevant sections found for your query.",
        results: data.results || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI error", err);
      const errMsg: ChatMessage = {
        type: "ai",
        text: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  // Panel mode: floating chat window
  if (mode === "panel") {
    return (
      <div
        style={{
          position: "fixed",
          top: "60%",
          left: "55%",
          transform: "translate(-50%, -50%)",
          width: "420px",
          maxWidth: "calc(100vw - 48px)",
          height: "560px",
          maxHeight: "calc(100vh - 48px)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(196, 164, 105, 0.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(196, 164, 105, 0.1)",
          background: "linear-gradient(165deg, #1a1814 0%, #0f0e0c 100%)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid rgba(196, 164, 105, 0.2)",
            background: "linear-gradient(90deg, rgba(196, 164, 105, 0.08) 0%, transparent 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #c4a469 0%, #8b7340 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOpen style={{ width: "16px", height: "16px", color: "#0f0e0c" }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#c4a469", fontSize: "14px" }}>
                NyayaNet RAG
              </div>
              <div style={{ fontSize: "11px", color: "rgba(196, 164, 105, 0.5)" }}>
                A RAG based Legal Assistant
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(196, 164, 105, 0.1)",
              border: "none",
              borderRadius: "8px",
              padding: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(196, 164, 105, 0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(196, 164, 105, 0.1)")
            }
          >
            <X style={{ width: "18px", height: "18px", color: "#c4a469" }} />
          </button>
        </div>

        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: "12px",
                opacity: 0.5,
              }}
            >
              <BookOpen
                style={{ width: "40px", height: "40px", color: "rgba(196, 164, 105, 0.3)" }}
              />
              <p style={{ color: "rgba(196, 164, 105, 0.5)", fontSize: "13px", textAlign: "center" }}>
                Ask any question about Indian legal sections
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius:
                    msg.type === "user"
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",
                  background:
                    msg.type === "user"
                      ? "linear-gradient(135deg, #c4a469 0%, #a08950 100%)"
                      : "rgba(196, 164, 105, 0.08)",
                  color: msg.type === "user" ? "#0f0e0c" : "#d4c9b0",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  border:
                    msg.type === "ai"
                      ? "1px solid rgba(196, 164, 105, 0.12)"
                      : "none",
                }}
              >
                <div>{msg.text}</div>

                {msg.results && msg.results.length > 0 && (
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {msg.results.map((r, j) => (
                      <div
                        key={j}
                        onClick={() => r.act_id && navigate(`/library/act/${r.act_id}`)}
                        style={{
                          padding: "8px 10px",
                          borderRadius: "8px",
                          background: "rgba(0, 0, 0, 0.2)",
                          border: "1px solid rgba(196, 164, 105, 0.15)",
                          cursor: r.act_id ? "pointer" : "default",
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (r.act_id) {
                            e.currentTarget.style.borderColor = "rgba(196, 164, 105, 0.4)";
                            e.currentTarget.style.background = "rgba(196, 164, 105, 0.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(196, 164, 105, 0.15)";
                          e.currentTarget.style.background = "rgba(0, 0, 0, 0.2)";
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#c4a469",
                            fontSize: "12px",
                            marginBottom: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{r.source}</span>
                          {r.act_id && (
                            <ExternalLink style={{ width: "10px", height: "10px", opacity: 0.5, flexShrink: 0 }} />
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "rgba(196, 164, 105, 0.4)",
                            marginBottom: "4px",
                          }}
                        >
                          Score: {r.score.toFixed(3)}
                          {r.chapter && ` · Ch. ${r.chapter}`}
                          {r.chapter_title && ` ${r.chapter_title}`}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#b0a690",
                            display: "-webkit-box",
                            
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {r.section_desc}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "14px 14px 14px 4px",
                  background: "rgba(196, 164, 105, 0.08)",
                  border: "1px solid rgba(196, 164, 105, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Loader2
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#c4a469",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <span style={{ color: "rgba(196, 164, 105, 0.5)", fontSize: "13px" }}>
                  Searching...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(196, 164, 105, 0.15)",
            background: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a legal question..."
              disabled={loading}
              style={{
                flex: 1,
                background: "rgba(196, 164, 105, 0.06)",
                border: "1px solid rgba(196, 164, 105, 0.2)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#d4c9b0",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              onClick={askAI}
              disabled={loading || !query.trim()}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                border: "none",
                background:
                  query.trim() && !loading
                    ? "linear-gradient(135deg, #c4a469 0%, #8b7340 100%)"
                    : "rgba(196, 164, 105, 0.1)",
                cursor: query.trim() && !loading ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {loading ? (
                <Loader2
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "#c4a469",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <Send
                  style={{
                    width: "16px",
                    height: "16px",
                    color: query.trim() ? "#0f0e0c" : "rgba(196, 164, 105, 0.3)",
                  }}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline mode: original banner layout (used on LawLibraryPage directly)
  return (
    <div className="aged-paper rounded-lg p-6 mb-8 border border-constitution-gold/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-constitution-gold text-xl flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Ask NyayaNet
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-constitution-gold/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-constitution-gold" />
          </button>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a legal question..."
          className="flex-1 parchment-bg border border-constitution-gold/30 rounded-lg px-4 py-2 text-ink-gray focus:outline-none focus:border-constitution-gold"
        />

        <button
          onClick={askAI}
          className="px-4 py-2 bg-constitution-gold text-black rounded-lg hover:bg-constitution-gold/80 flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Ask
        </button>
      </div>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 ${msg.type === "user"
                  ? "bg-constitution-gold/20 rounded-xl rounded-br-sm text-ink-gray"
                  : "bg-black/20 border border-constitution-gold/15 rounded-xl rounded-bl-sm text-ink-gray/90"
                  }`}
              >
                <div className="text-sm">{msg.text}</div>
                {msg.results && msg.results.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.results.map((r, j) => (
                      <div
                        key={j}
                        onClick={() => r.act_id && navigate(`/library/act/${r.act_id}?section=${r.section_id}`)}
                        className={`p-3 border border-constitution-gold/20 rounded-lg bg-black/20 transition-colors ${r.act_id ? 'cursor-pointer hover:border-constitution-gold/40 hover:bg-constitution-gold/5' : ''}`}
                      >
                        <div className="text-constitution-gold font-bold text-sm flex items-center justify-between">
                          <span>{r.source}</span>
                          {r.act_id && <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0" />}
                        </div>
                        <div className="text-xs text-ink-gray/50 mb-1">
                          Score: {r.score.toFixed(3)}
                          {r.chapter && ` · Ch. ${r.chapter}`}
                          {r.chapter_title && ` ${r.chapter_title}`}
                        </div>
                        <div className="text-ink-gray/80 text-xs line-clamp-3">
                          {r.section_desc}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="p-3 bg-black/20 border border-constitution-gold/15 rounded-xl rounded-bl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-constitution-gold animate-spin" />
                <span className="text-ink-gray/50 text-sm">Searching...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {messages.length === 0 && !loading && (
        <p className="text-ink-gray/50 text-sm">
          Ask a question to know about Indian legal sections.
        </p>
      )}
    </div>
  );
}