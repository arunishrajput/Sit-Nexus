import React from 'react';
import { Notification } from '../types';
import { StorageService } from '../services/storage';
import { useNavigate } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsProps {
  notifications: Notification[];
  onRead: () => void;
}

export const NotificationDropdown: React.FC<NotificationsProps> = ({ notifications, onRead }) => {
  const navigate = useNavigate();

  const handleClick = (note: Notification) => {
    StorageService.markNotificationRead(note.id);
    onRead(); // Refresh parent state
    if (note.link) navigate(note.link);
  };

  const markAllRead = () => {
    notifications.forEach(n => StorageService.markNotificationRead(n.id));
    onRead();
  };

  if (notifications.length === 0) {
    return (
       <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 z-50">
         <p className="text-center text-gray-500 dark:text-slate-400 text-sm">No new notifications</p>
       </div>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 z-50 overflow-hidden">
      <div className="p-3 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
        <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
        <button onClick={markAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Mark all read</button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map(note => (
          <div 
            key={note.id} 
            onClick={() => handleClick(note)}
            className={`p-3 border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer flex gap-3 ${!note.read ? 'bg-indigo-50/30 dark:bg-indigo-500/10' : ''}`}
          >
            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!note.read ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-transparent'}`} />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{note.title}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{note.message}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">{formatDistanceToNow(note.timestamp)} ago</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};