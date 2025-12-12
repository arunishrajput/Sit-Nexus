
import React, { useEffect, useState } from 'react';
import { User, Meetup, LocationId } from '../types';
import { StorageService } from '../services/storage';
import { LOCATIONS } from '../constants';
import { Card, Button, Badge } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ArrowRight, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [meetups, setMeetups] = useState<Meetup[]>([]);

  useEffect(() => {
    // Get recent meetups
    const fetchMeetups = async () => {
      const allMeetups = await StorageService.getMeetups();
      const upcoming = allMeetups
        .filter(m => m.startTime > Date.now())
        .sort((a, b) => a.startTime - b.startTime)
        .slice(0, 3);
      setMeetups(upcoming);
    };
    fetchMeetups();
  }, []);

  const handleLocationSelect = (locId: string) => {
    const updatedUser = { ...currentUser, currentLocationId: locId };
    StorageService.saveUser(updatedUser);
    navigate(`/chat/${locId}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {currentUser.name}!</h1>
        <p className="text-gray-500 dark:text-slate-400">Here is what's happening on campus today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed / Activity */}
        <div className="lg:col-span-2 space-y-8">
           {/* Quick Actions */}
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-6 flex flex-col gap-2 border-dashed border-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:border-slate-600 dark:text-slate-200" onClick={() => navigate('/mystery')}>
                <span className="text-2xl">🎲</span>
                <span className="text-sm font-bold">Mystery Meet</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex flex-col gap-2 border-dashed border-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:border-slate-600 dark:text-slate-200" onClick={() => navigate('/vibes')}>
                <span className="text-2xl">⚡</span>
                <span className="text-sm font-bold">Vibe Check</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex flex-col gap-2 border-dashed border-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:border-slate-600 dark:text-slate-200" onClick={() => navigate('/quests')}>
                <span className="text-2xl">🏆</span>
                <span className="text-sm font-bold">Daily Quests</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex flex-col gap-2 border-dashed border-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:border-slate-600 dark:text-slate-200" onClick={() => navigate('/people')}>
                <span className="text-2xl">👥</span>
                <span className="text-sm font-bold">Find People</span>
              </Button>
           </div>

           {/* Upcoming Meetups */}
           <section>
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <Calendar className="text-indigo-600 dark:text-indigo-400" size={20} />
                 Upcoming Meetups
               </h2>
               <Button variant="ghost" onClick={() => navigate('/feed')} className="text-sm">View All</Button>
             </div>
             
             <div className="space-y-4">
               {meetups.length === 0 ? (
                 <Card className="text-center py-8">
                   <p className="text-gray-500 dark:text-slate-400">No upcoming meetups. Why not plan one?</p>
                   <Button className="mt-4" onClick={() => navigate('/locations')}>Browse Locations</Button>
                 </Card>
               ) : (
                 meetups.map(meetup => {
                   const loc = LOCATIONS.find(l => l.id === meetup.locationId);
                   return (
                     <Card key={meetup.id} className="flex flex-row items-center gap-4 transition-transform hover:scale-[1.01] cursor-pointer" >
                       <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex flex-col items-center justify-center text-indigo-700 dark:text-indigo-300 shrink-0">
                          <span className="text-xs font-bold uppercase">{format(new Date(meetup.startTime), 'MMM')}</span>
                          <span className="text-xl font-bold">{format(new Date(meetup.startTime), 'd')}</span>
                       </div>
                       <div className="flex-1" onClick={() => navigate(`/chat/${meetup.locationId}`)}>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{meetup.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                            <Badge color="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">{loc?.name}</Badge>
                            <span>• {format(new Date(meetup.startTime), 'h:mm a')}</span>
                          </div>
                       </div>
                       <Button variant="secondary" onClick={() => navigate(`/chat/${meetup.locationId}`)}>Join</Button>
                     </Card>
                   );
                 })
               )}
             </div>
           </section>
        </div>

        {/* Sidebar / Locations */}
        <div className="space-y-8">
           <Card title="Where are you?" className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none">
             <p className="text-indigo-100 mb-4 text-sm">Check in to see who is around you right now.</p>
             <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {LOCATIONS.filter(l => l.category === 'campus').map(loc => (
                  <button 
                    key={loc.id}
                    onClick={() => handleLocationSelect(loc.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${currentUser.currentLocationId === loc.id ? 'bg-white text-indigo-700 font-bold' : 'hover:bg-white/10 text-indigo-50'}`}
                  >
                    <span>{loc.name}</span>
                    {currentUser.currentLocationId === loc.id && <MapPin size={14} />}
                  </button>
                ))}
             </div>
           </Card>

           <Card title="Popular Spots">
              <div className="space-y-4">
                 {LOCATIONS.slice(0, 3).map(loc => (
                   <div key={loc.id} className="group cursor-pointer" onClick={() => navigate(`/chat/${loc.id}`)}>
                      <div className="relative h-24 rounded-lg overflow-hidden mb-2">
                        <img src={loc.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={loc.name} />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">{loc.name}</h4>
                        <ArrowRight size={14} className="text-gray-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
