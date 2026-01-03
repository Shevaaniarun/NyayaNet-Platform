import React, { useEffect, useState, useCallback, useRef, useContext, createContext } from 'react';
import {
    Pencil, Share2, MapPin, Briefcase, Building2, Globe, Linkedin, UserPlus, MessageSquare,
    UserCheck, Camera, X, Upload, UserMinus
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

// ---- Replace react-router-dom with direct parsing of URL for parameters ----
function getProfileRouteParams() {
    if (typeof window === "undefined" || !window.location) {
        return { username: undefined, id: undefined };
    }
    const path = window.location.pathname || "";
    const parts = path.split('/').filter(Boolean);
    let username, id;
    const profileIdx = parts.indexOf('profile');
    if (profileIdx !== -1 && parts.length > profileIdx + 1) {
        const val = parts[profileIdx + 1];
        if (val && (/^\d+$/.test(val) || /^[a-zA-Z0-9._-]+$/.test(val))) {
            username = val;
            id = val;
        }
    }
    return { username, id };
}

interface ProfileHeaderProps {
    profile: {
        id: string;
        fullName: string;
        email: string;
        role: string;
        designation?: string;
        organization?: string;
        areaOfInterest: string[];
        barCouncilNumber?: string;
        experienceYears: number;
        bio?: string;
        profilePhotoUrl?: string;
        coverPhotoUrl?: string;
        location?: string;
        websiteUrl?: string;
        linkedinUrl?: string;
        followerCount: number;
        followingCount: number;
        postCount: number;
        discussionCount: number;
        isFollowing?: boolean;
        username?: string;
        isConnectionPending?: boolean;
        isConnected?: boolean;
        connectionStatus?: "none" | "pending" | "connected";
    };
    isOwnProfile: boolean;
    onEditProfile?: () => void;
    onFollow?: (profileId: string) => void;
    onConnect?: (profileId: string) => void;
    onMessage?: (profileId: string) => void; // Accepts profileId now
    onPhotoUpdate?: (type: 'profile' | 'cover', file: File, previewUrl: string) => void;
}

const roleLabels: Record<string, string> = {
    LAW_STUDENT: 'Law Student',
    LAWYER: 'Lawyer',
    JUDGE: 'Judge',
    LEGAL_PROFESSIONAL: 'Legal Professional',
    ADVOCATE: 'Advocate',
};

function QrCodeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="20"
            height="20"
            fill="none"
            aria-hidden="true"
            viewBox="0 0 24 24"
            {...props}
        >
            <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="14" width="3" height="3" rx="1" stroke="currentColor" strokeWidth="2" />
            <path d="M19 21v-2M21 19h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function getProfileUrl(profile: ProfileHeaderProps['profile']) {
    let origin = '';
    if (typeof window !== "undefined" && window.location && window.location.origin) {
        origin = window.location.origin;
    }
    const identifier = profile.username && profile.username.trim().length > 0
        ? profile.username
        : profile.id;
    return `${origin}/profile/${encodeURIComponent(identifier)}`;
}

// -----------------
// ProfileHeader with Social/Connection Actions
// -----------------
export function ProfileHeader({
    profile, isOwnProfile, onEditProfile, onFollow, onConnect, onMessage, onPhotoUpdate,
}: ProfileHeaderProps) {
    const [showPhotoModal, setShowPhotoModal] = useState<'profile' | 'cover' | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [localProfilePhoto, setLocalProfilePhoto] = useState<string | null>(null);
    const [localCoverPhoto, setLocalCoverPhoto] = useState<string | null>(null);
    const [showQrModal, setShowQrModal] = useState(false);

    // Minimal state for UI toggle
    const [isFollowing, setIsFollowing] = useState(!!profile.isFollowing);

    // ---- connectionStatus state ----
    const [connectionStatus, setConnectionStatus] = useState<"none" | "pending" | "connected">(
        profile.connectionStatus || "none"
    );

    useEffect(() => {
        setIsFollowing(!!profile.isFollowing);
    }, [profile.id, profile.isFollowing]);

    useEffect(() => {
        setConnectionStatus(profile.connectionStatus || "none");
    }, [profile.id, profile.connectionStatus]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const profileUrl = getProfileUrl(profile);

    // ===== SHARE/QR HANDLERS =====
    const handleShare = () => {
        const shareUrl = profileUrl;
        if (navigator.share) {
            navigator.share({
                title: `${profile.fullName}'s Profile - NyayaNet`,
                text: `Check out ${profile.fullName}'s profile on NyayaNet`,
                url: shareUrl,
            }).catch(() => {
                navigator.clipboard.writeText(shareUrl);
                alert('Profile link copied to clipboard!');
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Profile link copied to clipboard!');
        }
    };

    const handleQrShare = () => {
        const qrUrl = profileUrl;
        if (navigator.share) {
            navigator.share({
                title: `${profile.fullName}'s NyayaNet Profile`,
                text: `Scan this QR or tap the link to visit ${profile.fullName}'s profile on NyayaNet.\n${qrUrl}`,
                url: qrUrl
            }).catch(() => {
                navigator.clipboard.writeText(qrUrl);
                alert('Profile link copied to clipboard!');
            });
        } else {
            navigator.clipboard.writeText(qrUrl);
            alert('Profile link copied to clipboard!');
        }
    };

    const handleFollowButton = () => {
        if (typeof onFollow === 'function') {
            onFollow(profile.id);
        }
        setIsFollowing((prev) => !prev);
    };

    const handleConnectButton = () => {
        if (connectionStatus === "none") {
            if (typeof onConnect === "function") {
                onConnect(profile.id);
            }
            setConnectionStatus("pending");
        } else if (connectionStatus === "pending") {
            setConnectionStatus("none");
        }
    };

    // ===== Message Button Handler =====
    const handleMessageButton = () => {
        if (typeof onMessage === 'function') {
            onMessage(profile.id);
        }
    };

    // ===== PHOTO HANDLERS (unchanged) =====
    const openPhotoModal = (type: 'profile' | 'cover') => {
        if (!isOwnProfile) return;
        setShowPhotoModal(type);
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isOwnProfile) return;
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);
        setSelectedFile(file);
    };

    const handleUpload = () => {
        if (!isOwnProfile) return;
        if (!selectedFile || !previewUrl || !showPhotoModal) return;
        if (showPhotoModal === 'profile') {
            setLocalProfilePhoto(previewUrl);
        } else {
            setLocalCoverPhoto(previewUrl);
        }
        if (onPhotoUpdate) {
            onPhotoUpdate(showPhotoModal, selectedFile, previewUrl);
        }
        alert(`${showPhotoModal === 'profile' ? 'Profile' : 'Cover'} photo updated!`);
        setShowPhotoModal(null);
        setSelectedFile(null);
    };

    const closeModal = () => {
        if (previewUrl && !localProfilePhoto?.includes(previewUrl) && !localCoverPhoto?.includes(previewUrl)) {
            URL.revokeObjectURL(previewUrl);
        }
        setShowPhotoModal(null);
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    const displayProfilePhoto = localProfilePhoto || profile.profilePhotoUrl;
    const displayCoverPhoto = localCoverPhoto || profile.coverPhotoUrl;

    // --- RENDER ---
    return (
        <>
            <div className="aged-paper rounded-lg overflow-hidden border border-constitution-gold/20">
                {/* Cover Photo */}
                <div
                    className="h-48 bg-gradient-to-r from-constitution-gold/20 via-gavel-bronze/20 to-constitution-gold/20 relative"
                    style={displayCoverPhoto ? { backgroundImage: `url(${displayCoverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                    {isOwnProfile && (
                        <button
                            onClick={() => openPhotoModal('cover')}
                            className="absolute bottom-4 right-4 p-2 bg-justice-black/60 rounded-full hover:bg-justice-black/80 transition-colors flex items-center gap-1"
                            title="Change cover photo"
                            type="button"
                        >
                            <Camera className="w-4 h-4 text-constitution-gold" />
                            <span className="text-constitution-gold text-xs">Edit Cover</span>
                        </button>
                    )}

                    {/* Profile Photo section */}
                    <div className="absolute -bottom-16 left-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-aged-paper bg-justice-black overflow-hidden">
                                {displayProfilePhoto ? (
                                    <img src={displayProfilePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-constitution-gold/20 flex items-center justify-center">
                                        <span className="text-4xl font-heading text-constitution-gold">{profile.fullName.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            {isOwnProfile && (
                                <button
                                    onClick={() => openPhotoModal('profile')}
                                    className="absolute bottom-0 right-0 p-2 bg-constitution-gold rounded-full hover:bg-constitution-gold/90 transition-colors"
                                    title="Change profile photo"
                                    type="button"
                                >
                                    <Camera className="w-4 h-4 text-justice-black" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="pt-20 pb-6 px-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="font-heading font-bold text-ink-gray text-2xl mb-1">{profile.fullName}</h1>
                            <p className="text-constitution-gold font-medium mb-2">{roleLabels[profile.role] || profile.role}{profile.designation && ` • ${profile.designation}`}</p>
                            <div className="flex flex-wrap gap-4 text-ink-gray/70 text-sm">
                                {profile.organization && <div className="flex items-center gap-1"><Building2 className="w-4 h-4" /><span>{profile.organization}</span></div>}
                                {profile.location && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{profile.location}</span></div>}
                                {profile.experienceYears > 0 && <div className="flex items-center gap-1"><Briefcase className="w-4 h-4" /><span>{profile.experienceYears} years</span></div>}
                                {profile.barCouncilNumber && ['LAWYER', 'JUDGE', 'ADVOCATE'].includes(profile.role) && (
                                    <div className="flex items-center gap-1"><span className="text-constitution-gold">Bar Council:</span><span>{profile.barCouncilNumber}</span></div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {isOwnProfile ? (
                                <>
                                    <button onClick={onEditProfile} className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 transition-colors flex items-center gap-2">
                                        <Pencil className="w-4 h-4" />Edit Profile
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-2 border border-constitution-gold/30 rounded-lg hover:bg-constitution-gold/5 transition-colors"
                                        title="Share profile"
                                        type="button"
                                    >
                                        <Share2 className="w-5 h-5 text-constitution-gold" />
                                    </button>
                                    <button
                                        onClick={() => setShowQrModal(true)}
                                        aria-label="Show QR Code for profile"
                                        className="p-2 border border-constitution-gold/30 rounded-lg hover:bg-constitution-gold/5 transition-colors"
                                        title="Show QR code"
                                        type="button"
                                        style={{ lineHeight: 0 }}
                                    >
                                        <QrCodeIcon className="w-5 h-5 text-constitution-gold" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleFollowButton}
                                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors border ${isFollowing
                                            ? 'bg-constitution-gold/10 text-constitution-gold border-constitution-gold/30 hover:bg-constitution-gold/20'
                                            : 'bg-constitution-gold text-justice-black border-transparent hover:bg-constitution-gold/90'
                                            }`}
                                        type="button"
                                    >
                                        {isFollowing
                                            ? (<><UserCheck className="w-4 h-4" />Following</>)
                                            : (<><UserPlus className="w-4 h-4" />Follow</>)
                                        }
                                    </button>
                                    {(connectionStatus !== "connected") && (
                                        <button
                                            onClick={handleConnectButton}
                                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors border bg-constitution-gold text-justice-black border-transparent hover:bg-constitution-gold/90`}
                                            type="button"
                                        >
                                            {connectionStatus === "none" && (<>Connect</>)}
                                            {connectionStatus === "pending" && (<>Request Sent</>)}
                                        </button>
                                    )}
                                    {/* Message button for other users only */}
                                    {!isOwnProfile && (
                                        <button
                                            onClick={handleMessageButton}
                                            className="p-2 border border-constitution-gold/30 rounded-lg hover:bg-constitution-gold/5 transition-colors"
                                            type="button"
                                        >
                                            <MessageSquare className="w-5 h-5 text-constitution-gold" />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleShare}
                                        className="p-2 border border-constitution-gold/30 rounded-lg hover:bg-constitution-gold/5 transition-colors"
                                        title="Share profile"
                                        type="button"
                                    >
                                        <Share2 className="w-5 h-5 text-constitution-gold" />
                                    </button>
                                    <button
                                        onClick={() => setShowQrModal(true)}
                                        aria-label="Show QR Code for profile"
                                        className="p-2 border border-constitution-gold/30 rounded-lg hover:bg-constitution-gold/5 transition-colors"
                                        title="Show QR code"
                                        type="button"
                                        style={{ lineHeight: 0 }}
                                    >
                                        <QrCodeIcon className="w-5 h-5 text-constitution-gold" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {profile.bio && <p className="text-ink-gray/80 mb-4 leading-relaxed">{profile.bio}</p>}

                    {profile.areaOfInterest && profile.areaOfInterest.length > 0 && (
                        <div className="mb-4">
                            <p className="text-ink-gray/60 text-sm mb-2">Areas of Interest</p>
                            <div className="flex flex-wrap gap-2">
                                {profile.areaOfInterest.map((area, i) => <span key={i} className="px-3 py-1 bg-constitution-gold/10 text-constitution-gold rounded-full text-sm">{area}</span>)}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        {profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-constitution-gold hover:underline"><Globe className="w-4 h-4" />Website</a>}
                        {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-constitution-gold hover:underline"><Linkedin className="w-4 h-4" />LinkedIn</a>}
                    </div>
                </div>
            </div>

            {/* Photo Upload Modal (OWNER ONLY) */}
            {isOwnProfile && showPhotoModal && (
                <div className="fixed inset-0 bg-justice-black/80 flex items-center justify-center z-50 p-4">
                    <div className="aged-paper rounded-lg w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-constitution-gold/20">
                            <h2 className="font-heading font-bold text-ink-gray text-xl">
                                {showPhotoModal === 'profile' ? 'Change Profile Photo' : 'Change Cover Photo'}
                            </h2>
                            <button onClick={closeModal} className="p-1 hover:bg-constitution-gold/10 rounded">
                                <X className="w-5 h-5 text-ink-gray" />
                            </button>
                        </div>

                        <div className="p-6">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                className="hidden"
                                aria-hidden={!isOwnProfile}
                                tabIndex={isOwnProfile ? 0 : -1}
                                disabled={!isOwnProfile}
                            />

                            {previewUrl ? (
                                <div className="space-y-4">
                                    <div className={`mx-auto overflow-hidden border-2 border-constitution-gold/30 ${showPhotoModal === 'profile' ? 'w-40 h-40 rounded-full' : 'w-full h-32 rounded-lg'}`}>
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5"
                                            type="button"
                                        >
                                            Choose Different Image
                                        </button>
                                    )}
                                </div>
                            ) : (
                                isOwnProfile && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-12 border-2 border-dashed border-constitution-gold/30 rounded-lg hover:border-constitution-gold/50 transition-colors flex flex-col items-center gap-3"
                                        type="button"
                                    >
                                        <Upload className="w-8 h-8 text-constitution-gold" />
                                        <span className="text-ink-gray">Click to select an image</span>
                                        <span className="text-ink-gray/50 text-sm">JPG, PNG, GIF up to 5MB</span>
                                    </button>
                                )
                            )}
                        </div>

                        <div className="flex justify-end gap-3 p-4 border-t border-constitution-gold/20">
                            <button onClick={closeModal} className="px-4 py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5">
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile}
                                className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Upload Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile QR Code Modal */}
            {showQrModal && (
                <div className="fixed inset-0 bg-justice-black/80 flex items-center justify-center z-50 p-4">
                    <div
                        className="aged-paper rounded-lg w-full max-w-sm"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Profile QR code"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-constitution-gold/20">
                            <h2 className="font-heading font-bold text-ink-gray text-xl">
                                Profile QR Code
                            </h2>
                            <button
                                aria-label="Close QR code dialog"
                                onClick={() => setShowQrModal(false)}
                                className="p-1 hover:bg-constitution-gold/10 rounded"
                            >
                                <X className="w-5 h-5 text-ink-gray" />
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center p-6 w-full">
                            <div
                                className="mb-4 border-2 border-constitution-gold/30 rounded-lg bg-white p-2 flex items-center justify-center"
                                style={{ background: "#fff" }}
                                aria-label="QR code area"
                            >
                                <QRCodeCanvas
                                    value={profileUrl}
                                    size={180}
                                    includeMargin={false}
                                    bgColor="#fff"
                                    fgColor="#202020"
                                    level="M"
                                />
                            </div>
                            <div className="text-center mb-4 w-full flex flex-col items-center">
                                <div className="font-medium text-ink-gray mb-1" aria-live="polite">
                                    Scan to view this profile on NyayaNet
                                </div>
                                <div className="text-xs text-ink-gray/50 break-all w-full">{profileUrl}</div>
                            </div>
                            {/* Centered and responsive share button below the QR code */}
                            <div className="w-full flex flex-col items-center">
                                <button
                                    className="w-full max-w-xs py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 transition-colors flex items-center justify-center"
                                    onClick={handleQrShare}
                                    type="button"
                                >
                                    <Share2 className="w-5 h-5 text-justice-black mr-2" />
                                    Share Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ---------------
// Profile Page Component - Handles fetching, loading state, user identity, and routing
// ---------------

interface ApiProfile {
    id: string;
    fullName: string;
    email: string;
    role: string;
    designation?: string;
    organization?: string;
    areaOfInterest: string[];
    barCouncilNumber?: string;
    experienceYears: number;
    bio?: string;
    profilePhotoUrl?: string;
    coverPhotoUrl?: string;
    location?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    followerCount: number;
    followingCount: number;
    postCount: number;
    discussionCount: number;
    isFollowing?: boolean;
    username?: string;
    isConnectionPending?: boolean;
    isConnected?: boolean;
    connectionStatus?: "none" | "pending" | "connected";
}

// Replace with your actual auth context/hook if needed
function useCurrentUser() {
    const DemoAuthContext = createContext<any>(undefined);
    return useContext<any>(DemoAuthContext);
}

export default function ProfilePage() {
    const { username, id } = getProfileRouteParams();
    let routeParam = username || id;
    if (!routeParam && typeof window !== 'undefined' && window.location && window.location.pathname) {
        const parts = window.location.pathname.split('/');
        routeParam = parts[parts.length - 1] || "";
    }

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ApiProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    const currentUser = useCurrentUser();

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        setProfile(null);

        try {
            if (!routeParam) throw new Error('Missing profile identifier.');
            const resp = await fetch(`/api/profile/${encodeURIComponent(routeParam)}`);
            if (!resp.ok) throw new Error('Could not fetch profile.');
            const data: ApiProfile = await resp.json();
            setProfile(data);
        } catch (e: any) {
            setError(e?.message || 'Error loading profile.');
        } finally {
            setLoading(false);
        }
    }, [routeParam]);

    useEffect(() => {
        if (routeParam) {
            fetchProfile();
        }
    }, [routeParam, fetchProfile]);

    // Determine if viewing own profile
    const isOwnProfile = (
        profile &&
        currentUser &&
        (
            profile.id === currentUser.id ||
            (profile.username && currentUser.username && profile.username === currentUser.username)
        )
    );

    const handleEditProfile = () => {
        alert("Edit profile not implemented here.");
    };

    // Provide a handler that matches the new type signature
    const handleMessage = (profileId: string) => {
        alert("Messaging not implemented here.");
    };

    const handlePhotoUpdate = (type: 'profile' | 'cover', file: File, previewUrl: string) => {
        // Optionally upload and refresh profile photo from backend
        // Here we just show local preview (ProfileHeader handles it for this session)
    };

    const handleFollow = (profileId: string) => {
        // placeholder for possible integrations/callbacks
    };

    const handleConnect = (profileId: string) => {
        // placeholder for possible integrations/callbacks
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-lg text-constitution-gold/80">Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-lg text-red-600">{error}</div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <ProfileHeader
            profile={profile}
            isOwnProfile={!!isOwnProfile}
            onEditProfile={isOwnProfile ? handleEditProfile : undefined}
            onFollow={!isOwnProfile ? handleFollow : undefined}
            onConnect={!isOwnProfile ? handleConnect : undefined}
            onMessage={!isOwnProfile ? handleMessage : undefined}
            onPhotoUpdate={isOwnProfile ? handlePhotoUpdate : undefined}
        />
    );
}
