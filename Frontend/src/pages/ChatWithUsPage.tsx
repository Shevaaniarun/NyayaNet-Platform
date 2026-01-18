/**
 * Chat With Us Page - Browse and message legal experts
 */

import React, { useState, useEffect } from 'react';
import { getExperts } from '../api/messagesAPI';
import { MessageCircle, Scale, Gavel, GraduationCap, User, Briefcase, Award } from 'lucide-react';

interface Expert {
  id: string;
  full_name: string;
  email: string;
  role: string;
  designation: string;
  organization: string;
  area_of_interest: string;
  profile_photo_url: string;
  experience_years: number;
}

interface ChatWithUsPageProps {
  onNavigate: (path: string) => void;
}

const ChatWithUsPage: React.FC<ChatWithUsPageProps> = ({ onNavigate }) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const data = await getExperts();
      setExperts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'JUDGE':
        return <Gavel className="w-5 h-5 text-amber-600" />;
      case 'LAWYER':
      case 'ADVOCATE':
        return <Scale className="w-5 h-5 text-blue-600" />;
      case 'LEGAL_PROFESSIONAL':
        return <GraduationCap className="w-5 h-5 text-purple-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'JUDGE':
        return 'bg-amber-100 text-amber-800';
      case 'LAWYER':
      case 'ADVOCATE':
        return 'bg-blue-100 text-blue-800';
      case 'LEGAL_PROFESSIONAL':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMessageExpert = (expertId: string) => {
    onNavigate(`/messages/${expertId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading legal experts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={fetchExperts}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            Chat With Legal Experts
          </h1>
          <p className="mt-2 text-gray-600">
            Connect with experienced lawyers, judges, and legal professionals for guidance and support
          </p>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {expert.profile_photo_url ? (
                      <img 
                        src={expert.profile_photo_url} 
                        alt={expert.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 text-white">
                    <h3 className="font-bold text-lg">{expert.full_name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(expert.role)} bg-white bg-opacity-90`}>
                      {getRoleIcon(expert.role)}
                      {expert.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6 space-y-3">
                {expert.designation && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{expert.designation}</p>
                      {expert.organization && (
                        <p className="text-xs text-gray-500">{expert.organization}</p>
                      )}
                    </div>
                  </div>
                )}

                {expert.area_of_interest && (
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Specialization</p>
                      <p className="text-sm text-gray-700">{expert.area_of_interest}</p>
                    </div>
                  </div>
                )}

                {expert.experience_years > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500">
                      <span className="font-bold text-blue-600 text-lg">{expert.experience_years}</span> years experience
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => handleMessageExpert(expert.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            </div>
          ))}
        </div>

        {experts.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No legal experts available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWithUsPage;
