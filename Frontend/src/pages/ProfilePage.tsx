// [file name]: ProfilePage.tsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ProfileHeader } from "../components/Profile/ProfileHeader";
import { ProfileStats } from "../components/Profile/ProfileStats";
import { CertificationCard } from "../components/CertificationCard";
import { ProfileTabs } from "../components/Profile/ProfileTabs";
import { JusticeLoader } from "../components/JusticeLoader";
import { Search, Award, Plus, ArrowLeft, X, User, Bell } from "lucide-react";
import * as profileApi from "../api/profileAPI";

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

  // ---- Connection Requests State ----
  const [connectionStatus, setConnectionStatus] = useState<'NONE' | 'PENDING' | 'CONNECTED' | 'REQUEST_SENT'>('NONE');
  const [connectionRequestId, setConnectionRequestId] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showConnectionRequestsModal, setShowConnectionRequestsModal] = useState<boolean>(false);
  const notificationCount = pendingRequests.length;

  // State for message modal
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");

  // Ref for message textarea to auto-focus
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isOwnProfile =
    userId == null ||
    userId === "" ||
    (currentUserId != null && userId === currentUserId);
  const targetUserId = userId || currentUserId;

  useEffect(() => {
    if (showMessageModal && messageTextareaRef.current) {
      messageTextareaRef.current.focus();
    }
  }, [showMessageModal]);

  // Load connection status for other users
  const loadConnectionStatus = useCallback(async () => {
    if (!isOwnProfile && targetUserId) {
      try {
        const status = await profileApi.getConnectionStatus(targetUserId);
        setConnectionStatus(status.status || 'NONE');
        if (status.requestId) setConnectionRequestId(status.requestId);
      } catch (err) {
        console.error('Failed to load connection status:', err);
        setConnectionStatus('NONE');
      }
    }
  }, [isOwnProfile, targetUserId]);

  // Load pending connection requests for own profile
  const loadPendingRequests = useCallback(async () => {
    if (isOwnProfile) {
      try {
        const requests = await profileApi.getPendingConnectionRequests();
        setPendingRequests(requests || []);
      } catch (err) {
        console.error('Failed to load pending requests:', err);
        setPendingRequests([]);
      }
    }
  }, [isOwnProfile]);

  useEffect(() => {
    if (targetUserId) {
      loadProfileData();
      loadConnectionStatus();
      if (isOwnProfile) {
        loadPendingRequests();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

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

  const handleEditProfile = () => {
    setEditForm({ ...profile });
    setShowEditModal(true);
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

  const handleConnect = async () => {
    if (!profile?.id) return;

    try {
      if (connectionStatus === 'NONE') {
        // Send connection request
        const result = await profileApi.sendConnectionRequest(profile.id);
        setConnectionStatus('REQUEST_SENT');
        if (result.requestId) {
          setConnectionRequestId(result.requestId);
        }
        alert('Connection request sent!');
      } else if (connectionStatus === 'REQUEST_SENT' && connectionRequestId) {
        // Cancel sent request
        await profileApi.cancelConnectionRequest(connectionRequestId);
        setConnectionStatus('NONE');
        setConnectionRequestId(null);
        alert('Connection request cancelled');
      } else if (connectionStatus === 'CONNECTED') {
        // Handle disconnection/removing connection
        if (window.confirm('Are you sure you want to remove this connection?')) {
          // Note: You'll need to implement a removeConnection API
          alert('Connection removed (implement removeConnection API)');
          setConnectionStatus('NONE');
        }
      }
    } catch (error) {
      console.error('Error handling connection request:', error);
      alert('Failed to process connection request');
    }
  };

  // Accept a connection request
  const handleAcceptConnectionRequest = async (requestId: string) => {
    try {
      await profileApi.acceptFollowRequest(requestId);
      
      // Remove from local state
      setPendingRequests((prev) => {
        const next = prev.filter((r) => r.id !== requestId);
        if (next.length === 0) setShowConnectionRequestsModal(false);
        return next;
      });
      
      // Update follower count
      setProfile((prev: any) => {
        if (!prev) return prev;
        const followerCount = Math.max(0, Number(prev.followerCount) || 0);
        return { ...prev, followerCount: followerCount + 1 };
      });
      
      alert('Connection request accepted!');
    } catch (error) {
      console.error('Error accepting connection request:', error);
      alert('Failed to accept connection request');
    }
  };

  // Reject a connection request
  const handleRejectConnectionRequest = async (requestId: string) => {
    try {
      await profileApi.rejectFollowRequest(requestId);
      
      // Remove from local state
      setPendingRequests((prev) => {
        const next = prev.filter((r) => r.id !== requestId);
        if (next.length === 0) setShowConnectionRequestsModal(false);
        return next;
      });
      
      alert('Connection request rejected');
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      alert('Failed to reject connection request');
    }
  };

  const handleMessage = () => {
    setShowMessageModal(true);
    setMessageText("");
  };

  const handleSendMessage = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    const fullName = profile?.fullName ?? "user";
    const profileId = profile?.id ?? "";
    // eslint-disable-next-line no-console
    console.log(`Send message to ${fullName} (${profileId}):`, trimmed);
    setShowMessageModal(false);
    setMessageText("");
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

  const handleViewConnectionRequests = useCallback(() => {
    setShowConnectionRequestsModal(true);
  }, []);

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

        {/* Profile Header with Notification Badge */}
        <div className="relative">
          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            onEditProfile={handleEditProfile}
            onConnect={!isOwnProfile ? handleConnect : undefined}
            onMessage={!isOwnProfile ? handleMessage : undefined}
            onPhotoUpdate={handlePhotoUpdate}
            connectionStatus={connectionStatus}
            notificationCount={isOwnProfile ? notificationCount : 0}
            onViewNotifications={isOwnProfile ? handleViewConnectionRequests : undefined}
          />
          {isOwnProfile && notificationCount > 0 && (
            <button
              aria-label={`View ${notificationCount} connection request${notificationCount === 1 ? '' : 's'}`}
              onClick={() => setShowConnectionRequestsModal(true)}
              type="button"
              className="absolute top-2 right-2 z-10 flex items-center p-0 bg-transparent border-none shadow-none hover:bg-transparent transition focus:outline-none"
              style={{boxShadow: "none"}}
            >
              <span className="relative inline-block">
                <Bell className="w-7 h-7 text-constitution-gold" />
                {notificationCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-xs text-white w-5 h-5 font-bold border-2 border-justice-black shadow"
                    style={{minWidth: 18, minHeight: 18, fontSize: "0.75rem"}}
                  >
                    {notificationCount}
                  </span>
                )}
              </span>
            </button>
          )}
        </div>

        {/* Connection Requests Modal */}
        {isOwnProfile && showConnectionRequestsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-justice-black/80 p-4">
            <div className="aged-paper rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-constitution-gold/20 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-constitution-gold/20">
                <h2 className="font-heading font-bold text-ink-gray text-xl flex items-center gap-2">
                  <User className="w-5 h-5 text-constitution-gold" />
                  Connection Requests
                  {notificationCount > 0 && (
                    <span className="relative ml-2">
                      <span
                        className="absolute -top-2 -right-3 flex items-center justify-center rounded-full bg-red-500 text-xs text-white w-5 h-5 font-bold border-2 border-judge-ivory"
                        style={{minWidth: 18, minHeight: 18, fontSize: "0.75rem"}}
                      >
                        {notificationCount}
                      </span>
                      <span className="opacity-0">
                        &nbsp;{notificationCount}
                      </span>
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setShowConnectionRequestsModal(false)}
                  className="p-1 hover:bg-constitution-gold/10 rounded"
                  type="button"
                >
                  <X className="w-5 h-5 text-ink-gray" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {notificationCount === 0 ? (
                  <div className="text-center text-ink-gray/60 py-12">
                    No pending connection requests.
                  </div>
                ) : (
                  pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center gap-4 px-2 py-3 border-b border-constitution-gold/10 last:border-none"
                    >
                      <div className="flex-shrink-0">
                        {req.user?.profilePhotoUrl ? (
                          <img
                            alt={req.user.fullName}
                            src={req.user.profilePhotoUrl}
                            className="w-10 h-10 rounded-full object-cover border border-constitution-gold/30"
                          />
                        ) : (
                          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-constitution-gold/20 text-constitution-gold font-semibold text-xl border border-constitution-gold/30">
                            {req.user?.fullName?.[0] ?? "?"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-ink-gray text-base">{req.user?.fullName}</div>
                        {req.user?.designation && (
                          <div className="text-sm text-ink-gray/60">{req.user.designation}</div>
                        )}
                        {req.user?.organization && (
                          <div className="text-sm text-ink-gray/60">{req.user.organization}</div>
                        )}
                        {req.requestMessage && (
                          <div className="mt-1 text-sm text-ink-gray/70 italic">
                            "{req.requestMessage}"
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-2">
                        <button
                          onClick={() => handleAcceptConnectionRequest(req.id)}
                          className="px-3 py-1 bg-constitution-gold text-justice-black rounded text-xs font-medium hover:bg-constitution-gold/80"
                          type="button"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectConnectionRequest(req.id)}
                          className="px-3 py-1 border border-constitution-gold/30 text-constitution-gold rounded text-xs font-medium hover:bg-constitution-gold/5"
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Message button for other users only */}
        {!isOwnProfile && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleMessage}
              className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90"
              type="button"
            >
              Message
            </button>
          </div>
        )}

        {/* Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-justice-black/80 p-4">
            <div className="aged-paper rounded-lg w-full max-w-lg">
              <div className="flex items-center justify-between p-4 border-b border-constitution-gold/20">
                <h2 className="font-heading font-bold text-ink-gray text-xl">
                  Send Message
                </h2>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-1 hover:bg-constitution-gold/10 rounded"
                  type="button"
                >
                  <X className="w-5 h-5 text-ink-gray" />
                </button>
              </div>
              <div className="p-4">
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Message to{" "}
                  {profile?.fullName ?? "user"}
                </label>
                <textarea
                  ref={messageTextareaRef}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-constitution-gold/20">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90"
                  disabled={!messageText.trim()}
                  type="button"
                >
                  Send
                </button>
              </div>
            </div>
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
          <div className="aged-paper rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-constitution-gold/20">
              <h2 className="font-heading font-bold text-ink-gray text-xl">
                Edit Profile
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-constitution-gold/10 rounded"
                type="button"
              >
                <X className="w-5 h-5 text-ink-gray" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullName || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={editForm.designation || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      designation: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={editForm.organization || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      organization: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Bio
                </label>
                <textarea
                  value={editForm.bio || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      bio: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={editForm.websiteUrl || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      websiteUrl: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={editForm.linkedinUrl || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      linkedinUrl: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Area of Interest
                </label>
                <input
                  type="text"
                  value={
                    editForm._areaOfInterestString ??
                    (Array.isArray(editForm.areaOfInterest)
                      ? editForm.areaOfInterest.join(", ")
                      : "")
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditForm({
                      ...editForm,
                      _areaOfInterestString: val,
                      areaOfInterest: val
                        .split(",")
                        .map((s: string) => s.trim())
                        .filter((s: string) => s),
                    });
                  }}
                  placeholder="e.g., Constitutional Law, Criminal Law, Corporate Law"
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
                <p className="text-xs text-ink-gray/50 mt-1">
                  Separate multiple interests with commas
                </p>
              </div>
              {/* Bar Council Number - Required for LAWYER, JUDGE, ADVOCATE */}
              {["LAWYER", "JUDGE", "ADVOCATE"].includes(
                profile?.role ?? ""
              ) && (
                <div>
                  <label className="block text-sm text-ink-gray/70 mb-1">
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
                    placeholder="Enter your Bar Council Registration Number"
                    required
                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                  />
                </div>
              )}
              {(profile?.role ?? editForm.role) !== "LAW_STUDENT" && (
                <div>
                  <label className="block text-sm text-ink-gray/70 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.experienceYears || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        experienceYears:
                          parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-constitution-gold/20">
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
      )}

      {/* Add Certification Modal */}
      {showAddCertModal && (
        <div className="fixed inset-0 bg-justice-black/80 flex items-center justify-center z-50 p-4">
          <div className="aged-paper rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-constitution-gold/20">
              <h2 className="font-heading font-bold text-ink-gray text-xl">
                Add Certification
              </h2>
              <button
                onClick={() => setShowAddCertModal(false)}
                className="p-1 hover:bg-constitution-gold/10 rounded"
                type="button"
              >
                <X className="w-5 h-5 text-ink-gray" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Certification Title *
                </label>
                <input
                  type="text"
                  value={newCert.title}
                  onChange={(e) =>
                    setNewCert({
                      ...newCert,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Advocate on Record"
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
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
                  placeholder="e.g., Supreme Court of India"
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Credential ID
                </label>
                <input
                  type="text"
                  value={newCert.credentialId}
                  onChange={(e) =>
                    setNewCert({
                      ...newCert,
                      credentialId: e.target.value,
                    })
                  }
                  placeholder="e.g., AOR-2024-123"
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ink-gray/70 mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    value={newCert.issueDate}
                    onChange={(e) =>
                      setNewCert({
                        ...newCert,
                        issueDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink-gray/70 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newCert.expiryDate}
                    onChange={(e) =>
                      setNewCert({
                        ...newCert,
                        expiryDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Certificate File (PDF or Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) =>
                    setCertificateFile(
                      e.target.files?.[0] || null
                    )
                  }
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-constitution-gold/10 file:text-constitution-gold file:cursor-pointer"
                />
                {certificateFile && (
                  <p className="mt-1 text-sm text-constitution-gold">
                    Selected: {certificateFile.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Description
                </label>
                <textarea
                  value={newCert.description}
                  onChange={(e) =>
                    setNewCert({
                      ...newCert,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of the certification"
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-gray/70 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newCert.tags}
                  onChange={(e) =>
                    setNewCert({
                      ...newCert,
                      tags: e.target.value,
                    })
                  }
                  placeholder="e.g., Constitutional Law, Litigation, Supreme Court"
                  className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-constitution-gold/20">
              <button
                onClick={() => setShowAddCertModal(false)}
                className="px-4 py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCertification}
                className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90"
                type="button"
              >
                Add Certification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}