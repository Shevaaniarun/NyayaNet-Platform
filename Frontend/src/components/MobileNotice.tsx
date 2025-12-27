/**
 * MobileNotice - Mobile Device Notice
 * Informs users that the platform is optimized for desktop viewing
 */

import { Monitor } from 'lucide-react';

export function MobileNotice() {
  return (
    <div className="lg:hidden fixed inset-0 bg-justice-black flex items-center justify-center p-6 z-50">
      <div className="aged-paper rounded-xl p-8 max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-constitution-gold/10 border-2 border-constitution-gold rounded-full flex items-center justify-center">
          <Monitor className="w-10 h-10 text-constitution-gold" />
        </div>
        
        <h1 className="font-heading font-bold text-ink-gray mb-4">Desktop Experience Required</h1>
        
        <p className="text-ink-gray/70 leading-relaxed mb-6 font-body">
          NyayaNet is optimized for desktop viewing to provide the best experience for legal professionals. 
          Please access this platform from a desktop or laptop computer.
        </p>
        
        <div className="pt-4 border-t border-constitution-gold/20">
          <p className="text-constitution-gold/60" style={{ fontSize: '0.875rem' }}>
            Minimum recommended screen width: 1024px
          </p>
        </div>

        {/* Constitutional quote */}
        <div className="mt-6 p-4 constitution-texture rounded">
          <p className="text-ink-gray/60 italic" style={{ fontSize: '0.75rem' }}>
            "Justice delayed is justice denied. Access this platform on desktop for optimal legal workflow."
          </p>
        </div>
      </div>
    </div>
  );
}
