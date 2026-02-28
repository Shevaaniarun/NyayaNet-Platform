import React, { useState, useEffect } from 'react';
import { getExperts } from '../api/messagesAPI';
import { MessageCircle, Scale, Gavel, GraduationCap, User, Briefcase, Award, Search, Shield, Crown, Star, BookOpen, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

interface Expert {
  id: string;
  full_name: string;
  email: string;
  role: string;
  designation: string;
  organization: string;
  area_of_interest: string | string[];
  profile_photo_url: string;
  experience_years: number;
  bio?: string;
  is_online?: boolean;
  rating?: number;
  cases_handled?: number;
  response_time?: string;
}

interface ChatWithUsPageProps {
  onNavigate: (path: string) => void;
}

const ChatWithUsPage: React.FC<ChatWithUsPageProps> = ({ onNavigate }) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [sortByExperience, setSortByExperience] = useState(false);

  useEffect(() => {
    fetchExperts();
  }, []);

  useEffect(() => {
    filterExperts();
  }, [searchTerm, selectedRole, experts, sortByExperience]);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const data = await getExperts();
      setExperts(data);
      setFilteredExperts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch legal experts');
      toast.error('Failed to load legal experts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterExperts = () => {
    let filtered = experts;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(expert => {
        const aoi = expert.area_of_interest;
        const aoiMatch = Array.isArray(aoi)
          ? aoi.some((a: string) => a?.toLowerCase().includes(term))
          : typeof aoi === 'string' && aoi.toLowerCase().includes(term);
        return (
          expert.full_name?.toLowerCase().includes(term) ||
          expert.designation?.toLowerCase().includes(term) ||
          expert.organization?.toLowerCase().includes(term) ||
          expert.bio?.toLowerCase().includes(term) ||
          expert.role?.toLowerCase().replace('_', ' ').includes(term) ||
          aoiMatch
        );
      });
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(expert => expert.role === selectedRole);
    }

    // Sort by experience
    if (sortByExperience) {
      filtered = [...filtered].sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
    }

    setFilteredExperts(filtered);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'JUDGE':
        return <Gavel className="w-4 h-4 text-constitution-gold" />;
      case 'LAWYER':
      case 'ADVOCATE':
        return <Scale className="w-4 h-4 text-seal-red" />;
      case 'LEGAL_PROFESSIONAL':
        return <GraduationCap className="w-4 h-4 text-black" />;
      case 'LAW_STUDENT':
        return <BookOpen className="w-4 h-4 text-gavel-bronze" />;
      default:
        return <Shield className="w-4 h-4 text-constitution-gold" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'JUDGE':
        return 'bg-constitution-gold/20 text-constitution-gold border-constitution-gold/30';
      case 'LAWYER':
      case 'ADVOCATE':
        return 'bg-seal-red/10 text-seal-red border-seal-red/20';
      case 'LEGAL_PROFESSIONAL':
        return 'bg-black/10 text-black border-link-blue/20';
      case 'LAW_STUDENT':
        return 'bg-gavel-bronze/10 text-gavel-bronze border-gavel-bronze/20';
      default:
        return 'bg-ink-gray/10 text-ink-gray border-ink-gray/20';
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleMessageExpert = (expertId: string) => {
    onNavigate(`/messages/${expertId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-justice-black p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-constitution-gold/20 border-t-constitution-gold rounded-full animate-spin"></div>
              <Scale className="w-8 h-8 text-constitution-gold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-justice-black p-8">
        <div className="max-w-7xl mx-auto">
          <div className="aged-paper rounded-2xl p-12 text-center border border-constitution-gold/30">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-seal-red/20 flex items-center justify-center">
              <Shield className="w-10 h-10 text-seal-red" />
            </div>
            <h3 className="font-heading font-bold text-ink-gray text-2xl mb-3">Connection Error</h3>
            <p className="text-ink-gray/70 mb-8 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchExperts}
              className="px-8 py-3 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-all flex items-center gap-2 mx-auto"
            >
              <Scale className="w-5 h-5" />
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-justice-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="font-heading font-bold text-judge-ivory text-2xl md:text-3xl">
                Consult Legal Experts
              </h1>
              <p className="text-ink-white text-sm md:text-base mt-2">
                Engage with qualified legal professionals for personalized guidance and insights
              </p>
            </div>
          </div>


          {/* Filters */}
          <div className="aged-paper rounded-2xl p-6 mb-8 border border-constitution-gold/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-constitution-gold group-focus-within:text-constitution-gold transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, specialization, or organization..."
                  className="w-full pl-12 pr-4 py-3 bg-constitution-gold/10 border border-constitution-gold/20 text-constitution-gold rounded-xl  placeholder-ink-gray/40 focus:outline-none focus:border-constitution-gold transition-colors font-bold"

                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 bg-constitution-gold/10 border border-constitution-gold/20 text-constitution-gold rounded-xl  focus:outline-none focus:border-constitution-gold transition-colors appearance-none font-bold"
                >

                  <option value="all">All Legal Roles</option>
                  <option value="JUDGE">Judges</option>
                  <option value="LAWYER">Lawyers</option>
                  <option value="ADVOCATE">Advocates</option>
                  <option value="LEGAL_PROFESSIONAL">Legal Professionals</option>
                  <option value="LAW_STUDENT">Law Students</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Scale className="w-5 h-5 text-ink-gray/40" />
                </div>
              </div>

              {/* Sort Button */}
              <button
                onClick={() => setSortByExperience(prev => !prev)}
                className={`px-4 py-3 border rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${sortByExperience
                  ? 'bg-constitution-gold text-justice-black border-constitution-gold'
                  : 'bg-constitution-gold/10 border-constitution-gold/20 text-constitution-gold hover:bg-constitution-gold/20'
                  }`}
              >
                <Crown className="w-5 h-5" />
                Sort by Experience
              </button>
            </div>
          </div>
        </div>

        {/* Experts List */}
        <div className="flex flex-col gap-4">
          {filteredExperts.map((expert) => (
            <div
              key={expert.id}
              className="group relative"
            >
              <div
                className="aged-paper rounded-2xl p-5 border border-constitution-gold/20 hover:border-constitution-gold/40 transition-all cursor-pointer hover:shadow-lg hover:shadow-constitution-gold/5 flex flex-col md:flex-row items-center gap-6"
                onClick={() => handleMessageExpert(expert.id)}
              >
                {/* Profile Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full border-2 border-constitution-gold overflow-hidden bg-parchment-cream relative z-10">
                    {expert.profile_photo_url ? (
                      <img
                        src={expert.profile_photo_url}
                        alt={expert.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                        <User className="w-10 h-10 text-constitution-gold" />
                      </div>
                    )}
                  </div>
                  {expert.is_online && (
                    <div className="absolute top-0 right-0 z-20">
                      <div className="relative">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute"></div>
                        <div className="w-4 h-4 bg-emerald-500 rounded-full relative border-2 border-justice-black"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expert Info - Main Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-ink-gray text-xl leading-tight mb-2">
                        {expert.full_name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRoleBadgeColor(expert.role)}`}>
                          {getRoleIcon(expert.role)}
                          {getRoleDisplayName(expert.role)}
                        </span>
                        {expert.rating && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-constitution-gold/10 text-constitution-gold rounded-full text-xs font-bold">
                            <Star className="w-3 h-3 fill-current" />
                            {expert.rating.toFixed(1)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink-gray/5 text-ink-gray/60 rounded-full text-xs font-bold">
                          <Briefcase className="w-3 h-3" />
                          {expert.experience_years} Years Exp.
                        </span>
                      </div>

                      <p className="text-ink-gray/80 text-sm flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-constitution-gold flex-shrink-0" />
                        <span className="font-bold">Specialty:</span> {expert.area_of_interest}
                      </p>
                      {expert.designation && (
                        <p className="text-ink-gray/60 text-xs pl-6 italic">
                          {expert.designation} {expert.organization ? `at ${expert.organization}` : ''}
                        </p>
                      )}
                    </div>

                    {/* Compact Stats & Action */}
                    <div className="flex items-center gap-6 self-end md:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMessageExpert(expert.id);
                        }}
                        className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all ${expert.is_online
                          ? 'bg-constitution-gold text-justice-black hover:bg-constitution-gold/90 shadow-lg shadow-constitution-gold/10'
                          : 'bg-ink-gray/10 text-ink-gray/60 border border-ink-gray/20 hover:border-constitution-gold/30'
                          }`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        {expert.is_online ? 'Chat Now' : 'Message'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExperts.length === 0 && (
          <div className="aged-paper rounded-2xl p-12 text-center border border-dashed border-constitution-gold/20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-constitution-gold/20 flex items-center justify-center">
              <Search className="w-10 h-10 text-constitution-gold/40" />
            </div>
            <h3 className="font-heading font-bold text-ink-gray text-xl mb-2">
              No experts found
            </h3>
            <p className="text-ink-gray/60 mb-6 max-w-md mx-auto">
              {searchTerm || selectedRole !== 'all'
                ? 'Try adjusting your search terms or filters'
                : 'No legal experts are available at the moment. Please check back later.'}
            </p>
            {(searchTerm || selectedRole !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('all');
                }}
                className="px-6 py-2.5 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWithUsPage