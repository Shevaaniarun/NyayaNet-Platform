// [file name]: NetworkPage.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, 
  Search, 
  Users, 
  UserPlus, 
  UserCheck, 
  Clock, 
  User, 
  Check, 
  X, 
  Mail,
  ChevronRight,
  Filter,
  Loader2
} from "lucide-react";
import * as networkApi from "../api/networkAPI";
import { JusticeLoader } from "../components/JusticeLoader";

interface NetworkPageProps {
  onBack?: () => void;
  currentUserId?: string;
  initialTab?: 'followers' | 'following';
}

type TabType = 'followers' | 'following' | 'requests' | 'pending';

interface UserCardProps {
  user: any;
  tabType: TabType;
  onAction: (userId: string, action: string, requestId?: string) => void;
  currentUserId?: string;
  requestId?: string;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  tabType, 
  onAction, 
  currentUserId,
  requestId 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      await onAction(user.id, action, requestId);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionButton = () => {
    if (user.id === currentUserId) return null;

    switch (tabType) {
      case 'followers':
        // People following me
        if (user.isFollowingBack) {
          // Mutual follow - show Unfollow
          return (
            <button
              onClick={() => handleAction('unfollow')}
              className="px-3 py-1.5 border border-constitution-gold/30 text-constitution-gold rounded-lg text-sm hover:bg-constitution-gold/5 flex items-center gap-1"
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-3 h-3" />
                  Unfollow
                </>
              )}
            </button>
          );
        } else {
          // They follow me, I don't follow back - show Follow Back
          return (
            <button
              onClick={() => handleAction('follow')}
              className="px-3 py-1.5 bg-constitution-gold text-justice-black rounded-lg text-sm font-medium hover:bg-constitution-gold/90 flex items-center gap-1"
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-3 h-3" />
                  Follow Back
                </>
              )}
            </button>
          );
        }

      case 'following':
        // People I'm following
        if (user.isFollowedBy) {
          // Mutual follow - show Unfollow
          return (
            <button
              onClick={() => handleAction('unfollow')}
              className="px-3 py-1.5 border border-constitution-gold/30 text-constitution-gold rounded-lg text-sm hover:bg-constitution-gold/5 flex items-center gap-1"
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-3 h-3" />
                  Unfollow
                </>
              )}
            </button>
          );
        } else {
          // I follow them, they don't follow back - show Following
          return (
            <button
              onClick={() => handleAction('unfollow')}
              className="px-3 py-1.5 border border-constitution-gold/30 text-constitution-gold rounded-lg text-sm hover:bg-constitution-gold/5 flex items-center gap-1"
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-3 h-3" />
                  Following
                </>
              )}
            </button>
          );
        }

      case 'requests':
        // People who sent me follow requests
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('accept_request')}
              className="px-3 py-1.5 bg-constitution-gold text-justice-black rounded-lg text-sm font-medium hover:bg-constitution-gold/90 flex items-center gap-1"
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  Accept
                </>
              )}
            </button>
            <button
              onClick={() => handleAction('reject_request')}
              className="px-3 py-1.5 border border-red-400/30 text-red-400 rounded-lg text-sm hover:bg-red-400/5"
              disabled={isLoading}
              type="button"
            >
              {isLoading ? '...' : 'Reject'}
            </button>
          </div>
        );

      case 'pending':
        // My pending requests
        return (
          <button
            onClick={() => handleAction('cancel_request')}
            className="px-3 py-1.5 border border-constitution-gold/30 text-constitution-gold rounded-lg text-sm hover:bg-constitution-gold/5 flex items-center gap-1"
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Clock className="w-3 h-3" />
                Pending
              </>
            )}
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-constitution-gold/10 rounded-lg hover:border-constitution-gold/30 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-shrink-0">
          {user.profilePhotoUrl ? (
            <img
              src={user.profilePhotoUrl}
              alt={user.fullName}
              className="w-12 h-12 rounded-full object-cover border border-constitution-gold/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-constitution-gold/20 flex items-center justify-center border border-constitution-gold/30">
              <span className="text-constitution-gold font-semibold text-xl">
                {user.fullName?.[0] || '?'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-ink-gray truncate">{user.fullName}</h3>
            {user.role && (
              <span className="px-2 py-0.5 bg-constitution-gold/10 text-constitution-gold text-xs rounded-full">
                {user.role.replace('_', ' ')}
              </span>
            )}
          </div>
          <div className="text-sm text-ink-gray/60 space-y-1 mt-1">
            {user.designation && <div className="truncate">{user.designation}</div>}
            {user.organization && <div className="truncate">{user.organization}</div>}
            {user.location && <div className="truncate">{user.location}</div>}
            {user.experienceYears > 0 && (
              <div>{user.experienceYears} years experience</div>
            )}
          </div>
          {user.bio && (
            <p className="text-sm text-ink-gray/70 mt-2 line-clamp-2">{user.bio}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-ink-gray/50">
            <span>{user.followerCount || 0} followers</span>
            <span>{user.followingCount || 0} following</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 ml-4">
        {getActionButton()}
        <button
          onClick={() => window.location.href = `/profile/${user.id}`}
          className="text-sm text-constitution-gold hover:underline flex items-center gap-1"
          type="button"
        >
          View Profile
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export function NetworkPage({ onBack, currentUserId, initialTab }: NetworkPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'followers');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Data states
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    requests: 0,
    pending: 0
  });

  const loadNetworkData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        followersData,
        followingData,
        requestsData,
        pendingData,
        statsData
      ] = await Promise.all([
        networkApi.getFollowers(),
        networkApi.getFollowing(),
        networkApi.getFollowRequests(),
        networkApi.getPendingRequests(),
        networkApi.getNetworkStats()
      ]);

      setFollowers(followersData || []);
      setFollowing(followingData || []);
      setRequests(requestsData || []);
      setPending(pendingData || []);
      setStats(statsData || {});
    } catch (error) {
      console.error('Failed to load network data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await networkApi.searchUsers(searchQuery);
      setSearchResults(result.users || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserAction = async (userId: string, action: string, requestId?: string) => {
    try {
      switch (action) {
        case 'follow':
          await networkApi.sendFollowRequest(userId);
          await loadNetworkData();
          break;
        
        case 'unfollow':
          if (window.confirm('Are you sure you want to unfollow this user?')) {
            await networkApi.unfollowUser(userId);
            await loadNetworkData();
          }
          break;
        
        case 'accept_request':
          if (requestId) {
            await networkApi.acceptFollowRequest(requestId);
          } else {
            const request = requests.find(req => req.user?.id === userId);
            if (request) {
              await networkApi.acceptFollowRequest(request.id);
            }
          }
          await loadNetworkData();
          break;
        
        case 'reject_request':
          if (requestId) {
            await networkApi.rejectFollowRequest(requestId);
          } else {
            const request = requests.find(req => req.user?.id === userId);
            if (request) {
              await networkApi.rejectFollowRequest(request.id);
            }
          }
          await loadNetworkData();
          break;
        
        case 'cancel_request':
          if (requestId) {
            await networkApi.cancelFollowRequest(requestId);
          } else {
            const pendingRequest = pending.find(req => req.user?.id === userId);
            if (pendingRequest) {
              await networkApi.cancelFollowRequest(pendingRequest.id);
            }
          }
          await loadNetworkData();
          break;
      }
    } catch (error: any) {
      console.error(`Failed to ${action} user:`, error);
      alert(error.message || `Failed to ${action} user`);
    }
  };

  const getTabContent = () => {
    if (isLoading) return <JusticeLoader />;

    // Show search results when there are search results
    if (searchResults.length > 0) {
      return renderSearchResults();
    }

    switch (activeTab) {
      case 'followers':
        return renderUserList(followers, 'followers');
      
      case 'following':
        return renderUserList(following, 'following');
      
      case 'requests':
        return renderRequestList(requests, 'requests');
      
      case 'pending':
        return renderRequestList(pending, 'pending');
      
      default:
        return null;
    }
  };

  const renderUserList = (users: any[], tabType: TabType) => {
    if (users.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-ink-gray/30 mx-auto mb-4" />
          <p className="text-ink-gray/60">No users found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            tabType={tabType}
            onAction={handleUserAction}
            currentUserId={currentUserId}
            requestId={user.requestId}
          />
        ))}
      </div>
    );
  };

  const renderRequestList = (requests: any[], type: 'requests' | 'pending') => {
    if (requests.length === 0) {
      return (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-ink-gray/30 mx-auto mb-4" />
          <p className="text-ink-gray/60">No {type} requests</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {requests.map((request) => (
          <UserCard
            key={request.id}
            user={request.user}
            tabType={type === 'requests' ? 'requests' : 'pending'}
            onAction={handleUserAction}
            currentUserId={currentUserId}
            requestId={request.id}
          />
        ))}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <div className="text-center py-12">
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-constitution-gold animate-spin" />
          </div>
          <p className="text-ink-gray/60 mt-4">Searching...</p>
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-ink-gray/30 mx-auto mb-4" />
          <p className="text-ink-gray/60">No users found</p>
          <p className="text-ink-gray/40 text-sm mt-2">Try searching with different keywords</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {searchResults.map((user) => {
          // Determine the tab type based on user's follow status
          let tabType: TabType = 'followers';
          if (user.isFollowing && !user.isFollower) {
            tabType = 'following';
          } else if (user.hasPendingRequest) {
            tabType = 'pending';
          }

          return (
            <UserCard
              key={user.id}
              user={user}
              tabType={tabType}
              onAction={handleUserAction}
              currentUserId={currentUserId}
            />
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    loadNetworkData();
  }, [loadNetworkData]);

  const tabs = [
    { id: 'followers', label: 'Followers', icon: User, count: stats.followers },
    { id: 'following', label: 'Following', icon: UserCheck, count: stats.following },
    { id: 'requests', label: 'Requests', icon: Mail, count: stats.requests },
    { id: 'pending', label: 'Pending', icon: Clock, count: stats.pending },
  ];

  return (
    <div className="min-h-screen bg-justice-black p-8">
      <div className="max-w-6xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-constitution-gold hover:text-constitution-gold/80 mb-6 transition-colors"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />Back
          </button>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-judge-ivory mb-2">Network</h1>
          <p className="text-ink-gray/60">Connect with legal professionals and build your network</p>
        </div>

        {/* Search Bar - Fixed font color to white */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
            <input
              type="text"
              placeholder="Search for legal professionals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-24 py-3 bg-aged-paper border border-constitution-gold/20 rounded-lg text-judge-ivory placeholder-ink-gray/50 focus:outline-none focus:border-constitution-gold/50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                className="p-2 hover:bg-constitution-gold/10 rounded"
                title="Filter"
                onClick={() => {/* Implement filters */}}
              >
                <Filter className="w-4 h-4 text-ink-gray/50" />
              </button>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-1.5 bg-constitution-gold text-justice-black rounded font-medium text-sm hover:bg-constitution-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-all whitespace-nowrap rounded-t-lg ${
                    isActive 
                      ? 'bg-aged-paper text-constitution-gold border-t border-x border-constitution-gold/20 shadow-sm' 
                      : 'bg-constitution-gold/5 text-judge-ivory/70 hover:bg-constitution-gold/10 hover:text-judge-ivory border-t border-x border-constitution-gold/10'
                  }`}
                  type="button"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive 
                        ? 'bg-constitution-gold/20 text-constitution-gold' 
                        : 'bg-judge-ivory/10 text-judge-ivory/70'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="border-b border-constitution-gold/20"></div>
        </div>

        {/* Content */}
        <div className="aged-paper rounded-lg border border-constitution-gold/20 shadow-sm">
          <div className="p-6">
            {getTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}