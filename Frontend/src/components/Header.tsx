/**
 * Header - Top Navigation Bar
 * Provides context and actions for the current view
 */

import { Bell, User, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-justice-black border-b border-constitution-gold/20 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-judge-ivory">{title}</h1>
          {subtitle && (
            <p className="text-constitution-gold/70 mt-1" style={{ fontSize: '0.875rem' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search legal content..."
              className="w-64 px-4 py-2 bg-constitution-gold/5 border border-constitution-gold/30 rounded-lg text-judge-ivory placeholder-constitution-gold/50 focus:outline-none focus:border-constitution-gold font-body"
              style={{ fontSize: '0.875rem' }}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-constitution-gold/50" />
          </div>

          {/* Notifications */}
          <button className="relative p-2 bg-constitution-gold/5 border border-constitution-gold/30 rounded-lg hover:bg-constitution-gold/10 transition-colors">
            <Bell className="w-5 h-5 text-constitution-gold" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-seal-red rounded-full border-2 border-justice-black flex items-center justify-center text-judge-ivory" style={{ fontSize: '0.625rem' }}>
              3
            </span>
          </button>

          {/* Profile */}
          <button className="flex items-center space-x-2 p-2 bg-constitution-gold/5 border border-constitution-gold/30 rounded-lg hover:bg-constitution-gold/10 transition-colors">
            <div className="w-8 h-8 bg-constitution-gold rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-justice-black" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
