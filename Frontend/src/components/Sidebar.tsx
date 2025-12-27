/**
 * Sidebar - Main Navigation for NyayaNet
 * Law library inspired navigation with gold accents on black background
 */

import {
  Home,
  Newspaper,
  Users,
  MessageSquare,
  Briefcase,
  Brain,
  MessageCircle,
  BookOpen,
  Scale,
  Zap,
  Search,
  Book,
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: string | null;
  symbol: string;
}

const navItems: NavItem[] = [
  {
    path: '/',
    icon: Home,
    label: 'Dashboard',
    badge: null,
    symbol: '⚖️',
  },
  {
    path: '/feed',
    icon: Newspaper,
    label: 'Legal Feed',
    badge: null,
    symbol: '📜',
  },
  {
    path: '/network',
    icon: Users,
    label: 'Colleagues',
    badge: '3',
    symbol: '👥',
  },
  {
    path: '/chat',
    icon: MessageSquare,
    label: 'Chambers',
    badge: '12',
    symbol: '💬',
  },
  {
    path: '/cases',
    icon: Briefcase,
    label: 'Docket',
    badge: '5',
    symbol: '📁',
  },
  {
    path: '/ai',
    icon: Brain,
    label: 'Legal AI',
    badge: 'New',
    symbol: '🧠',
  },
  {
    path: '/discussions',
    icon: MessageCircle,
    label: 'Debates',
    badge: null,
    symbol: '💭',
  },
  {
    path: '/library',
    icon: BookOpen,
    label: 'Library',
    badge: null,
    symbol: '📚',
  },
];

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function Sidebar({ currentPath = '/', onNavigate }: SidebarProps) {
  const handleNavClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <aside className="w-64 bg-justice-black border-r border-constitution-gold/20 h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-constitution-gold/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-constitution-gold rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-justice-black" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-justice-black bg-seal-red rounded-full"></div>
          </div>
          <div>
            <h1 className="font-heading tracking-wide text-judge-ivory">NyayaNet</h1>
            <p className="text-constitution-gold tracking-wider" style={{ fontSize: '0.625rem' }}>
              LEGAL INTELLIGENCE PLATFORM
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all relative overflow-hidden group ${
                isActive
                  ? 'bg-constitution-gold/10 text-judge-ivory border-l-2 border-constitution-gold'
                  : 'text-constitution-gold/70 hover:bg-constitution-gold/5 hover:text-judge-ivory'
              }`}
            >
              {/* Background Symbol */}
              <span className="absolute right-4 opacity-5 group-hover:opacity-10 transition-opacity" style={{ fontSize: '2.25rem' }}>
                {item.symbol}
              </span>

              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-constitution-gold' : ''}`} />
              <span className="font-medium tracking-wide flex-1 text-left">{item.label}</span>

              {item.badge && (
                <span className="px-2 py-0.5 bg-constitution-gold text-justice-black rounded-full font-bold" style={{ fontSize: '0.75rem' }}>
                  {item.badge}
                </span>
              )}

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-constitution-gold rounded-l"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-4 py-3">
        <div className="h-px bg-gradient-to-r from-transparent via-constitution-gold/30 to-transparent"></div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-3">
        <h3 className="px-4 font-bold text-constitution-gold/50 tracking-wider uppercase" style={{ fontSize: '0.75rem' }}>
          Quick Justice
        </h3>

        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-constitution-gold text-justice-black rounded-lg font-bold tracking-wide hover:bg-constitution-gold/90 transition-colors">
          <Zap className="w-4 h-4" />
          <span>AI Prediction</span>
        </button>

        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-constitution-gold text-constitution-gold rounded-lg font-bold tracking-wide hover:bg-constitution-gold/5 transition-colors">
          <Search className="w-4 h-4" />
          <span>Find Precedents</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-constitution-gold/20">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-constitution-gold/30 flex items-center justify-center">
            <Book className="w-6 h-6 text-constitution-gold" />
          </div>
          <p className="text-constitution-gold/60" style={{ fontSize: '0.75rem' }}>
            Constitution of India
          </p>
          <p className="text-constitution-gold/40" style={{ fontSize: '0.75rem' }}>
            Article 14 · Equality Before Law
          </p>
        </div>
      </div>
    </aside>
  );
}
