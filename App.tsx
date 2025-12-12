
import React, { useEffect, useState } from 'react';
import { User } from './types';
import { StorageService } from './services/storage';
import { Auth } from './pages/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Locations } from './pages/Locations';
import { Profile } from './pages/Profile';
import { Chat } from './pages/Chat';
import { People } from './pages/People';
import { Feed } from './pages/Feed';
import { Admin } from './pages/Admin';
import { Mystery } from './pages/Mystery';
import { Quests } from './pages/Quests';
import { VibeCheck } from './pages/VibeCheck';
import { Analysis } from './pages/Analysis';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'; // Default to dark for peaceful vibe
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const init = async () => {
      // Simulate checking session
      const storedUser = StorageService.getCurrentUser();
      if (storedUser) {
        setCurrentUser(storedUser);
      } else {
        // Initialize dummy data if first time
        StorageService.initDummyData();
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleLogin = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-slate-900">Loading SIT Connect...</div>;

  return (
    <HashRouter>
      {!currentUser ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <Layout currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
            <Route path="/vibes" element={<VibeCheck currentUser={currentUser} />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/chat/:roomId" element={<Chat currentUser={currentUser} />} />
            <Route path="/messages" element={<Chat currentUser={currentUser} view="list" />} />
            <Route path="/profile" element={<Profile currentUser={currentUser} onUpdate={(u) => setCurrentUser(u)} />} />
            <Route path="/people" element={<People currentUser={currentUser} />} />
            <Route path="/mystery" element={<Mystery currentUser={currentUser} />} />
            <Route path="/quests" element={<Quests currentUser={currentUser} />} />
            <Route path="/feed" element={<Feed currentUser={currentUser} />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/analysis" element={<Analysis currentUser={currentUser} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      )}
    </HashRouter>
  );
};

export default App;
