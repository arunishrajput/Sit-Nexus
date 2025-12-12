
import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { Button, Input } from '../components/ui';
import { DEPARTMENTS, YEARS } from '../constants';

interface AuthProps {
  onLogin: (user: User) => void;
}

// Custom Logo Component for Auth
const NexusLogoLarge = () => (
  <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-6 mb-4">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  </div>
);

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    name: '',
    department: DEPARTMENTS[0],
    year: YEARS[0],
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await StorageService.login(formData.email, formData.password);
        onLogin(user);
      } else {
        if (!formData.email || !formData.username || !formData.name || !formData.password) {
          setError('Please fill in all required fields.');
          setLoading(false);
          return;
        }

        const user = await StorageService.signup(formData.email, formData.password, {
          username: formData.username,
          name: formData.name,
          department: formData.department,
          year: formData.year,
          bio: 'I am new here!',
          interests: [],
          avatarUrl: `https://ui-avatars.com/api/?name=${formData.name}&background=random`,
        });
        onLogin(user);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="mb-8 text-center flex flex-col items-center">
        <NexusLogoLarge />
        <h1 className="text-5xl font-brand font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
          SIT Nexus
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-3 text-lg">The connected campus experience.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 w-full max-w-md">
        <div className="flex mb-6 border-b border-gray-100 dark:border-slate-700">
          <button
            className={`flex-1 pb-3 font-medium transition-colors ${isLogin ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-400 dark:text-slate-500'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 pb-3 font-medium transition-colors ${!isLogin ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-400 dark:text-slate-500'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email"
            name="email"
            type="email" 
            placeholder="student@sit.edu"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          {!isLogin && (
            <>
               <Input 
                label="Username"
                name="username"
                type="text" 
                placeholder="cool_student"
                value={formData.username}
                onChange={handleChange}
                required
              />
               <Input 
                label="Full Name"
                name="name"
                type="text" 
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Department</label>
                  <select 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Year</label>
                  <select 
                    name="year" 
                    value={formData.year} 
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <Input 
            label="Password"
            name="password"
            type="password" 
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <Button type="submit" className="w-full mt-2" isLoading={loading}>
            {isLogin ? 'Login' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
};
