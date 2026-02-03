import React from 'react';
import {
  Home,
  Newspaper,
  Users,
  MessageSquare,
  Briefcase,
  Brain,
  BookOpen,
  Scale,
  Book,
  User,
  Notebook,
  Bell,
  LogOut
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number | null;
  badgeType?: 'count' | 'new';
  symbol: string;
}

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  pendingConnectionCount?: number;
  notificationCount?: number;
  onLogout?: () => void;
}

export function Sidebar({
  currentPath = '/',
  onNavigate,
  pendingConnectionCount = 0,
  notificationCount = 0,
  onLogout
}: SidebarProps) {

  const navItems: NavItem[] = [
    { path: '/', icon: Home, label: 'Dashboard', symbol: '🏛️' },
    { path: '/feed', icon: Newspaper, label: 'Feed', symbol: '📰' },
    { path: '/profile', icon: User, label: 'Profile', symbol: '👤' },
    { path: '/discussions', icon: MessageSquare, label: 'Discussions', symbol: '💬' },
    { path: '/cases', icon: Briefcase, label: 'Cases', symbol: '⚖️' },
    { path: '/notes', icon: Notebook, label: 'Notes', symbol: '📝' },
    { path: '/ai', icon: Brain, label: 'AI Assistant', symbol: '🤖' },
    { path: '/notifications', icon: Bell, label: 'Notifications', symbol: '🔔', badge: notificationCount > 0 ? notificationCount : null, badgeType: 'count' },
    { path: '/network', icon: Users, label: 'Network', symbol: '🤝', badge: pendingConnectionCount > 0 ? pendingConnectionCount : null, badgeType: pendingConnectionCount > 0 ? 'count' : undefined }
  ];

  const handleNavClick = (path: string) => {
    if (onNavigate) onNavigate(path);
  };

  return (
    <aside className="w-64 bg-justice-black border-r border-constitution-gold/20 h-screen fixed left-0 top-0 flex flex-col">
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
            <p className="text-constitution-gold tracking-wider text-xs">LEGAL INTELLIGENCE PLATFORM</p>
          </div>
        </div>
      </div>

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
              <span className="absolute right-4 opacity-5 group-hover:opacity-10 transition-opacity text-4xl">{item.symbol}</span>

              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-constitution-gold' : ''}`} />
              <span className="font-medium tracking-wide flex-1 text-left">{item.label}</span>

              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${item.badgeType === 'count' ? 'bg-amber-700 text-white' : 'bg-constitution-gold text-justice-black'}`}>
                  {item.badge}
                </span>
              )}

              {isActive && <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-constitution-gold rounded-l"></div>}
            </button>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all relative overflow-hidden group text-red-500/70 hover:bg-red-500/5 hover:text-red-500 mt-4"
        >
          <span className="absolute right-4 opacity-5 group-hover:opacity-10 transition-opacity text-4xl">🚪</span>

          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium tracking-wide flex-1 text-left">Logout</span>
        </button>
      </nav>

      <div className="px-4 py-3">
        <div className="h-px bg-gradient-to-r from-transparent via-constitution-gold/30 to-transparent"></div>
      </div>

      <div className="p-4 border-t border-constitution-gold/20">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-constitution-gold/30 flex items-center justify-center">
            <Book className="w-6 h-6 text-constitution-gold" />
          </div>
          <p className="text-constitution-gold/60 text-xs">Constitution of India</p>
          <p className="text-constitution-gold/40 text-xs">Article 14 · Equality Before Law</p>
        </div>
      </div>
    </aside>
  );
}