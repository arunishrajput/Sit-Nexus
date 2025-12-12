import React, { useState, useEffect } from 'react';
import { User, MoodMatch } from '../types';
import { StorageService } from '../services/storage';
import { MOODS, LOCATIONS } from '../constants';
import { Button, Card, Badge } from '../components/ui';
import { Zap, MapPin, UserPlus, MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VibeCheckProps {
  currentUser: User;
}

export const VibeCheck: React.FC<VibeCheckProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(currentUser.currentMood || null);
  const [activeTab, setActiveTab] = useState<'mood' | 'matches'>('mood');
  const [matches, setMatches] = useState<MoodMatch[]>([]);
  
  useEffect(() => {
    if (selectedMoodId) {
       const results = StorageService.getMoodMatches(currentUser.id);
       setMatches(results);
    }
  }, [currentUser.id, selectedMoodId]);

  const handleSetMood = (moodId: string) => {
    setSelectedMoodId(moodId);
    StorageService.setMood(currentUser.id, moodId);
    // Auto switch to matches after setting mood
    setTimeout(() => setActiveTab('matches'), 800);
  };

  const handleConnect = (otherUserId: string) => {
    StorageService.sendConnectionRequest(currentUser.id, otherUserId);
    alert('Connection request sent!');
  };

  const selectedMoodConfig = MOODS.find(m => m.id === selectedMoodId);

  // Helper for color classes
  const getColors = (colorBase: string) => {
    const map: Record<string, string> = {
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 ring-orange-500',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 ring-blue-500',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 ring-red-500',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 ring-green-500',
      pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800 ring-pink-500',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 ring-yellow-500',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 ring-purple-500',
      teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 ring-teal-500',
      gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 ring-gray-500',
      slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 ring-slate-500',
    };
    return map[colorBase] || map['gray'];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <Zap className="text-yellow-500 fill-yellow-500" /> Vibe Check
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">What's your mood right now? Find your tribe.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex gap-2">
            <button 
                onClick={() => setActiveTab('mood')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'mood' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
            >
                Set My Mood
            </button>
            <button 
                onClick={() => setActiveTab('matches')}
                disabled={!selectedMoodId}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'matches' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'} ${!selectedMoodId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                Vibe Tribe
            </button>
        </div>
      </div>

      {activeTab === 'mood' && (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {MOODS.map(mood => {
                    const isSelected = selectedMoodId === mood.id;
                    const colors = getColors(mood.color);
                    return (
                        <button
                            key={mood.id}
                            onClick={() => handleSetMood(mood.id)}
                            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 relative overflow-hidden ${isSelected ? colors.replace('bg-', 'bg-opacity-20 ') + ' border-current ring-2 ring-offset-2 dark:ring-offset-slate-900 transform scale-105' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-md'}`}
                        >
                            <div className="text-4xl animate-bounce-slow">{mood.icon}</div>
                            <span className="font-bold text-gray-800 dark:text-white text-sm">{mood.label}</span>
                            {isSelected && (
                                <div className={`absolute inset-0 opacity-10 ${colors.split(' ')[0]}`}></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedMoodId && selectedMoodConfig && (
                <div className="animate-pop">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                         Where to go when you're {selectedMoodConfig.label} {selectedMoodConfig.icon}
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {selectedMoodConfig.suggestedLocationIds.map(locId => {
                             const loc = LOCATIONS.find(l => l.id === locId);
                             if (!loc) return null;
                             return (
                                 <div key={loc.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex gap-4 items-center shadow-sm hover:shadow-md transition-all">
                                     <img src={loc.imageUrl} className="w-20 h-20 rounded-lg object-cover" alt={loc.name} />
                                     <div>
                                         <h4 className="font-bold text-gray-900 dark:text-white">{loc.name}</h4>
                                         <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{loc.description}</p>
                                         <Button variant="outline" className="text-xs py-1 h-8" onClick={() => navigate(`/chat/${loc.id}`)}>
                                             Go There
                                         </Button>
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                </div>
            )}
        </>
      )}

      {activeTab === 'matches' && (
        <div className="animate-reveal">
            {!selectedMoodId ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-slate-400">Set your mood first to find matches!</p>
                </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-600">
                    <div className="text-4xl mb-4">🦗</div>
                    <h3 className="font-bold text-gray-900 dark:text-white">It's quiet... too quiet.</h3>
                    <p className="text-gray-500 dark:text-slate-400">No one matches your vibe right now. Try a different mood or check back later!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">Top Matches ({matches.length})</h3>
                        <span className="text-sm text-gray-500 dark:text-slate-400">Sorted by Vibe Score</span>
                    </div>
                    {matches.map(({ user, score, reasons }) => {
                         const userMood = MOODS.find(m => m.id === user.currentMood);
                         const scoreColor = score >= 80 ? 'text-green-600 dark:text-green-400' : score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400';
                         const barColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

                         return (
                             <Card key={user.id} className="flex flex-col md:flex-row items-center gap-4 transition-transform hover:scale-[1.01]">
                                 <div className="relative shrink-0">
                                     <img src={user.avatarUrl} className="w-16 h-16 rounded-full bg-gray-200 dark:bg-slate-600" alt={user.name} />
                                     <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-700 rounded-full p-1 shadow text-lg" title={userMood?.label}>
                                         {userMood?.icon}
                                     </div>
                                 </div>
                                 
                                 <div className="flex-1 text-center md:text-left w-full">
                                     <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1 justify-center md:justify-start">
                                         <h4 className="font-bold text-lg text-gray-900 dark:text-white">{user.name}</h4>
                                         <Badge color="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs">{user.department}</Badge>
                                     </div>
                                     <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-2">
                                         {reasons.map(r => (
                                             <span key={r} className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{r}</span>
                                         ))}
                                     </div>
                                     {/* Compatibility Bar */}
                                     <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 mb-1">
                                         <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${score}%` }}></div>
                                     </div>
                                     <p className={`text-xs font-bold text-right ${scoreColor}`}>{score}% Match</p>
                                 </div>

                                 <div className="flex gap-2 w-full md:w-auto">
                                     <Button className="flex-1 md:flex-none" onClick={() => handleConnect(user.id)}>
                                         <UserPlus size={18} /> Connect
                                     </Button>
                                     <Button variant="secondary" className="flex-1 md:flex-none" onClick={() => navigate(`/chat/${StorageService.getDmRoomId(currentUser.id, user.id)}`)}>
                                         <MessageCircle size={18} />
                                     </Button>
                                 </div>
                             </Card>
                         );
                    })}
                </div>
            )}
        </div>
      )}
    </div>
  );
};