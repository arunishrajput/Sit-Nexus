
import React, { useEffect, useState } from 'react';
import { User, LocationId, Connection } from '../types';
import { StorageService } from '../services/storage';
import { LOCATIONS } from '../constants';
import { Card, Button, Badge, Input, Modal } from '../components/ui';
import { MapPin, UserPlus, Check, Clock, MessageCircle, ShieldAlert, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PeopleProps {
  currentUser: User;
}

export const People: React.FC<PeopleProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'nearby'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [search, setSearch] = useState('');
  
  // Reporting state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<User | null>(null);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const allUsers = await StorageService.getUsers();
      const others = allUsers.filter(u => u.id !== currentUser.id);
      setUsers(others);
      
      const userConnections = await StorageService.getConnections(currentUser.id);
      setConnections(userConnections);

      filterUsers(others, activeTab, search);
    };
    fetchData();
  }, [currentUser, activeTab]);

  const filterUsers = (all: User[], tab: string, searchTerm: string) => {
    let result = all;

    // Tab Filter
    if (tab === 'nearby' && currentUser.currentLocationId) {
      result = result.filter(u => u.currentLocationId === currentUser.currentLocationId);
    } else if (tab === 'nearby' && !currentUser.currentLocationId) {
      result = []; // Show prompt to check in
    }

    // Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(lower) || 
        u.department.toLowerCase().includes(lower) ||
        u.interests.some(i => i.toLowerCase().includes(lower))
      );
    }

    setFilteredUsers(result);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    filterUsers(users, activeTab, e.target.value);
  };

  const getConnection = (otherUserId: string) => {
    return connections.find(c => 
      (c.requesterId === currentUser.id && c.receiverId === otherUserId) || 
      (c.requesterId === otherUserId && c.receiverId === currentUser.id)
    );
  };

  const handleConnect = async (otherUserId: string) => {
    await StorageService.sendConnectionRequest(currentUser.id, otherUserId);
    const updated = await StorageService.getConnections(currentUser.id);
    setConnections(updated);
  };

  const handleAccept = async (otherUserId: string) => {
    const conn = getConnection(otherUserId);
    if (conn) {
      await StorageService.updateConnectionStatus(conn.id, 'accepted');
      const updated = await StorageService.getConnections(currentUser.id);
      setConnections(updated);
    }
  };

  const handleDecline = async (otherUserId: string) => {
    const conn = getConnection(otherUserId);
    if (conn) {
      await StorageService.updateConnectionStatus(conn.id, 'rejected');
      const updated = await StorageService.getConnections(currentUser.id);
      setConnections(updated);
    }
  };

  const handleMessage = (otherUserId: string) => {
    const dmId = StorageService.getDmRoomId(currentUser.id, otherUserId);
    navigate(`/chat/${dmId}`);
  };

  const openReport = (user: User) => {
    setReportTarget(user);
    setReportModalOpen(true);
  };

  const submitReport = () => {
    if (reportTarget && reportReason) {
      StorageService.submitReport({
        id: crypto.randomUUID(),
        reporterId: currentUser.id,
        targetId: reportTarget.id,
        targetType: 'user',
        reason: reportReason,
        timestamp: Date.now(),
        status: 'open'
      });
      setReportModalOpen(false);
      setReportReason('');
      setReportTarget(null);
      alert('Report submitted. Thank you for keeping SIT Connect safe.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">People</h1>
          <p className="text-gray-500 dark:text-slate-400">Discover students and build your network.</p>
        </div>
        <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
           <button 
             onClick={() => setActiveTab('all')}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
           >
             All Students
           </button>
           <button 
             onClick={() => setActiveTab('nearby')}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'nearby' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
           >
             <MapPin size={14} />
             Nearby
           </button>
        </div>
      </div>

      <div className="mb-6">
        <Input placeholder="Search by name, department, or interest..." value={search} onChange={handleSearch} />
      </div>

      {activeTab === 'nearby' && !currentUser.currentLocationId && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-100 dark:border-yellow-900/30 text-center mb-6">
          <MapPin size={32} className="mx-auto text-yellow-600 dark:text-yellow-500 mb-2" />
          <h3 className="font-bold text-yellow-800 dark:text-yellow-400">You are not checked in!</h3>
          <p className="text-yellow-700 dark:text-yellow-500 mb-4">Select your location in the Dashboard to see who is nearby.</p>
          <Button onClick={() => navigate('/dashboard')} variant="secondary">Go to Dashboard</Button>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 border-dashed">
           <p className="text-gray-500 dark:text-slate-400">No students found.</p>
           {activeTab === 'nearby' && currentUser.currentLocationId && <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Be the first to check in here!</p>}
           {activeTab === 'all' && <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Invite your friends to sign up!</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => {
           const connection = getConnection(user.id);
           const status = connection?.status;
           const isRequester = connection?.requesterId === currentUser.id;
           const locationName = LOCATIONS.find(l => l.id === user.currentLocationId)?.name;

           return (
             <Card key={user.id} className="flex flex-col h-full">
               <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <img src={user.avatarUrl} className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-600" alt={user.name} />
                   <div>
                     <h3 className="font-bold text-gray-900 dark:text-white">{user.name}</h3>
                     <p className="text-xs text-gray-500 dark:text-slate-400">{user.department} • {user.year}</p>
                   </div>
                 </div>
                 <button onClick={() => openReport(user)} className="text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400" title="Report User">
                   <ShieldAlert size={16} />
                 </button>
               </div>
               
               <p className="text-sm text-gray-600 dark:text-slate-300 mb-3 flex-1">"{user.bio}"</p>
               
               <div className="flex flex-wrap gap-1 mb-4">
                 {user.interests.slice(0, 3).map((i, idx) => (
                   <span key={idx} className="text-[10px] bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full text-gray-600 dark:text-slate-300">{i}</span>
                 ))}
               </div>

               {locationName && (
                 <div className="mb-4 flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                   <MapPin size={12} />
                   At {locationName}
                 </div>
               )}

               <div className="pt-4 border-t border-gray-100 dark:border-slate-700 mt-auto">
                 {/* Case 1: No Connection or Rejected - Show Connect */}
                 {(!status || status === 'rejected') && (
                   <Button onClick={() => handleConnect(user.id)} className="w-full text-sm" variant="outline">
                     <UserPlus size={16} /> Connect
                   </Button>
                 )}

                 {/* Case 2: Pending & I sent it - Show Pending Disabled */}
                 {status === 'pending' && isRequester && (
                    <Button className="w-full text-sm bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 cursor-default" variant="ghost">
                        <Clock size={16} /> Pending
                    </Button>
                 )}

                 {/* Case 3: Pending & They sent it - Show Accept / Decline */}
                 {status === 'pending' && !isRequester && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleAccept(user.id)} variant="primary" className="flex-1 text-sm">
                         Accept
                      </Button>
                      <Button onClick={() => handleDecline(user.id)} variant="outline" className="flex-1 text-sm border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10">
                         Decline
                      </Button>
                    </div>
                 )}

                 {/* Case 4: Accepted - Show Message */}
                 {status === 'accepted' && (
                   <Button onClick={() => handleMessage(user.id)} className="w-full text-sm">
                     <MessageCircle size={16} /> Message
                   </Button>
                 )}
               </div>
             </Card>
           );
        })}
      </div>

      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report User">
         <p className="mb-4 text-sm text-gray-600 dark:text-slate-300">Why are you reporting {reportTarget?.name}?</p>
         <textarea 
           className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg p-2 h-32 mb-4 focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400 dark:placeholder-slate-500"
           placeholder="Describe the issue..."
           value={reportReason}
           onChange={(e) => setReportReason(e.target.value)}
         />
         <Button variant="danger" onClick={submitReport} className="w-full">Submit Report</Button>
      </Modal>
    </div>
  );
};
