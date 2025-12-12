
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { User, Notification } from '../types';
import { StorageService } from '../services/storage';
import { NotificationDropdown } from './Notifications';
import { 
  Home, 
  MapPin, 
  MessageCircle, 
  User as UserIcon, 
  LogOut, 
  Menu,
  X,
  Users,
  Calendar,
  ShieldAlert,
  Bell,
  Sparkles,
  Trophy,
  Zap,
  Moon,
  Sun,
  Brain,
  Database,
  Hexagon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Custom Logo Component
const NexusLogo = () => (
  <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  </div>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout, theme, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const isDemoMode = StorageService.isDemoMode();

  const navItems = [
    { label: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
    { label: 'Vibes', icon: <Zap size={20} />, path: '/vibes' },
    { label: 'Locations', icon: <MapPin size={20} />, path: '/locations' },
    { label: 'Quests', icon: <Trophy size={20} />, path: '/quests' },
    { label: 'People', icon: <Users size={20} />, path: '/people' },
    { label: 'Mystery', icon: <Sparkles size={20} />, path: '/mystery' },
    { label: 'AI Insights', icon: <Brain size={20} />, path: '/analysis' },
    { label: 'Feed', icon: <Calendar size={20} />, path: '/feed' },
    { label: 'Messages', icon: <MessageCircle size={20} />, path: '/messages' },
    { label: 'Profile', icon: <UserIcon size={20} />, path: '/profile' },
  ];

  // Poll for notifications
  const refreshNotifications = () => {
    const all = StorageService.getNotifications(currentUser.id);
    setNotifications(all);
  };

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPageTitle = () => {
    if (location.pathname.startsWith('/chat')) return 'Chat';
    const current = navItems.find(item => location.pathname.startsWith(item.path));
    return current ? current.label : 'SIT Nexus';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center space-x-3">
          <NexusLogo />
          <span className="text-2xl font-brand font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            SIT Nexus
          </span>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-700">
             <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium'
                    : 'text-gray-500 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-300'
                }`
              }
            >
              <ShieldAlert size={20} />
              <span>Moderation</span>
            </NavLink>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name}`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-600 object-cover"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{currentUser.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                 <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 rounded font-bold">Lvl {currentUser.level || 1}</span>
                 <span className="truncate">{currentUser.xp || 0} XP</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header & Overlay */}
      <div className="flex-1 flex flex-col h-full w-full">
        {/* DEMO BANNER */}
        {isDemoMode && (
          <div className="bg-indigo-600 text-white text-xs font-bold py-1 px-4 text-center flex items-center justify-center gap-2">
            <Database size={12} />
            <span>DEMO MODE ACTIVE</span>
            <button onClick={() => navigate('/admin')} className="underline ml-2 hover:text-indigo-200">Turn Off</button>
          </div>
        )}

        <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 z-20 shrink-0 transition-colors">
          <div className="md:hidden flex items-center gap-2">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-slate-300">
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
             <span className="text-lg font-brand font-bold text-gray-800 dark:text-white">{getPageTitle()}</span>
          </div>
          
          <div className="hidden md:block text-lg font-bold text-gray-800 dark:text-white px-4">{getPageTitle()}</div>

          <div className="flex items-center gap-2">
             <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Toggle Theme"
             >
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full relative"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationDropdown notifications={notifications} onRead={refreshNotifications} />
              )}
            </div>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-white dark:bg-slate-900 z-10 pt-16 flex flex-col animate-reveal">
            <div className="p-4 flex flex-col gap-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-4 rounded-xl text-lg ${
                      isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium' 
                        : 'text-gray-600 dark:text-slate-300'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <NavLink
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl text-lg text-gray-600 dark:text-slate-300"
                >
                  <ShieldAlert size={20} />
                  <span>Moderation</span>
                </NavLink>
              <button 
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-lg text-red-500 mt-4 border-t border-gray-100 dark:border-slate-700"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50 dark:bg-slate-900 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
};
