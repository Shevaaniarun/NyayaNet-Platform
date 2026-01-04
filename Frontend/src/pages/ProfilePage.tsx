import { useState, useEffect } from 'react';
import { ProfileHeader } from '../components/Profile/ProfileHeader';
import { ProfileStats } from '../components/Profile/ProfileStats';
import { CertificationCard } from '../components/CertificationCard';
import { ProfileTabs } from '../components/Profile/ProfileTabs';
import { JusticeLoader } from '../components/JusticeLoader';
import { Search, Award, Plus, ArrowLeft, X } from 'lucide-react';
import * as profileApi from '../api/profileAPI';

interface ProfilePageProps {
    userId?: string;
    currentUserId?: string;
    onBack?: () => void;
    onNavigateToFeed?: () => void;
    onNavigateToDiscussion?: (discussionId: string) => void;
}

export function ProfilePage({ userId, currentUserId, onBack, onNavigateToFeed, onNavigateToDiscussion }: ProfilePageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [likedPosts, setLikedPosts] = useState<any[]>([]);
    const [likedDiscussions, setLikedDiscussions] = useState<any[]>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddCertModal, setShowAddCertModal] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [newCert, setNewCert] = useState({ title: '', issuingOrganization: '', credentialId: '', issueDate: '', expiryDate: '', certificateUrl: '', fileType: 'PDF', description: '', tags: '' });
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [uploadingCert, setUploadingCert] = useState(false);

    const isOwnProfile = !userId || userId === currentUserId;
    const targetUserId = userId || currentUserId;

    useEffect(() => {
        console.log('ProfilePage: currentUserId =', currentUserId, ', targetUserId =', targetUserId);
        if (targetUserId) loadProfileData();
    }, [targetUserId]);

    async function loadProfileData() {
        setIsLoading(true);

        // Load profile first - this is required
        let profileData = null;
        try {
            profileData = await profileApi.getProfile(targetUserId!);
            console.log('Profile loaded:', profileData?.fullName);
            setProfile(profileData);
            setEditForm(profileData);
        } catch (err: any) {
            console.error('Failed to load profile:', err);
            // Show empty profile as fallback
            const emptyProfile = {
                id: targetUserId || '',
                fullName: 'New User',
                email: '',
                role: 'USER',
                designation: null,
                organization: null,
                areaOfInterest: [],
                experienceYears: 0,
                bio: 'Welcome! Edit your profile to add your information.',
                profilePhotoUrl: null,
                location: null,
                websiteUrl: null,
                linkedinUrl: null,
                followerCount: 0,
                followingCount: 0,
                postCount: 0,
                discussionCount: 0,
                isFollowing: false
            };
            setProfile(emptyProfile);
            setEditForm(emptyProfile);
        }

        // Load other data separately - failures shouldn't break profile loading
        try {
            const certsData = await profileApi.getCertifications(targetUserId!);
            setCertifications(certsData || []);
        } catch (e) {
            console.log('Certifications not available');
            setCertifications([]);
        }

        try {
            const postsData = await profileApi.getUserPosts(targetUserId!);
            setPosts(postsData?.posts || []);
        } catch (e) {
            console.log('Posts not available');
            setPosts([]);
        }

        try {
            const discussionsData = await profileApi.getUserDiscussions(targetUserId!);
            setDiscussions(discussionsData?.discussions || []);
        } catch (e) {
            console.log('Discussions not available');
            setDiscussions([]);
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
        }

        setIsLoading(false);
    }

    const handleEditProfile = () => {
        setEditForm({ ...profile });
        setShowEditModal(true);
    };

    const handleSaveProfile = async () => {
        // Validate required fields
        if (['LAWYER', 'JUDGE', 'ADVOCATE'].includes(profile?.role) && !editForm.barCouncilNumber?.trim()) {
            alert('Bar Council Number is required for your role');
            return;
        }

        try {
            await profileApi.updateProfile(editForm);
            setProfile({ ...profile, ...editForm });
            setShowEditModal(false);
            alert('Profile updated successfully!');
        } catch (err) {
            // Demo mode - just update locally
            setProfile({ ...profile, ...editForm });
            setShowEditModal(false);
            alert('Profile updated successfully!');
        }
    };

    const handleFollow = () => {
        setProfile({ ...profile, isFollowing: !profile.isFollowing, followerCount: profile.isFollowing ? profile.followerCount - 1 : profile.followerCount + 1 });
    };

    const handleMessage = () => {
        alert(`Message feature coming soon! Would message ${profile.fullName}`);
    };

    const handlePhotoUpdate = async (type: 'profile' | 'cover', file: File, previewUrl: string) => {
        try {
            if (type === 'profile') {
                const result = await profileApi.uploadProfilePhoto(file);
                setProfile({ ...profile, profilePhotoUrl: result.profilePhotoUrl });
            } else {
                const result = await profileApi.uploadCoverPhoto(file);
                setProfile({ ...profile, coverPhotoUrl: result.coverPhotoUrl });
            }
        } catch (err) {
            console.error('Photo upload failed:', err);
            // Use local preview as fallback
            if (type === 'profile') {
                setProfile({ ...profile, profilePhotoUrl: previewUrl });
            } else {
                setProfile({ ...profile, coverPhotoUrl: previewUrl });
            }
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const results = await profileApi.searchUserContent(searchQuery);
            if (results.results) {
                setPosts(results.results.posts || []);
                setDiscussions(results.results.discussions || []);
            }
        } catch (err) {
            // Demo: filter locally
            const q = searchQuery.toLowerCase();
            setPosts(prev => prev.filter(p => p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q)));
            setDiscussions(prev => prev.filter(d => d.title?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)));
        }
    };

    const handleDeleteCertification = async (certId: string) => {
        if (!confirm('Are you sure you want to delete this certification?')) return;
        try {
            await profileApi.deleteCertification(certId);
        } catch (err) {
            // Demo mode - continue
        }
        setCertifications(certs => certs.filter(c => c.id !== certId));
    };

    const handleAddCertification = async () => {
        if (!newCert.title || !newCert.issuingOrganization || !newCert.issueDate) {
            alert('Please fill in required fields');
            return;
        }

        let certificateUrl = newCert.certificateUrl;
        let fileType = newCert.fileType;

        // Upload certificate file if selected
        if (certificateFile) {
            setUploadingCert(true);
            try {
                const uploadResult = await profileApi.uploadCertificateFile(certificateFile);
                certificateUrl = uploadResult.certificateUrl;
                fileType = uploadResult.fileType;
            } catch (err) {
                alert('Failed to upload certificate file');
                setUploadingCert(false);
                return;
            }
            setUploadingCert(false);
        }

        const certData = {
            ...newCert,
            certificateUrl,
            fileType,
            tags: newCert.tags ? newCert.tags.split(',').map(t => t.trim()).filter(t => t) : []
        };
        try {
            const added = await profileApi.addCertification(certData);
            setCertifications([...certifications, added]);
        } catch (err) {
            // Demo mode - add locally
            setCertifications([...certifications, { ...certData, id: `cert-${Date.now()}` }]);
        }
        setNewCert({ title: '', issuingOrganization: '', credentialId: '', issueDate: '', expiryDate: '', certificateUrl: '', fileType: 'PDF', description: '', tags: '' });
        setCertificateFile(null);
        setShowAddCertModal(false);
    };

    if (isLoading) return <JusticeLoader />;

    return (
        <div className="min-h-screen bg-justice-black p-8">
            <div className="max-w-5xl mx-auto">
                {onBack && (
                    <button onClick={onBack} className="flex items-center gap-2 text-constitution-gold hover:text-constitution-gold/80 mb-6 transition-colors">
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
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-24 py-3 bg-aged-paper border border-constitution-gold/20 rounded-lg text-ink-gray placeholder-ink-gray/50 focus:outline-none focus:border-constitution-gold/50"
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-constitution-gold text-justice-black rounded font-medium text-sm hover:bg-constitution-gold/90"
                        >
                            Search
                        </button>
                    </div>
                </div>

                <ProfileHeader
                    profile={profile}
                    isOwnProfile={isOwnProfile}
                    onEditProfile={handleEditProfile}
                    onFollow={handleFollow}
                    onMessage={handleMessage}
                    onPhotoUpdate={handlePhotoUpdate}
                />

                <div className="mt-6">
                    <ProfileStats
                        followerCount={profile?.followerCount || 0}
                        followingCount={profile?.followingCount || 0}
                        postCount={posts.length}
                        discussionCount={discussions.length}
                    />
                </div>

                {/* Certifications Section */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-constitution-gold" />
                            <h2 className="font-heading font-bold text-judge-ivory">Certifications & Qualifications</h2>
                        </div>
                        {isOwnProfile && (
                            <button
                                onClick={() => setShowAddCertModal(true)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-constitution-gold text-justice-black rounded-lg font-medium text-sm hover:bg-constitution-gold/90"
                            >
                                <Plus className="w-4 h-4" />Add Certification
                            </button>
                        )}
                    </div>
                    {certifications.length > 0 ? (
                        <div className="space-y-3">
                            {certifications.map((cert) => (
                                <CertificationCard key={cert.id} certification={cert} isOwnProfile={isOwnProfile} onDelete={handleDeleteCertification} />
                            ))}
                        </div>
                    ) : (
                        <div className="aged-paper rounded-lg p-8 text-center border border-constitution-gold/20">
                            <Award className="w-12 h-12 text-ink-gray/30 mx-auto mb-3" />
                            <p className="text-ink-gray/60">No certifications added yet</p>
                            {isOwnProfile && (
                                <button onClick={() => setShowAddCertModal(true)} className="mt-3 text-constitution-gold hover:underline text-sm">
                                    Add your first certification
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <ProfileTabs
                        posts={posts}
                        discussions={discussions}
                        bookmarks={bookmarks}
                        likedPosts={likedPosts}
                        likedDiscussions={likedDiscussions}
                        isOwnProfile={isOwnProfile}
                        onCreatePost={onNavigateToFeed}
                        onPostClick={(postId) => {
                            // Navigate to feed - could scroll to post
                            if (onNavigateToFeed) onNavigateToFeed();
                        }}
                        onDiscussionClick={(discussionId) => {
                            if (onNavigateToDiscussion) onNavigateToDiscussion(discussionId);
                        }}
                    />
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-justice-black/80 flex items-center justify-center z-50 p-4">
                    <div className="aged-paper rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-constitution-gold/20">
                            <h2 className="font-heading font-bold text-ink-gray text-xl">Edit Profile</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-constitution-gold/10 rounded">
                                <X className="w-5 h-5 text-ink-gray" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Full Name</label>
                                <input type="text" value={editForm.fullName || ''} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Designation</label>
                                <input type="text" value={editForm.designation || ''} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Organization</label>
                                <input type="text" value={editForm.organization || ''} onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Location</label>
                                <input type="text" value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Bio</label>
                                <textarea value={editForm.bio || ''} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Website URL</label>
                                <input type="url" value={editForm.websiteUrl || ''} onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">LinkedIn URL</label>
                                <input type="url" value={editForm.linkedinUrl || ''} onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Area of Interest</label>
                                <input type="text" value={editForm._areaOfInterestString ?? (editForm.areaOfInterest || []).join(', ')}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setEditForm({
                                            ...editForm,
                                            _areaOfInterestString: val,
                                            areaOfInterest: val.split(',').map((s: string) => s.trim()).filter((s: string) => s)
                                        });
                                    }}
                                    placeholder="e.g., Constitutional Law, Criminal Law, Corporate Law"
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                                <p className="text-xs text-ink-gray/50 mt-1">Separate multiple interests with commas</p>
                            </div>
                            {/* Bar Council Number - Required for LAWYER, JUDGE, ADVOCATE */}
                            {['LAWYER', 'JUDGE', 'ADVOCATE'].includes(profile?.role) && (
                                <div>
                                    <label className="block text-sm text-ink-gray/70 mb-1">Bar Council Number *</label>
                                    <input type="text" value={editForm.barCouncilNumber || ''} onChange={(e) => setEditForm({ ...editForm, barCouncilNumber: e.target.value })}
                                        placeholder="Enter your Bar Council Registration Number"
                                        required
                                        className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                                </div>
                            )}
                            {/* Experience Years - Not shown for students */}
                            {profile?.role !== 'LAW_STUDENT' && (
                                <div>
                                    <label className="block text-sm text-ink-gray/70 mb-1">Years of Experience</label>
                                    <input type="number" min="0" value={editForm.experienceYears || 0} onChange={(e) => setEditForm({ ...editForm, experienceYears: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t border-constitution-gold/20">
                            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5">
                                Cancel
                            </button>
                            <button onClick={handleSaveProfile} className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90">
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
                            <h2 className="font-heading font-bold text-ink-gray text-xl">Add Certification</h2>
                            <button onClick={() => setShowAddCertModal(false)} className="p-1 hover:bg-constitution-gold/10 rounded">
                                <X className="w-5 h-5 text-ink-gray" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Certification Title *</label>
                                <input type="text" value={newCert.title} onChange={(e) => setNewCert({ ...newCert, title: e.target.value })} placeholder="e.g., Advocate on Record"
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Issuing Organization *</label>
                                <input type="text" value={newCert.issuingOrganization} onChange={(e) => setNewCert({ ...newCert, issuingOrganization: e.target.value })} placeholder="e.g., Supreme Court of India"
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Credential ID</label>
                                <input type="text" value={newCert.credentialId} onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })} placeholder="e.g., AOR-2024-123"
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-ink-gray/70 mb-1">Issue Date *</label>
                                    <input type="date" value={newCert.issueDate} onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                                </div>
                                <div>
                                    <label className="block text-sm text-ink-gray/70 mb-1">Expiry Date</label>
                                    <input type="date" value={newCert.expiryDate} onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Certificate File (PDF or Image)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-constitution-gold/10 file:text-constitution-gold file:cursor-pointer"
                                />
                                {certificateFile && (
                                    <p className="mt-1 text-sm text-constitution-gold">Selected: {certificateFile.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Description</label>
                                <textarea value={newCert.description} onChange={(e) => setNewCert({ ...newCert, description: e.target.value })} placeholder="Brief description of the certification" rows={2}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Tags (comma-separated)</label>
                                <input type="text" value={newCert.tags} onChange={(e) => setNewCert({ ...newCert, tags: e.target.value })} placeholder="e.g., Constitutional Law, Litigation, Supreme Court"
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t border-constitution-gold/20">
                            <button onClick={() => setShowAddCertModal(false)} className="px-4 py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5">
                                Cancel
                            </button>
                            <button onClick={handleAddCertification} className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90">
                                Add Certification
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
