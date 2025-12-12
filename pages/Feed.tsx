
import React, { useEffect, useState } from 'react';
import { Meetup, LocationId, User } from '../types';
import { StorageService } from '../services/storage';
import { LOCATIONS } from '../constants';
import { Card, Button, Badge } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Search } from 'lucide-react';
import { format } from 'date-fns';

interface FeedProps {
    currentUser: User;
}

export const Feed: React.FC<FeedProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchMeetups = async () => {
        const all = await StorageService.getMeetups();
        setMeetups(all.sort((a, b) => a.startTime - b.startTime));
    };
    fetchMeetups();
  }, []);

  const filteredMeetups = meetups.filter(m => 
      m.title.toLowerCase().includes(filter.toLowerCase()) || 
      m.description.toLowerCase().includes(filter.toLowerCase())
  );

  const handleJoin = async (meetupId: string) => {
    await StorageService.joinMeetup(meetupId, currentUser.id);
    const updated = await StorageService.getMeetups();
    setMeetups(updated.sort((a, b) => a.startTime - b.startTime));
    
    // Redirect to the chat room
    const m = updated.find(x => x.id === meetupId);
    if(m) navigate(`/chat/${m.locationId}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campus Events Feed</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">See what's happening right now.</p>
      </div>

      <div className="mb-8 relative">
        <input 
            type="text" 
            placeholder="Search events..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-400 dark:placeholder-slate-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
        />
        <Search className="absolute left-3 top-3.5 text-gray-400 dark:text-slate-500" size={20} />
      </div>

      <div className="space-y-4">
        {filteredMeetups.length === 0 && (
            <div className="text-center py-10 text-gray-400 dark:text-slate-500">No events found.</div>
        )}
        {filteredMeetups.map(meetup => {
          const loc = LOCATIONS.find(l => l.id === meetup.locationId);
          const isParticipant = meetup.participants.includes(currentUser.id);

          return (
            <div key={meetup.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
               <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-32 md:h-auto bg-gray-200 dark:bg-slate-700 shrink-0">
                    <img src={loc?.imageUrl} className="w-full h-full object-cover" alt="Location" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 mb-2 inline-block">{loc?.name}</Badge>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{meetup.title}</h3>
                            </div>
                            <div className="text-right shrink-0 bg-gray-50 dark:bg-slate-700 p-2 rounded-lg">
                                <span className="block text-sm font-bold text-gray-900 dark:text-white">{format(new Date(meetup.startTime), 'MMM d')}</span>
                                <span className="block text-xs text-gray-500 dark:text-slate-300">{format(new Date(meetup.startTime), 'h:mm a')}</span>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-slate-300 mt-2 text-sm">{meetup.description}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Hosted by {meetup.creatorName}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                            <Users size={16} />
                            <span>{meetup.participants.length} attending</span>
                        </div>
                        <Button 
                            onClick={() => handleJoin(meetup.id)} 
                            variant={isParticipant ? "secondary" : "primary"}
                            disabled={isParticipant}
                        >
                            {isParticipant ? 'Joined' : 'Join Event'}
                        </Button>
                    </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
