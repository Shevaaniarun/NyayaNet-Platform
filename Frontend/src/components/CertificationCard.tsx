import { Award, ExternalLink, Trash2, Calendar } from 'lucide-react';

interface CertificationCardProps {
    certification: { id: string; title: string; issuingOrganization: string; credentialId?: string; issueDate: string; expiryDate?: string; certificateUrl: string; fileType: string; description?: string; tags?: string[]; };
    isOwnProfile: boolean;
    onDelete?: (id: string) => void;
}

export function CertificationCard({ certification, isOwnProfile, onDelete }: CertificationCardProps) {
    const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const isExpired = certification.expiryDate && new Date(certification.expiryDate) < new Date();

    return (
        <div className="aged-paper rounded-lg p-4 border border-constitution-gold/20 hover:border-constitution-gold/40 transition-colors">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-constitution-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-constitution-gold" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-medium text-ink-gray">{certification.title}</h3>
                            <p className="text-sm text-ink-gray/70">{certification.issuingOrganization}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <a href={certification.certificateUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-constitution-gold hover:bg-constitution-gold/10 rounded-lg transition-colors" title="View Certificate">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            {isOwnProfile && onDelete && (
                                <button onClick={() => onDelete(certification.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-ink-gray/60">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>Issued {formatDate(certification.issueDate)}</span></div>
                        {certification.expiryDate && <span className={isExpired ? 'text-red-400' : ''}>{isExpired ? 'Expired' : 'Expires'} {formatDate(certification.expiryDate)}</span>}
                    </div>
                    {certification.description && (
                        <p className="mt-2 text-sm text-ink-gray/70">{certification.description}</p>
                    )}
                    {certification.tags && certification.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {certification.tags.map((tag, i) => <span key={i} className="px-2 py-0.5 bg-constitution-gold/10 text-constitution-gold rounded text-xs">{tag}</span>)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
