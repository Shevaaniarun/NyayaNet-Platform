import { Award, ExternalLink, Trash2, Calendar, Hash } from 'lucide-react';
import { useState } from 'react';

interface CertificationCardProps {
    certification: {
        id: string;
        title: string;
        issuingOrganization: string;
        credentialId?: string;
        issueDate: string;
        expiryDate?: string;
        certificateUrl: string;
        fileType: string;
        description?: string;
        tags?: string[];
    };
    isOwnProfile: boolean;
    onDelete?: (id: string) => void;
}

export function CertificationCard({ certification, isOwnProfile, onDelete }: CertificationCardProps) {
    const [imageError, setImageError] = useState(false);

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // Fallback to original string if invalid
            return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        } catch (e) {
            return dateString;
        }
    };

    const isExpired = certification.expiryDate && new Date(certification.expiryDate) < new Date();

    return (
        <div className="aged-paper rounded-lg p-5 border border-constitution-gold/20 hover:border-constitution-gold/40 transition-all duration-200 group relative overflow-hidden">
            {/* Subtle excessive styling for premium feel */}
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award className="w-16 h-16 text-constitution-gold rotate-12" />
            </div>

            <div className="flex items-start gap-4 relative z-10">
                {/* Icon / Thumbnail Box */}
                <div className="w-14 h-14 bg-constitution-gold/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-constitution-gold/10 group-hover:border-constitution-gold/30 transition-colors">
                    {certification.fileType?.startsWith('image/') && !imageError ? (
                        <img
                            src={certification.certificateUrl}
                            alt={certification.title}
                            className="w-full h-full object-cover rounded-xl"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <Award className="w-7 h-7 text-constitution-gold" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-heading font-bold text-lg text-ink-gray leading-tight group-hover:text-constitution-gold transition-colors">
                                {certification.title}
                            </h3>
                            <p className="text-sm text-ink-gray/80 font-medium mt-1">
                                {certification.issuingOrganization}
                            </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                            {certification.certificateUrl && (
                                <a
                                    href={certification.certificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-constitution-gold hover:bg-constitution-gold/10 rounded-lg transition-colors tooltip-trigger"
                                    title="View Certificate"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                            {isOwnProfile && onDelete && (
                                <button
                                    onClick={() => onDelete(certification.id)}
                                    className="p-2 text-ink-gray/40 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors"
                                    title="Delete Certification"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-xs text-ink-gray/60 font-medium">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 opacity-70" />
                            <span>Issued {formatDate(certification.issueDate)}</span>
                        </div>
                        {certification.expiryDate && (
                            <span className={`flex items-center gap-1.5 ${isExpired ? 'text-red-500/80' : ''}`}>
                                {isExpired ? 'Expired' : 'Expires'} {formatDate(certification.expiryDate)}
                            </span>
                        )}
                        {certification.credentialId && (
                            <div className="flex items-center gap-1.5 font-mono text-xs opacity-80" title="Credential ID">
                                <Hash className="w-3 h-3.5 opacity-70" />
                                <span>ID: {certification.credentialId}</span>
                            </div>
                        )}
                    </div>

                    {certification.description && (
                        <p className="mt-3 text-sm text-ink-gray/70 leading-relaxed border-l-2 border-constitution-gold/20 pl-3">
                            {certification.description}
                        </p>
                    )}

                    {certification.tags && certification.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {certification.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 bg-constitution-gold/5 border border-constitution-gold/10 text-constitution-gold hover:bg-constitution-gold/10 rounded text-[10px] uppercase tracking-wider font-bold transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
