
import React, { useEffect, useState } from 'react';
import { User, UserQuest, Badge as BadgeType, Quest } from '../types';
import { StorageService } from '../services/storage';
import { QUESTS, BADGES, LEVEL_THRESHOLDS } from '../constants';
import { Button, Card, Badge } from '../components/ui';
import { Trophy, CheckCircle, MapPin, Camera, MessageSquare, Star, Flame, Lock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuestsProps {
  currentUser: User;
}

export const Quests: React.FC<QuestsProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [userQuests, setUserQuests] = useState<UserQuest[]>([]);
  const [loadingVerify, setLoadingVerify] = useState<string | null>(null); // Quest ID
  const [confetti, setConfetti] = useState(false);
  const [xpFloat, setXpFloat] = useState<{ val: number, id: string } | null>(null);

  useEffect(() => {
    const loadQuests = async () => {
        // 1. Ensure Quests are assigned
        await StorageService.assignDailyQuests(currentUser.id);
        
        // 2. Load Quests
        const quests = await StorageService.getUserQuests(currentUser.id);
        setUserQuests(quests);
    };
    loadQuests();
  }, [currentUser.id]);

  const handleVerify = (userQuestId: string) => {
    setLoadingVerify(userQuestId);
    
    // Simulate API delay / Processing
    setTimeout(async () => {
        const result = await StorageService.verifyQuest(currentUser, userQuestId);
        
        if (result.success) {
            // Trigger Animation
            setConfetti(true);
            const updatedQuests = await StorageService.getUserQuests(currentUser.id);
            const uq = updatedQuests.find(u => u.id === userQuestId);
            const questXp = QUESTS.find(q => q.id === uq?.questId)?.xp || 0;

            setXpFloat({ val: questXp, id: userQuestId });
            setTimeout(() => {
                setConfetti(false);
                setXpFloat(null);
            }, 3000);
            
            // Reload State
            setUserQuests(updatedQuests);
        } else {
            alert(result.message);
        }
        setLoadingVerify(null);
    }, 1500);
  };

  // Calculations
  const currentXp = currentUser.xp || 0;
  const currentLevel = currentUser.level || 1;
  const nextLevelXp = LEVEL_THRESHOLDS[currentLevel] || 99999;
  const prevLevelXp = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const progressPercent = Math.min(100, Math.max(0, ((currentXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Gamification Animations */}
      {confetti && <ConfettiOverlay />}
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* XP Card */}
        <div className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-bold flex items-center gap-2">
                            Level {currentLevel} <Flame className="text-orange-400 fill-orange-400" />
                        </h2>
                        <p className="text-indigo-100">Campus Explorer</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{currentXp} <span className="text-sm font-normal text-indigo-200">XP</span></p>
                        <p className="text-xs text-indigo-200">Next Level: {nextLevelXp} XP</p>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-black/20 rounded-full h-3 mb-2">
                    <div 
                        className="bg-yellow-400 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>
            {/* Background Decoration */}
            <Trophy className="absolute -bottom-6 -right-6 text-white/10 w-48 h-48" />
        </div>

        {/* Badges Summary */}
        <div className="w-full md:w-1/3 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Star className="text-yellow-500 fill-yellow-500" size={18}/> Badges
            </h3>
            <div className="flex flex-wrap gap-2">
                {(currentUser.badges || []).length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-slate-500">No badges yet. Keep questing!</p>
                ) : (
                    (currentUser.badges || []).map(bId => {
                        const badge = BADGES.find(b => b.id === bId);
                        return badge ? (
                            <div key={bId} className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xl shadow-sm" title={badge.name}>
                                {badge.icon}
                            </div>
                        ) : null;
                    })
                )}
            </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Daily Quests</h2>
      <div className="grid gap-4">
        {userQuests.length === 0 && <p className="text-gray-500 dark:text-slate-400">No quests active.</p>}
        {userQuests.map(uq => {
            const q = QUESTS.find(qdef => qdef.id === uq.questId);
            if (!q) return null;

            const isCompleted = uq.status === 'completed';
            const isFloating = xpFloat?.id === uq.id;

            return (
                <div key={uq.id} className={`bg-white dark:bg-slate-800 rounded-xl p-5 border transition-all duration-300 relative ${isCompleted ? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-200 dark:border-slate-700 hover:shadow-md'}`}>
                    {/* Floating XP Animation */}
                    {isFloating && (
                        <div className="absolute top-0 right-10 text-yellow-500 font-bold text-2xl animate-float-text pointer-events-none">
                            +{xpFloat.val} XP
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${isCompleted ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'}`}>
                                {getCategoryIcon(q.category)}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{q.title}</h3>
                                <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">{q.description}</p>
                                <div className="flex gap-2">
                                    <Badge color="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-bold">+{q.xp} XP</Badge>
                                    <Badge color="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 capitalize">{q.difficulty}</Badge>
                                    <Badge color="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 capitalize">{q.category}</Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            {isCompleted ? (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg animate-pop">
                                    <CheckCircle size={20} /> Done
                                </div>
                            ) : (
                                <Button 
                                    onClick={() => handleVerify(uq.id)} 
                                    isLoading={loadingVerify === uq.id}
                                    variant="outline"
                                    className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                >
                                    Verify
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Badge Collection</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {BADGES.map(badge => {
            const isUnlocked = (currentUser.badges || []).includes(badge.id);
            return (
                <div key={badge.id} className={`bg-white dark:bg-slate-800 p-4 rounded-xl border flex flex-col items-center text-center ${isUnlocked ? 'border-yellow-200 dark:border-yellow-900/50 shadow-sm' : 'border-gray-100 dark:border-slate-700 opacity-60 grayscale'}`}>
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{badge.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{badge.description}</p>
                    {!isUnlocked && <Lock size={12} className="mt-2 text-gray-400 dark:text-slate-500" />}
                </div>
            );
        })}
      </div>
    </div>
  );
};

const getCategoryIcon = (cat: string) => {
    switch (cat) {
        case 'location': return <MapPin size={24} />;
        case 'social': return <MessageSquare size={24} />;
        case 'photo': return <Camera size={24} />;
        case 'group': return <Users size={24} />;
        default: return <Star size={24} />;
    }
}

const ConfettiOverlay = () => {
    // Generate random confetti pieces
    const pieces = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100 + 'vw',
        delay: Math.random() * 0.5 + 's',
        color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][Math.floor(Math.random() * 4)]
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map(p => (
                <div 
                    key={p.id} 
                    className="confetti-piece"
                    style={{ 
                        left: p.left, 
                        animationDelay: p.delay,
                        backgroundColor: p.color
                    }}
                />
            ))}
        </div>
    );
};
