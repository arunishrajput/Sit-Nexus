import React, { useEffect, useState, useRef } from 'react';
import { User, MysteryMeetup, MysteryStatus } from '../types';
import { StorageService } from '../services/storage';
import { LOCATIONS, MYSTERY_HINTS } from '../constants';
import { Button, Card, Badge } from '../components/ui';
import { Sparkles, Clock, MapPin, XCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MysteryProps {
  currentUser: User;
}

export const Mystery: React.FC<MysteryProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [match, setMatch] = useState<MysteryMeetup | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('00:00');
  const [error, setError] = useState('');

  // Polling for updates
  useEffect(() => {
    const fetchMatch = () => {
      const active = StorageService.findMysteryMatch(currentUser.id); // Re-checks existing active
      if (active) {
        setMatch(active);
        const partnerId = active.userAId === currentUser.id ? active.userBId : active.userAId;
        const users = StorageService.getUsers();
        setPartner(users.find(u => u.id === partnerId) || null);
      }
    };
    
    fetchMatch();
    const interval = setInterval(fetchMatch, 3000); // Poll status changes
    return () => clearInterval(interval);
  }, [currentUser.id]);

  // Timer Logic
  useEffect(() => {
    if (!match || match.status === 'completed' || match.status === 'declined' || match.status === 'expired') return;
    
    const tick = () => {
      const now = Date.now();
      const diff = match.expiresAt - now;
      
      if (diff <= 0) {
        StorageService.updateMysteryStatus(match.id, 'expired');
        setTimeLeft('00:00');
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    };

    const timer = setInterval(tick, 1000);
    tick(); // run immediately
    return () => clearInterval(timer);
  }, [match]);

  const startSearch = () => {
    setLoading(true);
    setError('');
    
    // Simulate delay for "Searching" animation
    setTimeout(() => {
      const newMatch = StorageService.findMysteryMatch(currentUser.id);
      if (!newMatch) {
        setLoading(false);
        setError("Not enough explorers online right now. Try again later!");
      } else {
        // Match found!
        setMatch(newMatch);
        const partnerId = newMatch.userAId === currentUser.id ? newMatch.userBId : newMatch.userAId;
        const users = StorageService.getUsers();
        setPartner(users.find(u => u.id === partnerId) || null);
        setLoading(false);
      }
    }, 2000);
  };

  const handleAction = (action: 'accept' | 'decline' | 'arrive') => {
    if (!match) return;
    
    let newStatus: MysteryStatus = match.status;

    if (action === 'accept') {
       newStatus = 'accepted';
       // Mock: Simulate partner accepting after 3s
       setTimeout(() => {
          if (match) StorageService.updateMysteryStatus(match.id, 'accepted');
       }, 3000);
    } else if (action === 'decline') {
       newStatus = 'declined';
    } else if (action === 'arrive') {
       const isA = match.userAId === currentUser.id;
       newStatus = isA ? 'arrived_a' : 'arrived_b';
       
       // Mock: Simulate partner arriving after 5s if accepted
       setTimeout(() => {
          if (match) {
             const updated = StorageService.getMysteryMeetups().find(m => m.id === match.id);
             if (updated && updated.status !== 'completed') {
                const partnerArriveStatus = isA ? 'arrived_b' : 'arrived_a';
                StorageService.updateMysteryStatus(match.id, partnerArriveStatus);
             }
          }
       }, 5000);
    }

    const updated = StorageService.updateMysteryStatus(match.id, newStatus);
    setMatch(updated);
  };

  // --- Render States ---

  // 1. Idle
  if (!match && !loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <div className="animate-float mb-6 bg-indigo-100 dark:bg-indigo-900/30 p-6 rounded-full">
           <Sparkles size={64} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Mystery Meetup</h1>
        <p className="text-gray-500 dark:text-slate-400 max-w-md mb-8">
          Pair with a random student, get a secret location, and meet someone new. 
          Are you adventurous enough?
        </p>
        <Button onClick={startSearch} className="px-8 py-4 text-lg bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 transform transition hover:-translate-y-1">
           Start Exploration
        </Button>
        {error && <p className="mt-4 text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>}
      </div>
    );
  }

  // 2. Searching
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-400 dark:bg-indigo-600 rounded-full opacity-20 animate-ping"></div>
          <div className="relative bg-white dark:bg-slate-800 p-4 rounded-full shadow-xl">
             <SearchRadar />
          </div>
        </div>
        <p className="mt-8 text-lg font-medium text-gray-600 dark:text-slate-300 animate-pulse">Scanning campus for explorers...</p>
      </div>
    );
  }

  // 3. Match Found / Pending
  if (match && match.status === 'pending') {
    return (
      <div className="max-w-md mx-auto pt-10 px-4">
         <Card className="text-center p-8 animate-reveal border-2 border-indigo-100 dark:border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold text-indigo-900 dark:text-white mb-6">Mystery Match Found!</h2>
            
            <div className="flex justify-center items-center gap-8 mb-8">
               <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-slate-600 mx-auto mb-2 overflow-hidden border-4 border-white dark:border-slate-800 shadow-md">
                     <img src={currentUser.avatarUrl} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-gray-700 dark:text-slate-200">You</p>
               </div>
               <div className="text-indigo-300 font-bold text-xl">VS</div>
               <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-2 shadow-lg animate-glow border-4 border-indigo-200 dark:border-indigo-800">
                     {partner?.name.charAt(0)}
                  </div>
                  <p className="font-bold text-gray-700 dark:text-slate-200">???</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{partner?.year}</p>
               </div>
            </div>

            <p className="text-gray-600 dark:text-slate-300 mb-8">
               A student from <span className="font-bold text-indigo-600 dark:text-indigo-400">{partner?.department}</span> wants to meet! 
               Accept to reveal the secret location.
            </p>

            <div className="flex gap-4">
               <Button variant="outline" onClick={() => handleAction('decline')} className="flex-1 border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Decline</Button>
               <Button onClick={() => handleAction('accept')} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Accept Mystery</Button>
            </div>
         </Card>
      </div>
    );
  }

  // 4. Accepted & Active (The Hint Card)
  const isMeArrived = match.status === 'arrived_a' || match.status === 'arrived_b'; // (Simplified check for UI, real logic in handleAction)
  const hintData = MYSTERY_HINTS[match.locationId];
  const realStatus = match.userAId === currentUser.id 
    ? (match.status === 'arrived_a' ? 'Waiting for partner...' : 'Go to location!')
    : (match.status === 'arrived_b' ? 'Waiting for partner...' : 'Go to location!');

  if (['accepted', 'arrived_a', 'arrived_b'].includes(match.status)) {
    return (
      <div className="max-w-md mx-auto pt-6 px-4">
        <div className="bg-indigo-900 text-white rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden animate-reveal">
           {/* Background Decoration */}
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-50px] left-[-50px] w-32 h-32 rounded-full bg-white"></div>
              <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 rounded-full bg-white"></div>
           </div>

           <div className="flex justify-center mb-4">
             <div className="bg-indigo-800 p-2 rounded-full flex items-center gap-2 px-4 shadow-inner">
                <Clock size={16} className="text-indigo-300" />
                <span className="font-mono text-xl font-bold tracking-widest">{timeLeft}</span>
             </div>
           </div>

           <div className="mb-6">
              <div className="text-6xl mb-4 animate-float inline-block">{hintData?.icon || '❓'}</div>
              <h3 className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-2">Secret Location Hint</h3>
              <p className="text-2xl font-bold leading-relaxed italic">"{match.hint}"</p>
           </div>

           {realStatus === 'Waiting for partner...' ? (
             <div className="bg-indigo-800/50 p-4 rounded-xl animate-pulse">
                <p className="font-bold">You have arrived!</p>
                <p className="text-sm text-indigo-300">Waiting for {partner?.name.charAt(0)}... to click the button.</p>
             </div>
           ) : (
             <Button onClick={() => handleAction('arrive')} className="w-full py-4 text-lg bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-lg">
                <MapPin className="mr-2" /> I Have Arrived
             </Button>
           )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Meetup auto-cancels when timer hits zero. Be safe and have fun!
        </p>
      </div>
    );
  }

  // 5. Completed / Revealed
  if (match.status === 'completed') {
    return (
       <div className="max-w-md mx-auto pt-10 px-4">
          <div className="text-center mb-8 animate-reveal">
             <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
             </div>
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mystery Solved!</h2>
             <p className="text-gray-500 dark:text-slate-400">You met at {LOCATIONS.find(l => l.id === match.locationId)?.name}</p>
          </div>

          <Card className="p-6 text-center border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10">
             <img src={partner?.avatarUrl} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-md" />
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">{partner?.name}</h3>
             <p className="text-gray-600 dark:text-slate-300 mb-1">{partner?.department} • {partner?.year}</p>
             <p className="text-gray-500 dark:text-slate-400 italic text-sm mb-6">"{partner?.bio}"</p>
             
             <div className="flex gap-3">
                <Button onClick={() => navigate(`/chat/${StorageService.getDmRoomId(currentUser.id, partner!.id)}`)} className="flex-1">
                   Chat Now
                </Button>
                <Button variant="outline" onClick={() => setMatch(null)} className="flex-1">
                   Home
                </Button>
             </div>
          </Card>
       </div>
    );
  }

  // 6. Expired / Declined
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
       <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-full mb-4">
         <XCircle size={48} className="text-gray-400 dark:text-slate-500" />
       </div>
       <h2 className="text-xl font-bold text-gray-700 dark:text-slate-200 mb-2">
         {match.status === 'expired' ? 'Time Ran Out' : 'Mystery Declined'}
       </h2>
       <p className="text-gray-500 dark:text-slate-400 mb-6">Sometimes the stars don't align. Try again?</p>
       <Button onClick={() => setMatch(null)}>Back to Mystery Hub</Button>
    </div>
  );
};

const SearchRadar = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600 dark:text-indigo-400">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 10 10" className="animate-spin origin-center" />
  </svg>
);