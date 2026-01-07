// [file name]: ProfilePage.tsx
"use client";
import React, { useState, useEffect } from "react";
import { ProfileHeader } from "../components/Profile/ProfileHeader";
import { ProfileStats } from "../components/Profile/ProfileStats";
import { CertificationCard } from "../components/CertificationCard";
import { ProfileTabs } from "../components/Profile/ProfileTabs";
import { JusticeLoader } from "../components/JusticeLoader";
import { Search, Award, Plus, ArrowLeft, X, UserPlus, UserCheck, Clock, Check } from "lucide-react";
import * as profileApi from "../api/profileAPI";
import * as networkApi from "../api/networkAPI";

interface ProfilePageProps {
  userId?: string;
  currentUserId?: string;
  onBack?: () => void;
  onNavigateToFeed?: () => void;
}

export function ProfilePage({
  userId,
  currentUserId,
  onBack,
  onNavigateToFeed,
}: ProfilePageProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
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

  // Load profile data and follow status
  useEffect(() => {
    if (targetUserId) {
      loadProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

  // Load follow status when viewing someone else's profile
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
      setFollowStatus(status.status);
      setRequestId(status.requestId || null);
    } catch (error) {
      console.error("Failed to load follow status:", error);
      setFollowStatus('NONE');
      setRequestId(null);
    } finally {
      setIsLoadingFollow(false);
    }
  }

  async function loadProfileData() {
    setIsLoading(true);

    let profileData: any = null;
    try {
      profileData = await profileApi.getProfile(targetUserId!);
      if (!profileData || !profileData.id) throw new Error("No profile");
      setProfile(profileData);
      setEditForm(profileData);
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
      };
      setProfile(emptyProfile);
      setEditForm(emptyProfile);
    }

    try {
      const certsData = await profileApi.getCertifications(targetUserId!);
      setCertifications(Array.isArray(certsData) ? certsData : []);
    } catch (e) {
      setCertifications([]);
    }

    try {
      const postsData = await profileApi.getUserPosts(targetUserId!);
      setPosts(Array.isArray(postsData?.posts) ? postsData.posts : []);
    } catch (e) {
      setPosts([]);
    }

    try {
      const discussionsData = await profileApi.getUserDiscussions(
        targetUserId!
      );
      setDiscussions(Array.isArray(discussionsData?.discussions) ? discussionsData.discussions : []);
    } catch (e) {
      setDiscussions([]);
    }

    if (isOwnProfile) {
      try {
        const bookmarksData = await profileApi.getBookmarks();
        setBookmarks(Array.isArray(bookmarksData?.bookmarks) ? bookmarksData.bookmarks : []);
      } catch (e) {
        setBookmarks([]);
      }
    }

    setIsLoading(false);
  }

  const handleFollowAction = async (action: string) => {
    if (!targetUserId || isOwnProfile || isLoadingFollow) return;

    setIsLoadingFollow(true);
    try {
      switch (action) {
        case 'follow':
          const followResult = await networkApi.sendFollowRequest(targetUserId);
          setFollowStatus('PENDING');
          if (followResult.requestId) {
            setRequestId(followResult.requestId);
          }
          break;
        
        case 'unfollow':
          if (window.confirm('Are you sure you want to unfollow this user?')) {
            await networkApi.unfollowUser(targetUserId);
            setFollowStatus('NONE');
            setRequestId(null);
            // Update follower count
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
      
      // Reload profile to update counts
      await loadProfileData();
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
    } catch (err) {
    }
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

  if (isLoading) return <JusticeLoader />;

  return (
    <div className="min-h-screen bg-justice-black p-8">
      <div className="max-w-5xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-constitution-gold hover:text-constitution-gold/80 mb-6 transition-colors"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />Back
          </button>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
            <input
              type="text"
              placeholder="Search within your content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" ? handleSearch() : undefined
              }
              className="w-full pl-12 pr-24 py-3 bg-aged-paper border border-constitution-gold/20 rounded-lg text-ink-gray placeholder-ink-gray/50 focus:outline-none focus:border-constitution-gold/50"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-constitution-gold text-justice-black rounded font-medium text-sm hover:bg-constitution-gold/90"
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

        <div className="mt-6">
          <ProfileStats
            followerCount={profile?.followerCount ?? 0}
            followingCount={profile?.followingCount ?? 0}
            postCount={profile?.postCount ?? 0}
            discussionCount={profile?.discussionCount ?? 0}
          />
        </div>

        {/* Certifications Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-constitution-gold" />
              <h2 className="font-heading font-bold text-judge-ivory">
                Certifications & Qualifications
              </h2>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setShowAddCertModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-constitution-gold text-justice-black rounded-lg font-medium text-sm hover:bg-constitution-gold/90"
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
            <div className="aged-paper rounded-lg p-8 text-center border border-constitution-gold/20">
              <Award className="w-12 h-12 text-ink-gray/30 mx-auto mb-3" />
              <p className="text-ink-gray/60">No certifications added yet</p>
              {isOwnProfile && (
                <button
                  onClick={() => setShowAddCertModal(true)}
                  className="mt-3 text-constitution-gold hover:underline text-sm"
                  type="button"
                >
                  Add your first certification
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <ProfileTabs
            posts={Array.isArray(posts) ? posts : []}
            discussions={Array.isArray(discussions) ? discussions : []}
            bookmarks={Array.isArray(bookmarks) ? bookmarks : []}
            isOwnProfile={isOwnProfile}
            onCreatePost={onNavigateToFeed}
          />
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-justice-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-aged-paper rounded-lg border border-constitution-gold/20 shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-2xl text-judge-ivory">
                  Edit Profile
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-constitution-gold/10 rounded"
                  type="button"
                >
                  <X className="w-5 h-5 text-ink-gray" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={editForm.designation || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, designation: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={editForm.organization || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, organization: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                  />
                </div>

                {["LAWYER", "JUDGE", "ADVOCATE"].includes(editForm.role) && (
                  <div>
                    <label className="block text-sm font-medium text-ink-gray mb-2">
                      Bar Council Number *
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
                      className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                      placeholder="Required for your role"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
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
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={editForm.websiteUrl || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, websiteUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={editForm.linkedinUrl || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, linkedinUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90"
                  type="button"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Certification Modal */}
      {showAddCertModal && (
        <div className="fixed inset-0 bg-justice-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-aged-paper rounded-lg border border-constitution-gold/20 shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-2xl text-judge-ivory">
                  Add Certification
                </h2>
                <button
                  onClick={() => setShowAddCertModal(false)}
                  className="p-2 hover:bg-constitution-gold/10 rounded"
                  type="button"
                >
                  <X className="w-5 h-5 text-ink-gray" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newCert.title}
                    onChange={(e) =>
                      setNewCert({ ...newCert, title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                    placeholder="e.g., Certified Legal Specialist"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Issuing Organization *
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
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                    placeholder="e.g., National Bar Association"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    value={newCert.credentialId}
                    onChange={(e) =>
                      setNewCert({ ...newCert, credentialId: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                    placeholder="Optional"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-gray mb-2">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      value={newCert.issueDate}
                      onChange={(e) =>
                        setNewCert({ ...newCert, issueDate: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-gray mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={newCert.expiryDate}
                      onChange={(e) =>
                        setNewCert({ ...newCert, expiryDate: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Certificate File
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) =>
                        setCertificateFile(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                      className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                    />
                    {certificateFile && (
                      <span className="text-sm text-ink-gray">
                        {certificateFile.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-gray/60 mt-1">
                    Upload PDF or image of your certificate (optional)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCert.description}
                    onChange={(e) =>
                      setNewCert({ ...newCert, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                    placeholder="Brief description of the certification"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-gray mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={newCert.tags}
                    onChange={(e) =>
                      setNewCert({ ...newCert, tags: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-justice-black border border-constitution-gold/20 rounded-lg text-judge-ivory focus:outline-none focus:border-constitution-gold/50"
                    placeholder="Comma separated, e.g., litigation, corporate law, ethics"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowAddCertModal(false)}
                  className="px-4 py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCertification}
                  disabled={uploadingCert}
                  className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {uploadingCert ? "Uploading..." : "Add Certification"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}