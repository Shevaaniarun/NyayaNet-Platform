// User Types
export interface User {
    id: string;
    email: string;
    password_hash?: string;
    full_name: string;
    role: UserRole;
    designation?: string;
    organization?: string;
    area_of_interest: string[];
    bar_council_number?: string;
    experience_years: number;
    bio?: string;
    location?: string;
    website_url?: string;
    linkedin_url?: string;
    profile_photo_url?: string;
    cover_photo_url?: string;
    follower_count: number;
    following_count: number;
    post_count: number;
    discussion_count: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export type UserRole = 'LAW_STUDENT' | 'LAWYER' | 'JUDGE' | 'LEGAL_PROFESSIONAL' | 'ADVOCATE';

export interface UpdateProfileInput {
    fullName?: string;
    designation?: string;
    organization?: string;
    areaOfInterest?: string[];
    bio?: string;
    location?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    barCouncilNumber?: string;
    experienceYears?: number;
}

export interface ProfileResponse {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
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
    createdAt: string;
}

export type MediaType = 'IMAGE' | 'PDF' | 'DOCUMENT';

export interface CreateCertificationInput {
    title: string;
    issuingOrganization: string;
    credentialId?: string;
    issueDate: string;
    expiryDate?: string;
    certificateUrl: string;
    fileType: MediaType;
    description?: string;
    tags?: string[];
}

export interface CertificationResponse {
    id: string;
    title: string;
    issuingOrganization: string;
    credentialId?: string;
    issueDate: string;
    expiryDate?: string;
    certificateUrl: string;
    fileType: MediaType;
    description?: string;
    tags?: string[];
}
