import React from "react";
import {
  Home,
  Newspaper,
  Users,
  MessageSquare,
  Brain,
  Notebook,
  Bell,
  LogOut,
  MessageCircle,
  Scale,
  Book,
  User,
  BookOpen
} from "lucide-react";

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number | null;
  badgeType?: "count" | "new";
}

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  pendingConnectionCount?: number;
  notificationCount?: number;
  onLogout?: () => void;
}

export function Sidebar({
  currentPath = "/",
  onNavigate,
  pendingConnectionCount = 0,
  notificationCount = 0,
  onLogout,
}: SidebarProps) {
  const navItems: NavItem[] = [
    // Core Navigation
    { path: "/", icon: Home, label: "Dashboard" },

    { path: "/feed", icon: Newspaper, label: "Feed" },

    { path: "/discussions", icon: MessageSquare, label: "Debates" },

    {
      path: "/messages",
      icon: MessageCircle,
      label: "Chat",
    },

    // Network & Community
    {
      path: "/network",
      icon: Users,
      label: "Network",
      badge: pendingConnectionCount > 0 ? pendingConnectionCount : null,
      badgeType: "count",
    },

    // Notes & Tools
    { path: "/notes", icon: Notebook, label: "Notes" },

    // Notifications
    {
      path: "/notifications",
      icon: Bell,
      label: "Notifications",
    },

    { path: "/profile", icon: User, label: "Profile" },
    { path: "/library", icon: BookOpen, label: "Law Library" },
    { path: "/chatbot", icon: Brain, label: "NyayaNetGPT", badge: "AI" },
    
  ];

  const handleNavClick = (path: string) => {
    if (onNavigate) onNavigate(path);
  };

  return (
    <aside className="w-64 bg-justice-black border-r border-constitution-gold/20 h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-constitution-gold/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-constitution-gold rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-justice-black" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-justice-black bg-seal-red rounded-full"></div>
          </div>

          <div>
            <h1 className="font-heading tracking-wide text-judge-ivory">
              NyayaNet
            </h1>
            <p className="text-constitution-gold tracking-wider text-xs">
              LEGAL INTELLIGENCE PLATFORM
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          // ✅ Active Highlight Fix
          const isActive =
            currentPath === item.path ||
            (item.path !== "/" && currentPath.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all relative overflow-hidden group ${isActive
                  ? "bg-constitution-gold/10 text-judge-ivory border-l-2 border-constitution-gold"
                  : "text-constitution-gold/70 hover:bg-constitution-gold/5 hover:text-judge-ivory"
                }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-constitution-gold" : ""
                  }`}
              />

              <span className="font-medium tracking-wide flex-1 text-left">
                {item.label}
              </span>

              {/* Badge */}
              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-xs ${item.badgeType === "count"
                      ? "bg-amber-700 text-white"
                      : "bg-constitution-gold text-justice-black"
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-5 py-1 rounded-lg transition-all relative overflow-hidden group text-red-500/70 hover:bg-red-500/5 hover:text-red-500 mt-4"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium tracking-wide flex-1 text-left">
            Logout
          </span>
        </button>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-constitution-gold/20 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-constitution-gold/30 flex items-center justify-center">
          <Book className="w-6 h-6 text-constitution-gold" />
        </div>
        <p className="text-constitution-gold/60 text-xs">
          Constitution of India
        </p>
        <p className="text-constitution-gold/40 text-xs">
          Article 14 · Equality Before Law
        </p>
      </div>
    </aside>
  );
}












/*{ path: "/cases", icon: Briefcase, label: "Docket", badge: "5", symbol: "📁" },*/
/*{
  path: "/ai",
  icon: Brain,
  label: "Legal AI",
  badge: "New",
  badgeType: "new",
  symbol: "🧠",
},*/
