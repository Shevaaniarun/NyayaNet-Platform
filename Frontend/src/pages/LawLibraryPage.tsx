import { useState, useEffect } from 'react';
import { BookOpen, Search, Bookmark, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { lawLibraryAPI } from '../api/lawLibraryAPI';
import { RAG } from "../components/RAG";

interface LawAct {
  id: string;
  act_name: string;
  act_year: number;
  short_title: string;
  category: string;
  section_count: number;
}

export function LawLibraryPage() {
  const [acts, setActs] = useState<LawAct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchActs();
  }, [selectedCategory]);

  const fetchActs = async () => {
    try {
      setLoading(true);
      const response = await lawLibraryAPI.getActs({ category: selectedCategory });
      setActs(response.acts);
    } catch (error) {
      console.error('Failed to fetch acts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'CRIMINAL_LAW', label: 'Criminal Law' },
    { value: 'CIVIL_LAW', label: 'Civil Law' },
    { value: 'FAMILY_LAW', label: 'Family Law' },
    { value: 'CORPORATE_LAW', label: 'Corporate Law' },
  ];

  const filteredActs = acts.filter(act => 
    act.act_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.short_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-justice-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-judge-ivory text-3xl mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-constitution-gold" />
              Indian Law Library
            </h1>
            <p className="text-ink-gray/70">
              Browse and search Indian legal acts, codes, and sections
            </p>
          </div>
          <Link
            to="/library/bookmarks"
            className="px-4 py-2 bg-constitution-gold/10 text-constitution-gold rounded-lg hover:bg-constitution-gold/20 transition-colors flex items-center gap-2"
          >
            <Bookmark className="w-4 h-4" />
            My Bookmarks
          </Link>
        </div>

        {/* RAG */}
        <RAG />


        <div className="aged-paper rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-constitution-gold" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search acts by name..."
                className="w-full parchment-bg border border-constitution-gold/30 rounded-lg pl-12 pr-4 py-3 text-ink-gray focus:outline-none focus:border-constitution-gold"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="md:w-64 px-4 py-3 parchment-bg border border-constitution-gold/30 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

          </div>
        </div>

        {/* Acts List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-constitution-gold animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredActs.map((act) => (
              <Link
                key={act.id}
                to={`/library/act/${act.id}`}
                className="group relative"
              >
                <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20 hover:border-constitution-gold/40 transition-all cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-constitution-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-heading font-bold text-ink-gray text-xl mb-2 group-hover:text-constitution-gold transition-colors">
                        {act.act_name} ({act.act_year})
                      </h2>
                      {act.short_title && (
                        <p className="text-ink-gray/60 text-sm mb-2">{act.short_title}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-3 py-1 bg-constitution-gold/10 text-constitution-gold rounded-full">
                          {act.category.replace('_', ' ')}
                        </span>
                        <span className="text-ink-gray/50">
                          {act.section_count} sections
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-constitution-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredActs.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-constitution-gold/30 mx-auto mb-4" />
            <h3 className="text-ink-gray text-xl mb-2">No acts found</h3>
            <p className="text-ink-gray/50">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}