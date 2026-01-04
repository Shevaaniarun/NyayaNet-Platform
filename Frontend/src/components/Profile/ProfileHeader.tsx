import { useRef, useState } from 'react';
import { Pencil, Share2, MapPin, Briefcase, Building2, Globe, Linkedin, UserPlus, MessageSquare, UserCheck, Camera, X, Upload } from 'lucide-react';

interface ProfileHeaderProps {
    profile: {
        id: string; fullName: string; email: string; role: string; designation?: string; organization?: string;
        areaOfInterest: string[]; barCouncilNumber?: string; experienceYears: number; bio?: string; profilePhotoUrl?: string; coverPhotoUrl?: string;
        location?: string; websiteUrl?: string; linkedinUrl?: string; followerCount: number; followingCount: number;
        postCount: number; discussionCount: number; isFollowing?: boolean;
    };
    isOwnProfile: boolean;
    onEditProfile?: () => void;
    onFollow?: () => void;
    onMessage?: () => void;
    onPhotoUpdate?: (type: 'profile' | 'cover', file: File, previewUrl: string) => void;
}

const roleLabels: Record<string, string> = {
    LAW_STUDENT: 'Law Student', LAWYER: 'Lawyer', JUDGE: 'Judge', LEGAL_PROFESSIONAL: 'Legal Professional', ADVOCATE: 'Advocate'
};

export function ProfileHeader({ profile, isOwnProfile, onEditProfile, onFollow, onMessage, onPhotoUpdate }: ProfileHeaderProps) {
    const [showPhotoModal, setShowPhotoModal] = useState<'profile' | 'cover' | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [localProfilePhoto, setLocalProfilePhoto] = useState<string | null>(null);
    const [localCoverPhoto, setLocalCoverPhoto] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleShare = () => {
        const shareUrl = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: `${profile.fullName}'s Profile - NyayaNet`,
                text: `Check out ${profile.fullName}'s profile on NyayaNet`,
                url: shareUrl
            }).catch(() => {
                navigator.clipboard.writeText(shareUrl);
                alert('Profile link copied to clipboard!');
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Profile link copied to clipboard!');
        }
    };

    const openPhotoModal = (type: 'profile' | 'cover') => {
        setShowPhotoModal(type);
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);
        setSelectedFile(file);
    };

    const handleUpload = () => {
        if (!selectedFile || !previewUrl || !showPhotoModal) return;

        // Update local state for immediate preview
        if (showPhotoModal === 'profile') {
            setLocalProfilePhoto(previewUrl);
        } else {
            setLocalCoverPhoto(previewUrl);
        }

        // Call parent handler if provided
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

    return (
        <>
            <div className="aged-paper rounded-lg overflow-hidden border border-constitution-gold/20">
                {/* Cover Photo */}
                <div className="h-48 bg-gradient-to-r from-constitution-gold/20 via-gavel-bronze/20 to-constitution-gold/20 relative"
                    style={displayCoverPhoto ? { backgroundImage: `url(${displayCoverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    {isOwnProfile && (
                        <button
                            onClick={() => openPhotoModal('cover')}
                            className="absolute bottom-4 right-4 p-2 bg-justice-black/60 rounded-full hover:bg-justice-black/80 transition-colors flex items-center gap-1"
                            title="Change cover photo"
                        >
                            <Camera className="w-4 h-4 text-constitution-gold" />
                            <span className="text-constitution-gold text-xs">Edit Cover</span>
                        </button>
                    )}

                    {/* Profile Photo */}
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
                                    >
                                        <Share2 className="w-5 h-5 text-constitution-gold" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={onFollow} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${profile.isFollowing ? 'bg-constitution-gold/10 text-constitution-gold border border-constitution-gold/30' : 'bg-constitution-gold text-justice-black hover:bg-constitution-gold/90'}`}>
                                        {profile.isFollowing ? <><UserCheck className="w-4 h-4" />Following</> : <><UserPlus className="w-4 h-4" />Follow</>}
                                    </button>
                                    <button onClick={onMessage} className="p-2 border border-constitution-gold/30 rounded-lg hover:bg-constitution-gold/5 transition-colors">
                                        <MessageSquare className="w-5 h-5 text-constitution-gold" />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-2 border border-constitution-gold/30 rounded-lg hover:bg-constitution-gold/5 transition-colors"
                                        title="Share profile"
                                    >
                                        <Share2 className="w-5 h-5 text-constitution-gold" />
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

            {/* Photo Upload Modal */}
            {showPhotoModal && (
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
                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                className="hidden"
                            />

                            {previewUrl ? (
                                <div className="space-y-4">
                                    <div className={`mx-auto overflow-hidden border-2 border-constitution-gold/30 ${showPhotoModal === 'profile' ? 'w-40 h-40 rounded-full' : 'w-full h-32 rounded-lg'}`}>
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5"
                                    >
                                        Choose Different Image
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-12 border-2 border-dashed border-constitution-gold/30 rounded-lg hover:border-constitution-gold/50 transition-colors flex flex-col items-center gap-3"
                                >
                                    <Upload className="w-8 h-8 text-constitution-gold" />
                                    <span className="text-ink-gray">Click to select an image</span>
                                    <span className="text-ink-gray/50 text-sm">JPG, PNG, GIF up to 5MB</span>
                                </button>
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
        </>
    );
}
