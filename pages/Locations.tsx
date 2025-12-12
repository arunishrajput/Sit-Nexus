import React from 'react';
import { LOCATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Map, ExternalLink } from 'lucide-react';
import { LocationInfo } from '../types';

export const Locations: React.FC = () => {
  const navigate = useNavigate();

  const campusLocations = LOCATIONS.filter(l => l.category === 'campus');
  const outsideLocations = LOCATIONS.filter(l => l.category === 'outside');

  const LocationGrid = ({ items }: { items: LocationInfo[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(loc => (
        <div 
          key={loc.id} 
          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col h-full group"
        >
          <div className="h-48 overflow-hidden relative">
             <img src={loc.imageUrl} alt={loc.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
             <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold">{loc.name}</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <p className="text-gray-600 dark:text-slate-300 mb-6 flex-1">{loc.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                <Users size={16} />
                <span>Open Chat</span>
              </div>
              <button 
                onClick={() => navigate(`/chat/${loc.id}`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <MessageSquare size={16} />
                {loc.id === 'other_outside' ? 'Suggest / Join' : 'Enter Room'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore Locations</h1>
        <p className="text-gray-500 dark:text-slate-400">Connect with students at campus hotspots or plan a getaway.</p>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
           <Map className="text-indigo-600 dark:text-indigo-400" />
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Inside College</h2>
        </div>
        <LocationGrid items={campusLocations} />
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
           <ExternalLink className="text-indigo-600 dark:text-indigo-400" />
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Outside Hangouts</h2>
        </div>
        <p className="mb-4 text-gray-600 dark:text-slate-400">Want to go somewhere else? Join the <strong>Custom Destination</strong> room to propose new trips!</p>
        <LocationGrid items={outsideLocations} />
      </div>
    </div>
  );
};