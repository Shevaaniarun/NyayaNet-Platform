import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Bookmark, Search, Loader2, ChevronRight } from 'lucide-react';
import { lawLibraryAPI } from '../api/lawLibraryAPI';

interface Section {
  id: string;
  section_number: string;
  section_title: string;
  section_text: string;
  explanation?: string;
}

interface Act {
  id: string;
  act_name: string;
  act_year: number;
  short_title: string;
  preamble?: string;
  sections: Section[];
}

export function LawActDetailPage() {
  const { actId } = useParams<{ actId: string }>();
  const [act, setAct] = useState<Act | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (actId) {
      fetchAct();
    }
  }, [actId]);

  const fetchAct = async () => {
    try {
      setLoading(true);
      const data = await lawLibraryAPI.getActById(actId!);
      setAct(data);

      // Auto-select section from query param
      const sectionId = searchParams.get('section');
      if (sectionId && data?.sections) {
        const match = data.sections.find((s: Section) => s.id === sectionId);
        if (match) setSelectedSection(match);
      }
    } catch (error) {
      console.error('Failed to fetch act:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = act?.sections.filter(section =>
    section.section_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.section_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.section_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-justice-black p-8 flex justify-center items-center">
        <Loader2 className="w-10 h-10 text-constitution-gold animate-spin" />
      </div>
    );
  }

  if (!act) {
    return (
      <div className="min-h-screen bg-justice-black p-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-ink-gray">Act not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-justice-black">
      {/* Header */}
      <div className="sticky top-0 bg-justice-black/95 backdrop-blur-sm border-b border-constitution-gold/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/library"
            className="flex items-center space-x-2 text-ink-gray hover:text-constitution-gold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Library</span>
          </Link>
          <h1 className="font-heading font-bold text-judge-ivory text-xl">
            {act.act_name}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Sections List */}
          <div className="lg:col-span-1">
            <div className="aged-paper rounded-lg p-4 sticky top-24">
              <h2 className="font-heading font-bold text-ink-gray text-lg mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-constitution-gold" />
                Sections
              </h2>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-gray/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sections..."
                  className="w-full parchment-bg border border-constitution-gold/30 rounded-lg pl-9 pr-3 py-2 text-sm text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
              </div>

              <div className="space-y-1 max-h-[70vh] overflow-y-auto">
                {filteredSections?.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${selectedSection?.id === section.id
                        ? 'bg-constitution-gold/10 border border-constitution-gold/30'
                        : 'hover:bg-constitution-gold/5'
                      }`}
                  >
                    <div className="font-bold text-constitution-gold text-sm">
                      Section {section.section_number}
                    </div>
                    {section.section_title && (
                      <div className="text-ink-gray/70 text-xs mt-1 line-clamp-2">
                        {section.section_title}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Section Detail */}
          <div className="lg:col-span-2">
            {selectedSection ? (
              <div className="aged-paper rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-heading font-bold text-constitution-gold text-2xl mb-2">
                      Section {selectedSection.section_number}
                    </h2>
                    {selectedSection.section_title && (
                      <h3 className="text-ink-gray text-lg mb-4">
                        {selectedSection.section_title}
                      </h3>
                    )}
                  </div>
                  <button
                    onClick={() => lawLibraryAPI.toggleBookmark(selectedSection.id)}
                    className="p-2 hover:bg-constitution-gold/10 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-5 h-5 text-constitution-gold" />
                  </button>
                </div>

                <div className="prose prose-invert max-w-none">
                  <div className="text-ink-gray/90 leading-relaxed whitespace-pre-wrap font-serif">
                    {selectedSection.section_text}
                  </div>

                  {selectedSection.explanation && (
                    <div className="mt-6 pt-6 border-t border-constitution-gold/20">
                      <h4 className="font-bold text-constitution-gold mb-2">Explanation</h4>
                      <p className="text-ink-gray/70 italic">
                        {selectedSection.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="aged-paper rounded-lg p-12 text-center">
                <BookOpen className="w-16 h-16 text-constitution-gold/30 mx-auto mb-4" />
                <h3 className="text-ink-gray text-xl mb-2">Select a section</h3>
                <p className="text-ink-gray/50">
                  Choose a section from the sidebar to view its content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}