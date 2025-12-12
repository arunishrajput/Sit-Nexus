import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/gemini';
import { Button, Input, Card, Badge } from '../components/ui';
import { Wand2, Save } from 'lucide-react';

interface ProfileProps {
  currentUser: User;
  onUpdate: (user: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(currentUser);
  const [newInterest, setNewInterest] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleSave = () => {
    StorageService.saveUser(formData);
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (idx: number) => {
    const newInterests = [...formData.interests];
    newInterests.splice(idx, 1);
    setFormData({ ...formData, interests: newInterests });
  };

  const handleAiEnhance = async () => {
    setAiLoading(true);
    const enhancedBio = await GeminiService.enhanceBio(formData);
    setFormData({ ...formData, bio: enhancedBio });
    setAiLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">Edit Profile</Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="shrink-0 relative">
             <img 
              src={formData.avatarUrl} 
              alt={formData.name} 
              className="w-24 h-24 rounded-full object-cover bg-gray-200 dark:bg-slate-600 border-4 border-white dark:border-slate-700 shadow-sm"
            />
          </div>
          <div className="flex-1 w-full space-y-4">
             {isEditing ? (
               <>
                <Input 
                  label="Display Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                  <Input 
                    label="Year"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                  />
                </div>
               </>
             ) : (
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
                 <p className="text-gray-600 dark:text-slate-300">{currentUser.department} • {currentUser.year}</p>
                 <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">@{currentUser.username}</p>
               </div>
             )}
          </div>
        </div>
      </Card>

      <Card title="About Me">
        {isEditing ? (
          <div className="space-y-3">
             <textarea 
               className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
               value={formData.bio}
               onChange={(e) => setFormData({...formData, bio: e.target.value})}
             />
             <Button 
               variant="ghost" 
               onClick={handleAiEnhance} 
               isLoading={aiLoading}
               className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
             >
               <Wand2 size={16} />
               Enhance with Gemini AI
             </Button>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-slate-300 leading-relaxed">{currentUser.bio}</p>
        )}
      </Card>
      
      <div className="h-6"></div>

      <Card title="Interests">
        <div className="flex flex-wrap gap-2 mb-4">
          {formData.interests.map((int, idx) => (
             <Badge key={idx} color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
               {int}
               {isEditing && (
                 <button onClick={() => removeInterest(idx)} className="hover:text-indigo-900 dark:hover:text-indigo-100"><div className="w-3 h-3 text-xs flex items-center justify-center">x</div></button>
               )}
             </Badge>
          ))}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <Input 
              placeholder="Add interest..." 
              value={newInterest} 
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
            />
            <Button onClick={handleAddInterest} variant="secondary">Add</Button>
          </div>
        )}
      </Card>

      {isEditing && (
        <div className="flex gap-4 mt-8">
           <Button onClick={handleSave} className="flex-1">
             <Save size={18} />
             Save Changes
           </Button>
           <Button onClick={() => {
             setFormData(currentUser);
             setIsEditing(false);
           }} variant="outline" className="flex-1">
             Cancel
           </Button>
        </div>
      )}
    </div>
  );
};