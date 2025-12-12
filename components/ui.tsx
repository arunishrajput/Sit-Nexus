import React from 'react';
import { X } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', isLoading?: boolean }> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  isLoading,
  disabled,
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-gray-800 dark:bg-slate-700 text-white hover:bg-gray-900 dark:hover:bg-slate-600 focus:ring-gray-700 dark:focus:ring-slate-500",
    outline: "border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 focus:ring-gray-400",
    ghost: "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200 focus:ring-gray-400",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 focus:ring-red-500"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || disabled} {...props}>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</label>}
    <input 
      className={`px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 ${className}`}
      {...props}
    />
  </div>
);

export const Card: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 transition-colors ${className}`}>
    {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>}
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode, color?: string, onClick?: () => void }> = ({ children, color = 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200', onClick }) => (
  <span 
    onClick={onClick}
    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
  >
    {children}
  </span>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto relative shadow-2xl border border-gray-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
           <button onClick={onClose}><X size={24} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" /></button>
        </div>
        <div className="text-gray-700 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
};