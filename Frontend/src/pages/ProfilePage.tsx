"use client";
import React, { useState, useEffect } from "react";
import { ProfileHeader } from "../components/Profile/ProfileHeader";
import { ProfileStats } from "../components/Profile/ProfileStats";
import { CertificationCard } from "../components/CertificationCard";
import { ProfileTabs } from "../components/Profile/ProfileTabs";
import { JusticeLoader } from "../components/JusticeLoader";
import { Search, Award, Plus, ArrowLeft, X, UserPlus, UserCheck, Clock, Upload, Calendar, Link as LinkIcon, MapPin, Briefcase, Globe, Linkedin, FileText, Tag } from "lucide-react";
import * as profileApi from "../api/profileAPI";
import * as networkApi from "../api/networkAPI";

interface ProfilePageProps {
  userId?: string;
  currentUserId?: string;
  onBack?: () => void;
  onNavigateToFeed?: () => void;
  onNavigateToDiscussion?: (discussionId?: string) => void;
}

/**
 * Validation for selected user's profile:
 * If userId is provided, ProfilePage loads and displays the profile for that userId.
 * If not provided (undefined or empty), it falls back to currentUserId (your own).
 * All data fetching is driven by `targetUserId`.
 */
export function ProfilePage({
  userId,
  currentUserId,
  onBack,
  onNavigateToFeed,
  onNavigateToDiscussion,
}: ProfilePageProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [likedDiscussions, setLikedDiscussions] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showAddCertModal, setShowAddCertModal] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<any>({});
  const [newCert, setNewCert] = useState({
    title: "",
    issuingOrganization: "",
    credentialId: "",
    issueDate: "",
    expiryDate: "",
    certificateUrl: "",
    fileType: "PDF",
    description: "",
    tags: "",
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploadingCert, setUploadingCert] = useState<boolean>(false);

  // Follow states
  const [followStatus, setFollowStatus] = useState<string>('NONE');
  const [isLoadingFollow, setIsLoadingFollow] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const isOwnProfile =
    userId == null ||
    userId === "" ||
    (currentUserId != null && userId === currentUserId);

  const targetUserId = userId || currentUserId;

  // Profile Stats State
  const [profileStats, setProfileStats] = useState<{
    followers: number,
    following: number,
    posts: number,
    discussions: number,
    likes: number
  }>({
    followers: 0,
    following: 0,
    posts: 0,
    discussions: 0,
    likes: 0
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState<"posts" | "discussions" | "bookmarks" | "likedPosts" | "likedDiscussions" | "followers" | "following">("posts");

  useEffect(() => {
    if (targetUserId) {
      loadProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

  useEffect(() => {
    if (targetUserId && currentUserId && !isOwnProfile) {
      loadFollowStatus();
    }
  }, [targetUserId, currentUserId, isOwnProfile]);

  async function loadFollowStatus() {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;

    setIsLoadingFollow(true);
    try {
      const status = await networkApi.getFollowStatus(targetUserId);
      setFollowStatus(status.status || 'NONE');
      setRequestId(status.requestId || null);
    } catch (error) {
      console.error("Failed to load follow status:", error);
      setFollowStatus('NONE');
      setRequestId(null);
    } finally {
      setIsLoadingFollow(false);
    }
  }

  async function loadFollowersData() {
    if (!targetUserId) return;
    
    try {
      const followersData = await networkApi.getFollowers();
      setFollowers(Array.isArray(followersData) ? followersData : []);
    } catch (error) {
      console.error('Failed to load followers:', error);
      setFollowers([]);
    }
  }

  async function loadFollowingData() {
    if (!targetUserId) return;
    
    try {
      const followingData = await profileApi.getFollowing();
      setFollowing(Array.isArray(followingData) ? followingData : []);
    } catch (error) {
      console.error('Failed to load following:', error);
      setFollowing([]);
    }
  }

  async function loadProfileData() {
    setIsLoading(true);

    let profileData: any = null;
    let stats = {
      followers: 0,
      following: 0,
      posts: 0,
      discussions: 0,
      likes: 0
    };

    try {
      profileData = await profileApi.getProfile(targetUserId!);
      if (!profileData || !profileData.id) throw new Error("No profile");
      setProfile(profileData);
      setEditForm(profileData);

      stats.followers = typeof profileData.followerCount === "number" ? profileData.followerCount : 0;
      stats.following = typeof profileData.followingCount === "number" ? profileData.followingCount : 0;
      stats.posts = typeof profileData.postCount === "number" ? profileData.postCount : 0;
      stats.discussions = typeof profileData.discussionCount === "number" ? profileData.discussionCount : 0;
      stats.likes = typeof profileData.likes === "number"
        ? profileData.likes
        : (
            (typeof profileData.likeCount === "number" && profileData.likeCount) ||
            0
          );
    } catch (err: any) {
      const emptyProfile = {
        id: targetUserId ?? "",
        fullName: "New User",
        email: "",
        role: "USER",
        designation: "",
        organization: "",
        areaOfInterest: [],
        experienceYears: 0,
        bio: "Welcome! Edit your profile to add your information.",
        profilePhotoUrl: null,
        coverPhotoUrl: null,
        location: "",
        websiteUrl: "",
        linkedinUrl: "",
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        discussionCount: 0,
        isFollowing: false,
        likes: 0,
      };
      setProfile(emptyProfile);
      setEditForm(emptyProfile);
      stats = {
        followers: 0,
        following: 0,
        posts: 0,
        discussions: 0,
        likes: 0
      };
    }

    try {
      const certsData = await profileApi.getCertifications(targetUserId!);
      setCertifications(Array.isArray(certsData) ? certsData : []);
    } catch (e) {
      setCertifications([]);
    }

    try {
      const postsData = await profileApi.getUserPosts(targetUserId!);
      setPosts(postsData?.posts || []);
    } catch (e) {
      setPosts([]);
    }

    try {
      const discussionsData = await profileApi.getUserDiscussions(targetUserId!);
      setDiscussions(discussionsData?.discussions || []);
    } catch (e) {
      setDiscussions([]);
    }

    // Load followers and following data
    try {
      const followersData = await networkApi.getFollowers();
      setFollowers(Array.isArray(followersData) ? followersData : []);
    } catch (e) {
      setFollowers([]);
    }

    try {
      const followingData = await networkApi.getFollowing();
      setFollowing(Array.isArray(followingData) ? followingData : []);
    } catch (e) {
      setFollowing([]);
    }

    if (isOwnProfile) {
      try {
        const bookmarksData = await profileApi.getBookmarks();
        setBookmarks(bookmarksData?.bookmarks || []);
      } catch (e) {
        setBookmarks([]);
      }

      try {
        const likedPostsData = await profileApi.getLikedPosts();
        setLikedPosts(likedPostsData?.posts || []);
      } catch (e) {
        setLikedPosts([]);
      }

      try {
        const likedDiscussionsData = await profileApi.getLikedDiscussions();
        setLikedDiscussions(likedDiscussionsData?.discussions || []);
      } catch (e) {
        setLikedDiscussions([]);
      }
    } else {
      setBookmarks([]);
      setLikedPosts([]);
      setLikedDiscussions([]);
    }

    setProfileStats(stats);
    setIsLoading(false);
  }

  const handleFollowAction = async (action: string) => {
    if (!targetUserId || isOwnProfile || isLoadingFollow) return;

    setIsLoadingFollow(true);
    try {
      switch (action) {
        case 'follow':
          const followResult = await profileApi.followUser(targetUserId);
          setFollowStatus('FOLLOWING');
          if (followResult.requestId) {
            setRequestId(followResult.requestId);
          }
          break;

        case 'unfollow':
          if (window.confirm('Are you sure you want to unfollow this user?')) {
            await profileApi.unfollowUser(targetUserId);
            setFollowStatus('NONE');
            setRequestId(null);
            if (profile) {
              setProfile({
                ...profile,
                followerCount: Math.max(0, profile.followerCount - 1)
              });
            }
          }
          break;

        case 'cancel_request':
          if (requestId) {
            await networkApi.cancelFollowRequest(requestId);
          }
          setFollowStatus('NONE');
          setRequestId(null);
          break;
      }

      // Refresh data
      await loadProfileData();
      await loadFollowStatus();
    } catch (error: any) {
      console.error(`Follow action failed:`, error);
      alert(error.message || `Failed to ${action}`);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const getFollowButton = () => {
    if (isOwnProfile || !followStatus) return null;

    if (isLoadingFollow) {
      return (
        <button
          disabled
          className="px-4 py-2 bg-constitution-gold/50 text-justice-black rounded-lg font-medium text-sm cursor-not-allowed flex items-center gap-2"
          type="button"
        >
          <div className="w-4 h-4 border-2 border-justice-black border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </button>
      );
    }

    switch (followStatus) {
      case 'FOLLOWING':
      case 'MUTUAL':
        return (
          <button
            onClick={() => handleFollowAction('unfollow')}
            className="px-4 py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg font-medium hover:bg-constitution-gold/5 flex items-center gap-2"
            type="button"
          >
            <UserCheck className="w-4 h-4" />
            Unfollow
          </button>
        );

      case 'FOLLOWED_BY':
        return (
          <button
            onClick={() => handleFollowAction('follow')}
            className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 flex items-center gap-2"
            type="button"
          >
            <UserPlus className="w-4 h-4" />
            Follow Back
          </button>
        );

      case 'PENDING':
        return (
          <button
            onClick={() => handleFollowAction('cancel_request')}
            className="px-4 py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg font-medium hover:bg-constitution-gold/5 flex items-center gap-2"
            type="button"
          >
            <Clock className="w-4 h-4" />
            Pending
          </button>
        );

      case 'NONE':
      default:
        return (
          <button
            onClick={() => handleFollowAction('follow')}
            className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 flex items-center gap-2"
            type="button"
          >
            <UserPlus className="w-4 h-4" />
            Follow
          </button>
        );
    }
  };

  // Handle follow/unfollow from tabs
  const handleFollowUser = async (userId: string) => {
    if (!currentUserId || userId === currentUserId || isOwnProfile) return;
    
    try {
      await profileApi.followUser(userId);
      
      // Update followers list if the user is in followers tab
      setFollowers(prev => prev.map(user => 
        user.id === userId ? { ...user, isFollowingBack: true } : user
      ));
      
      // Reload profile data to update counts
      await loadProfileData();
      alert('Successfully followed user!');
    } catch (error: any) {
      console.error('Failed to follow user:', error);
      alert(error.message || 'Failed to follow user');
    }
  };

  const handleUnfollowUser = async (userId: string) => {
    if (!currentUserId || userId === currentUserId || isOwnProfile) return;
    
    if (!window.confirm('Are you sure you want to unfollow this user?')) return;
    
    try {
      await profileApi.unfollowUser(userId);
      
      // Update both followers and following lists
      setFollowers(prev => prev.map(user => 
        user.id === userId ? { ...user, isFollowingBack: false } : user
      ));
      
      setFollowing(prev => prev.filter(user => user.id !== userId));
      
      // Reload profile data to update counts
      await loadProfileData();
      alert('Successfully unfollowed user!');
    } catch (error: any) {
      console.error('Failed to unfollow user:', error);
      alert(error.message || 'Failed to unfollow user');
    }
  };

  const handleUserClick = (userId: string) => {
    // Navigate to user's profile
    if (onNavigateToDiscussion) {
      // This will navigate to the discussion page, we need a different approach
      // For now, just reload the page with the new user's profile
      window.location.href = `/profile/${userId}`;
    }
  };

  const handleEditProfile = () => {
    setEditForm({ ...profile });
    setShowEditModal(true);
  };

  const handlePhotoUpdate = async (
    type: "profile" | "cover",
    file: File,
    previewUrl: string
  ) => {
    try {
      if (type === "profile") {
        const result = await profileApi.uploadProfilePhoto(file);
        setProfile((prev: any) => ({
          ...(prev ?? {}),
          profilePhotoUrl: result?.profilePhotoUrl ?? previewUrl,
        }));
      } else {
        const result = await profileApi.uploadCoverPhoto(file);
        setProfile((prev: any) => ({
          ...(prev ?? {}),
          coverPhotoUrl: result?.coverPhotoUrl ?? previewUrl,
        }));
      }
    } catch (err) {
      setProfile((prev: any) => ({
        ...(prev ?? {}),
        [type === "profile"
          ? "profilePhotoUrl"
          : "coverPhotoUrl"]: previewUrl,
      }));
    }
  };

  const handleSaveProfile = async () => {
    const role = profile?.role ?? editForm?.role ?? "";
    if (
      ["LAWYER", "JUDGE", "ADVOCATE"].includes(role) &&
      !(editForm.barCouncilNumber && editForm.barCouncilNumber.trim())
    ) {
      alert("Bar Council Number is required for your role");
      return;
    }

    try {
      await profileApi.updateProfile(editForm);
      setProfile((prev: any) => ({
        ...(prev ?? {}),
        ...editForm,
        id: prev?.id ?? editForm?.id ?? "",
      }));
      setShowEditModal(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setProfile((prev: any) => ({
        ...(prev ?? {}),
        ...editForm,
        id: prev?.id ?? editForm?.id ?? "",
      }));
      setShowEditModal(false);
      alert("Profile updated successfully!");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await profileApi.searchUserContent(searchQuery);
      if (results.results) {
        setPosts(Array.isArray(results.results.posts) ? results.results.posts : []);
        setDiscussions(Array.isArray(results.results.discussions) ? results.results.discussions : []);
      }
    } catch (err) {
      const q = searchQuery.toLowerCase();
      setPosts((prev = []) =>
        Array.isArray(prev)
          ? prev.filter(
            (p: any) =>
              (p.title && p.title.toLowerCase().includes(q)) ||
              (p.content && p.content.toLowerCase().includes(q))
            )
          : []
      );
      setDiscussions((prev = []) =>
        Array.isArray(prev)
          ? prev.filter(
            (d: any) =>
              (d.title && d.title.toLowerCase().includes(q)) ||
              (d.description && d.description.toLowerCase().includes(q))
            )
          : []
      );
    }
  };

  const handleDeleteCertification = async (certId: string) => {
    if (!window.confirm("Are you sure you want to delete this certification?")) return;
    try {
      await profileApi.deleteCertification(certId);
    } catch (err) {}
    setCertifications((certs) => certs.filter((c) => c.id !== certId));
  };

  const handleAddCertification = async () => {
    if (!newCert.title || !newCert.issuingOrganization || !newCert.issueDate) {
      alert("Please fill in required fields");
      return;
    }

    let certificateUrl = newCert.certificateUrl;
    let fileType = newCert.fileType;

    if (certificateFile) {
      setUploadingCert(true);
      try {
        const uploadResult = await profileApi.uploadCertificateFile(
          certificateFile
        );
        certificateUrl = uploadResult.certificateUrl;
        fileType = uploadResult.fileType;
      } catch (err) {
        alert("Failed to upload certificate file");
        setUploadingCert(false);
        return;
      }
      setUploadingCert(false);
    }

    const certData = {
      ...newCert,
      certificateUrl,
      fileType,
      tags: newCert.tags
        ? newCert.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : [],
    };

    try {
      const added = await profileApi.addCertification(certData);
      setCertifications((prev) => [...(prev ?? []), added]);
    } catch (err) {
      setCertifications((prev) => [
        ...(prev ?? []),
        { ...certData, id: `cert-${Date.now()}` },
      ]);
    }
    setNewCert({
      title: "",
      issuingOrganization: "",
      credentialId: "",
      issueDate: "",
      expiryDate: "",
      certificateUrl: "",
      fileType: "PDF",
      description: "",
      tags: "",
    });
    setCertificateFile(null);
    setShowAddCertModal(false);
  };

  const handleDiscussionOwnerClick = (discussion: any) => {
    if (discussion && discussion.authorId) {
      window.location.href = `/profile/${discussion.authorId}`;
    }
  };

  // ---- ProfileTab CREATE HANDLERS ----
  // Only upward event for "+ New Discussion"
  const handleCreateDiscussion = () => {
    // Call only the upward event, no direct navigation logic here
    if (onNavigateToDiscussion) {
      onNavigateToDiscussion();
    }
  };

  if (isLoading) return <JusticeLoader />;

  return (
    <div className="min-h-screen bg-justice-black p-8">
      <div className="max-w-5xl mx-auto">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-constitutional-gold/50" />
            <input
              type="text"
              placeholder="Search within your content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" ? handleSearch() : undefined
              }
              className="w-full pl-12 pr-24 py-3 bg-[#1e1b1a] border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-constitution-gold text-stone-900 rounded font-medium text-sm hover:bg-constitution-gold/90 transition-colors"
              type="button"
            >
              Search
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          onEditProfile={handleEditProfile}
          onPhotoUpdate={handlePhotoUpdate}
          connectionStatus={followStatus}
        />

        {/* Follow Button Section */}
        {!isOwnProfile && (
          <div className="mt-4 flex justify-end">
            {getFollowButton()}
          </div>
        )}

        {/* Certifications Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-constitutional-gold" />
              <h2 className="font-heading font-bold text-stone-200">
                Certifications & Qualifications
              </h2>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setShowAddCertModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-constitution-gold text-stone-900 rounded-lg font-medium text-sm hover:bg-constitution-gold/90 transition-colors"
                type="button"
              >
                <Plus className="w-4 h-4" />
                Add Certification
              </button>
            )}
          </div>
          {(Array.isArray(certifications) && certifications.length > 0) ? (
            <div className="space-y-3">
              {certifications.map((cert) => (
                <CertificationCard
                  key={cert.id}
                  certification={cert}
                  isOwnProfile={isOwnProfile}
                  onDelete={handleDeleteCertification}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#1e1b1a] rounded-lg p-8 text-center border border-constitution-gold/10">
              <Award className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <p className="text-stone-400">No certifications added yet</p>
              {isOwnProfile && (
                <button
                  onClick={() => setShowAddCertModal(true)}
                  className="mt-3 text-constitutional-gold hover:text-amber-400 hover:underline text-sm transition-colors"
                  type="button"
                >
                  Add your first certification
                </button>
              )}
            </div>
          )}
        </div>

        {/* --------- ProfileTabs with followers/following --------- */}
        <div className="mt-6">
          <ProfileTabs
            posts={posts}
            discussions={discussions}
            bookmarks={bookmarks}
            likedPosts={likedPosts}
            likedDiscussions={likedDiscussions}
            followers={followers}
            following={following}
            isOwnProfile={isOwnProfile}
            onCreatePost={() => {
              // Handle post creation
              if (onNavigateToFeed) onNavigateToFeed();
            }}
            onCreateDiscussion={handleCreateDiscussion}
            onPostClick={(postId) => {
              if (onNavigateToFeed) onNavigateToFeed();
            }}
            onDiscussionClick={(discussionId) => {
              if (onNavigateToDiscussion) onNavigateToDiscussion(discussionId);
            }}
            onUserClick={handleUserClick}
            onFollow={handleFollowUser}
            onUnfollow={handleUnfollowUser}
          />
        </div>
      </div>

      {/* Edit Profile Modal - IMPROVED UI */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1b1a] rounded-xl border border-constitution-gold/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1e1b1a] border-b border-constitution-gold/20 px-6 py-4 flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-stone-200">
                Edit Profile
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-constitution-gold/90/10 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Full Name <span className="text-constitutional-gold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editForm.fullName || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, fullName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Designation & Organization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Designation
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="text"
                        value={editForm.designation || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, designation: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                        placeholder="e.g., Senior Lawyer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={editForm.organization || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, organization: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                      placeholder="e.g., Law Firm"
                    />
                  </div>
                </div>

                {/* Bar Council Number (conditional) */}
                {["LAWYER", "JUDGE", "ADVOCATE"].includes(editForm.role) && (
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Bar Council Number <span className="text-constitutional-gold">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.barCouncilNumber || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          barCouncilNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                      placeholder="Enter your bar council number"
                    />
                  </div>
                )}

                {/* Experience & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.experienceYears || 0}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          experienceYears: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="text"
                        value={editForm.location || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, location: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Website & LinkedIn */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Website URL
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="url"
                        value={editForm.websiteUrl || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, websiteUrl: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      LinkedIn URL
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="url"
                        value={editForm.linkedinUrl || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, linkedinUrl: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-constitution-gold/20">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-constitution-gold/30 text-constitutional-gold rounded-lg hover:bg-constitution-gold/90/5 transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-constitution-gold text-stone-900 rounded-lg font-medium hover:bg-constitution-gold/90 transition-colors"
                  type="button"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Certification Modal - IMPROVED UI */}
      {showAddCertModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1b1a] rounded-xl border border-constitution-gold/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1e1b1a] border-b border-constitution-gold/20 px-6 py-4 flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-stone-200">
                Add Certification
              </h2>
              <button
                onClick={() => setShowAddCertModal(false)}
                className="p-2 hover:bg-constitution-gold/90/10 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Title <span className="text-constitutional-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCert.title}
                    onChange={(e) =>
                      setNewCert({ ...newCert, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                    placeholder="e.g., Certified Legal Specialist"
                  />
                </div>

                {/* Issuing Organization */}
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Issuing Organization <span className="text-constitutional-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCert.issuingOrganization}
                    onChange={(e) =>
                      setNewCert({
                        ...newCert,
                        issuingOrganization: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                    placeholder="e.g., National Bar Association"
                  />
                </div>

                {/* Credential ID */}
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    value={newCert.credentialId}
                    onChange={(e) =>
                      setNewCert({ ...newCert, credentialId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                    placeholder="Optional"
                  />
                </div>

                {/* Issue & Expiry Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Issue Date <span className="text-constitutional-gold">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="date"
                        value={newCert.issueDate}
                        onChange={(e) =>
                          setNewCert({ ...newCert, issueDate: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="date"
                        value={newCert.expiryDate}
                        onChange={(e) =>
                          setNewCert({ ...newCert, expiryDate: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Certificate File */}
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Certificate File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) =>
                        setCertificateFile(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                      className="w-full px-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-constitution-gold file:text-stone-900 hover:file:bg-constitutional-gold file:cursor-pointer file:transition-colors"
                    />
                  </div>
                  {certificateFile && (
                    <p className="mt-2 text-sm text-stone-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-constitutional-gold" />
                      {certificateFile.name}
                    </p>
                  )}
                  <p className="text-xs text-stone-500 mt-1">
                    Upload PDF or image of your certificate (optional)
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCert.description}
                    onChange={(e) =>
                      setNewCert({ ...newCert, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20 resize-none"
                    placeholder="Brief description of the certification"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Tags
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                      type="text"
                      value={newCert.tags}
                      onChange={(e) =>
                        setNewCert({ ...newCert, tags: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-constitution-gold/20 rounded-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-constitutional-gold/50 focus:ring-1 focus:ring-constitution-gold/20"
                      placeholder="litigation, corporate law, ethics (comma separated)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-constitution-gold/20">
                <button
                  onClick={() => setShowAddCertModal(false)}
                  className="px-4 py-2 border border-constitution-gold/30 text-constitutional-gold rounded-lg hover:bg-constitution-gold/90/5 transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCertification}
                  disabled={uploadingCert}
                  className="px-4 py-2 bg-constitution-gold text-stone-900 rounded-lg font-medium hover:bg-constitution-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  type="button"
                >
                  {uploadingCert ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    'Add Certification'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}