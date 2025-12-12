import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Message, Meetup, LocationId } from '../types';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/gemini';
import { LOCATIONS } from '../constants';
import { Button, Input, Card, Badge } from '../components/ui';
import { Send, Users, Plus, BrainCircuit, X } from 'lucide-react';
import { format } from 'date-fns';

interface ChatProps {
  currentUser: User;
  view?: 'room' | 'list';
}

export const Chat: React.FC<ChatProps> = ({ currentUser, view = 'room' }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  
  // Meetup Plan State
  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [newMeetupTitle, setNewMeetupTitle] = useState('');
  const [newMeetupTime, setNewMeetupTime] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Initialize Data
  useEffect(() => {
    setUsers(StorageService.getUsers().filter(u => u.id !== currentUser.id));
  }, [currentUser.id]);

  useEffect(() => {
    if (!roomId) return;

    // Load messages immediately
    const msgs = StorageService.getMessages(roomId);
    setMessages(msgs);
    
    // Load Meetups if it's a location
    if (Object.values(LocationId).includes(roomId as LocationId)) {
        setMeetups(StorageService.getMeetups(roomId));
    }

    // Polling for demo "real-time" (Simulating socket)
    const interval = setInterval(() => {
      const latest = StorageService.getMessages(roomId);
      if (latest.length !== msgs.length) {
         setMessages(latest);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [roomId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !roomId) return;
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: inputText.trim(),
      timestamp: Date.now(),
      readBy: []
    };

    StorageService.sendMessage(newMessage);
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const handleCreateMeetup = () => {
    if (!newMeetupTitle || !newMeetupTime || !roomId) return;
    
    const meetup: Meetup = {
      id: crypto.randomUUID(),
      title: newMeetupTitle,
      description: 'Join us!',
      locationId: roomId,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      startTime: new Date(newMeetupTime).getTime(),
      participants: [currentUser.id]
    };
    
    StorageService.createMeetup(meetup);
    setMeetups([...meetups, meetup]);
    setShowMeetupModal(false);
    
    // Announce in chat
    const announcement: Message = {
      id: crypto.randomUUID(),
      roomId,
      senderId: 'system',
      senderName: 'SIT Bot',
      text: `📅 New Meetup Created: ${meetup.title} at ${format(meetup.startTime, 'h:mm a')}`,
      timestamp: Date.now(),
      readBy: []
    };
    StorageService.sendMessage(announcement);
    setMessages(prev => [...prev, announcement]);
  };

  const getAiSuggestions = async () => {
    if (!roomId) return;
    setLoadingSuggestions(true);
    const suggestions = await GeminiService.suggestMeetupIdeas(roomId as LocationId);
    setAiSuggestions(suggestions);
    setLoadingSuggestions(false);
  };

  // Render "Messages" List View (DM Selector)
  if (view === 'list') {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Messages</h1>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          {users.map(u => (
            <div 
              key={u.id} 
              onClick={() => navigate(`/chat/${StorageService.getDmRoomId(currentUser.id, u.id)}`)}
              className="p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-4"
            >
              <img src={u.avatarUrl} alt={u.name} className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-600" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{u.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Tap to chat</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isLocationRoom = Object.values(LocationId).includes(roomId as LocationId);
  const locationInfo = LOCATIONS.find(l => l.id === roomId);
  const dmPartnerId = !isLocationRoom ? roomId?.replace(currentUser.id, '').replace('_', '') : null;
  const dmPartner = users.find(u => u.id === dmPartnerId);

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
             {isLocationRoom ? (
               <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                 <Users size={20} />
               </div>
             ) : (
                <img src={dmPartner?.avatarUrl} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-600" alt="User" />
             )}
             <div>
               <h2 className="font-bold text-gray-900 dark:text-white">{isLocationRoom ? locationInfo?.name : dmPartner?.name}</h2>
               <p className="text-xs text-gray-500 dark:text-slate-400">{isLocationRoom ? 'Group Chat' : 'Direct Message'}</p>
             </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-800">
          {messages.map((msg) => {
             const isMe = msg.senderId === currentUser.id;
             const isSystem = msg.senderId === 'system';
             
             if (isSystem) {
               return (
                 <div key={msg.id} className="flex justify-center my-2">
                   <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs py-1 px-3 rounded-full">{msg.text}</span>
                 </div>
               );
             }

             return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-none'}`}>
                   {!isMe && <p className="text-xs font-bold mb-1 opacity-70">{msg.senderName}</p>}
                   <p className="text-sm">{msg.text}</p>
                   <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400 dark:text-slate-400'}`}>
                     {format(new Date(msg.timestamp), 'h:mm a')}
                   </p>
                 </div>
               </div>
             );
          })}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex gap-2">
            <Input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="px-3">
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar (Right) - Only for Location Rooms to show Meetups */}
      {isLocationRoom && (
        <div className="w-80 hidden lg:flex flex-col gap-4">
          <Card title="Meetups Here" className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 custom-scrollbar">
              {meetups.length === 0 ? <p className="text-sm text-gray-400 italic">No meetups planned yet.</p> : (
                meetups.map(m => (
                  <div key={m.id} className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">{m.title}</h4>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">{format(new Date(m.startTime), 'h:mm a')} • by {m.creatorName}</p>
                  </div>
                ))
              )}
            </div>
            <Button onClick={() => setShowMeetupModal(true)} className="w-full">
              <Plus size={16} /> Plan Meetup
            </Button>
          </Card>
        </div>
      )}

      {/* Meetup Modal */}
      {showMeetupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Plan a Meetup</h3>
               <button onClick={() => setShowMeetupModal(false)}><X size={24} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1">Activity Title</label>
                <div className="flex gap-2">
                   <Input 
                     value={newMeetupTitle} 
                     onChange={(e) => setNewMeetupTitle(e.target.value)} 
                     placeholder="e.g. Group Lunch"
                   />
                   <Button variant="outline" onClick={getAiSuggestions} isLoading={loadingSuggestions} title="Ask AI for ideas">
                     <BrainCircuit size={18} />
                   </Button>
                </div>
                {aiSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {aiSuggestions.map(s => (
                      <Badge key={s} color="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-pointer" ><span onClick={() => setNewMeetupTitle(s)}>{s}</span></Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1">Time</label>
                <Input 
                  type="datetime-local" 
                  value={newMeetupTime} 
                  onChange={(e) => setNewMeetupTime(e.target.value)}
                  className="dark:text-white dark:[color-scheme:dark]"
                />
              </div>

              <Button onClick={handleCreateMeetup} className="w-full mt-4">Create Plan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};