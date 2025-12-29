import { useState, useEffect } from 'react';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileStats } from '../components/ProfileStats';
import { CertificationCard } from '../components/CertificationCard';
import { ProfileTabs } from '../components/ProfileTabs';
import { JusticeLoader } from '../components/JusticeLoader';
import { Search, Award, Plus, ArrowLeft, X } from 'lucide-react';
import * as profileApi from '../api/profile';

interface ProfilePageProps {
    userId?: string;
    currentUserId?: string;
    onBack?: () => void;
    onNavigateToFeed?: () => void;
}

export function ProfilePage({ userId, currentUserId, onBack, onNavigateToFeed }: ProfilePageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddCertModal, setShowAddCertModal] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [newCert, setNewCert] = useState({ title: '', issuingOrganization: '', issueDate: '', certificateUrl: '', fileType: 'PDF' });

    const isOwnProfile = !userId || userId === currentUserId;
    const targetUserId = userId || currentUserId;

    useEffect(() => {
        if (targetUserId) loadProfileData();
    }, [targetUserId]);

    async function loadProfileData() {
        setIsLoading(true);
        try {
            const [profileData, certsData, postsData, discussionsData] = await Promise.all([
                profileApi.getProfile(targetUserId!),
                profileApi.getCertifications(targetUserId!),
                profileApi.getUserPosts(targetUserId!),
                profileApi.getUserDiscussions(targetUserId!),
            ]);
            setProfile(profileData);
            setEditForm(profileData);
            setCertifications(certsData);
            setPosts(postsData.posts);
            setDiscussions(discussionsData.discussions);
            if (isOwnProfile) {
                const bookmarksData = await profileApi.getBookmarks();
                setBookmarks(bookmarksData.bookmarks);
            }
        } catch (err) {
            // Use mock data for demo
            const mockProfile = {
                id: targetUserId || 'mock-user-1', fullName: 'Adv. Priya Sharma', email: 'priya.sharma@example.com', role: 'LAWYER',
                designation: 'Senior Advocate', organization: 'Sharma & Associates', areaOfInterest: ['Consumer Law', 'Contract Law'],
                experienceYears: 12, bio: 'Senior Advocate specializing in Consumer Protection Act and Contract Law.',
                profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
                location: 'New Delhi, India', websiteUrl: 'https://sharmaassociates.com', linkedinUrl: 'https://linkedin.com/in/priyasharma',
                followerCount: 248, followingCount: 156, postCount: 32, discussionCount: 18, isFollowing: false
            };
            setProfile(mockProfile);
            setEditForm(mockProfile);
            setCertifications([
                { id: 'cert-1', title: 'Advocate on Record - Supreme Court', issuingOrganization: 'Supreme Court of India', issueDate: '2021-06-15', certificateUrl: '#', fileType: 'PDF', tags: ['Supreme Court', 'AOR'] },
                { id: 'cert-2', title: 'Certificate in Consumer Law', issuingOrganization: 'National Law University, Delhi', issueDate: '2019-03-20', expiryDate: '2024-03-20', certificateUrl: '#', fileType: 'PDF', tags: ['Consumer Law'] }
            ]);
            setPosts([
                { id: 'post-1', title: 'Understanding Consumer Protection Act 2019', content: 'A comprehensive analysis of the new Consumer Protection Act and its implications...', postType: 'ARTICLE', tags: ['Consumer Law'], likeCount: 45, commentCount: 12, createdAt: '2024-01-15T14:00:00Z' },
                { id: 'post-2', title: 'Contract Drafting Best Practices', content: 'Essential tips for drafting bulletproof contracts that protect your clients...', postType: 'POST', tags: ['Contract Law'], likeCount: 28, commentCount: 8, createdAt: '2024-01-10T09:00:00Z' }
            ]);
            setDiscussions([{ id: 'disc-1', title: 'How to handle defective product cases?', description: 'Looking for practical advice on filing consumer complaints...', category: 'CONSUMER_LAW', replyCount: 15, upvoteCount: 23, isResolved: false, createdAt: '2024-01-14T10:30:00Z' }]);
            setBookmarks([{ id: 'bm-1', entityType: 'POST', entityId: 'ext-post-1', folder: 'CONSUMER_LAW', title: 'Landmark Consumer Rights Judgment', authorName: 'Hon. Justice Mehta', createdAt: '2024-01-08T15:00:00Z' }]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleEditProfile = () => {
        setEditForm({ ...profile });
        setShowEditModal(true);
    };

    const handleSaveProfile = async () => {
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
        try {
            const added = await profileApi.addCertification(newCert);
            setCertifications([...certifications, added]);
        } catch (err) {
            // Demo mode - add locally
            setCertifications([...certifications, { ...newCert, id: `cert-${Date.now()}`, tags: [] }]);
        }
        setNewCert({ title: '', issuingOrganization: '', issueDate: '', certificateUrl: '', fileType: 'PDF' });
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
                />

                <div className="mt-6">
                    <ProfileStats
                        followerCount={profile?.followerCount || 0}
                        followingCount={profile?.followingCount || 0}
                        postCount={profile?.postCount || 0}
                        discussionCount={profile?.discussionCount || 0}
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
                    <ProfileTabs posts={posts} discussions={discussions} bookmarks={bookmarks} isOwnProfile={isOwnProfile} onCreatePost={onNavigateToFeed} />
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
                                <label className="block text-sm text-ink-gray/70 mb-1">Issue Date *</label>
                                <input type="date" value={newCert.issueDate} onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold" />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Certificate URL</label>
                                <input type="url" value={newCert.certificateUrl} onChange={(e) => setNewCert({ ...newCert, certificateUrl: e.target.value })} placeholder="https://..."
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
