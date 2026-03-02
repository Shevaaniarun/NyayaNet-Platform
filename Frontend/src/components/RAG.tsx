import { useState } from "react";
import { Search, Loader2, BookOpen } from "lucide-react";
import { nyayanetAI } from "../api/RAGAPI";

interface Result {
  source: string;
  score: number;
  chapter?: string;
  chapter_title?: string;
  section_desc: string;
}

export function RAG() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const data = await nyayanetAI.ask(query);
      setResults(data.results || []);
    } catch (err) {
      console.error("AI error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aged-paper rounded-lg p-6 mb-8 border border-constitution-gold/20">
      
      {/* Header */}
      <h2 className="font-heading font-bold text-constitution-gold text-xl mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Ask NyayaNet AI
      </h2>

      {/* Input */}
      <div className="flex gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a legal question..."
          className="flex-1 parchment-bg border border-constitution-gold/30 rounded-lg px-4 py-2 text-ink-gray focus:outline-none focus:border-constitution-gold"
        />

        <button
          onClick={askAI}
          className="px-4 py-2 bg-constitution-gold text-black rounded-lg hover:bg-constitution-gold/80 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Ask
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((r, i) => (
            <div
              key={i}
              className="p-4 border border-constitution-gold/20 rounded-lg bg-black/20"
            >
              <div className="text-constitution-gold font-bold">
                {r.source}
              </div>

              <div className="text-sm text-ink-gray/60">
                Score: {r.score.toFixed(3)} | Chapter: {r.chapter ?? "N/A"} {r.chapter_title ?? ""}
              </div>

              <div className="text-ink-gray mt-2 line-clamp-3">
                {r.section_desc}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && (
        <p className="text-ink-gray/50 text-sm">
          Ask a question to know about Indian legal sections.
        </p>
      )}
    </div>
  );
}