/**
 * CaseCard - Legal Case Management Card
 * Displays case details with aged paper effect and professional styling
 */

import { Scale, Landmark, Eye, FileText, ChevronRight } from 'lucide-react';

export interface CaseItem {
  id: string;
  caseTitle: string;
  caseNumber: string;
  caseStatus: 'active' | 'pending' | 'closed' | 'hearing_scheduled';
  courtName: string;
  courtLevel: string;
  clientName: string;
  hearingDate: string;
  caseDescription: string;
  documentCount: number;
  tags?: string[];
}

interface CaseCardProps {
  caseItem: CaseItem;
  onClick?: () => void;
}

function CaseStatus({ status }: { status: string }) {
  const statusConfig = {
    active: { label: 'Active', color: 'text-constitution-gold bg-constitution-gold/10' },
    pending: { label: 'Pending', color: 'text-gavel-bronze bg-gavel-bronze/10' },
    closed: { label: 'Closed', color: 'text-ink-gray/60 bg-ink-gray/10' },
    hearing_scheduled: { label: 'Hearing Scheduled', color: 'text-seal-red bg-seal-red/10' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <span className={`px-2 py-1 rounded ${config.color} font-medium`} style={{ fontSize: '0.75rem' }}>
      {config.label}
    </span>
  );
}

export function CaseCard({ caseItem, onClick }: CaseCardProps) {
  return (
    <div className="group relative">
      {/* Case Seal */}
      <div className="absolute -top-3 -right-3 z-10">
        <div className="w-12 h-12 rounded-full bg-justice-black border-2 border-constitution-gold flex items-center justify-center">
          <Scale className="w-6 h-6 text-constitution-gold" />
        </div>
      </div>

      {/* Main Card */}
      <div
        className="aged-paper rounded-lg p-6 border border-constitution-gold/20 hover:border-constitution-gold/40 transition-colors cursor-pointer"
        onClick={onClick}
      >
        {/* Case Number Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-constitution-gold/10">
          <div className="flex-1">
            <h3 className="font-heading font-bold text-ink-gray tracking-wide">
              {caseItem.caseTitle}
            </h3>
            <div className="flex items-center space-x-3 mt-1">
              <span className="px-2 py-0.5 bg-justice-black text-judge-ivory rounded font-mono" style={{ fontSize: '0.75rem' }}>
                {caseItem.caseNumber}
              </span>
              <CaseStatus status={caseItem.caseStatus} />
            </div>
          </div>
        </div>

        {/* Case Details */}
        <div className="space-y-4">
          {/* Court Details */}
          <div className="flex items-center text-ink-gray/70" style={{ fontSize: '0.875rem' }}>
            <Landmark className="w-4 h-4 mr-2 text-constitution-gold" />
            <span>{caseItem.courtName}</span>
            <span className="mx-2">·</span>
            <span className="font-medium">{caseItem.courtLevel}</span>
          </div>

          {/* Client & Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-ink-gray/50 uppercase tracking-wider mb-1" style={{ fontSize: '0.75rem' }}>Client</p>
              <p className="text-ink-gray" style={{ fontSize: '0.875rem' }}>{caseItem.clientName}</p>
            </div>
            <div>
              <p className="text-ink-gray/50 uppercase tracking-wider mb-1" style={{ fontSize: '0.75rem' }}>Hearing</p>
              <p className="text-ink-gray font-medium" style={{ fontSize: '0.875rem' }}>{caseItem.hearingDate}</p>
            </div>
          </div>

          {/* Case Excerpt */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-constitution-gold/20"></div>
            <p className="text-ink-gray/80 pl-3 italic line-clamp-2" style={{ fontSize: '0.875rem' }}>
              {caseItem.caseDescription}
            </p>
          </div>

          {/* Tags */}
          {caseItem.tags && caseItem.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2 py-1 bg-constitution-gold/5 text-constitution-gold border border-constitution-gold/20 rounded" style={{ fontSize: '0.75rem' }}>
                {caseItem.tags[0]}
              </span>
              {caseItem.tags.slice(1, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-justice-black/5 text-ink-gray/70 border border-constitution-gold/10 rounded"
                  style={{ fontSize: '0.75rem' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-4 border-t border-constitution-gold/10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-constitution-gold hover:text-gavel-bronze transition-colors" style={{ fontSize: '0.875rem' }}>
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
            <button className="flex items-center space-x-1 text-ink-gray/60 hover:text-constitution-gold transition-colors" style={{ fontSize: '0.875rem' }}>
              <FileText className="w-4 h-4" />
              <span>{caseItem.documentCount} Docs</span>
            </button>
          </div>

          <button className="text-constitution-gold hover:text-gavel-bronze transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 border-2 border-constitution-gold rounded-lg opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"></div>
    </div>
  );
}
