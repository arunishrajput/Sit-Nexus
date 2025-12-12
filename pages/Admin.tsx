
import React, { useEffect, useState } from 'react';
import { Report } from '../types';
import { StorageService } from '../services/storage';
import { Card, Badge, Button, Modal } from '../components/ui';
import { ShieldAlert, CheckCircle, Trash2, Database, Zap } from 'lucide-react';

export const Admin: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  // Use a derived value or simple state, but avoid setting it before a reload to prevent UI flicker/crash
  const isDemo = StorageService.isDemoMode();
  
  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    actionLabel: string;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    actionLabel: '',
  });

  useEffect(() => {
    setReports(StorageService.getReports());
  }, []);

  const resolveReport = (id: string) => {
    alert('Report marked as resolved. Content would be removed in a real system.');
  };

  const handleToggleDemo = () => {
    if (isDemo) {
        setConfirmModal({
            isOpen: true,
            title: 'Disable Demo Mode?',
            message: 'This will remove all demo users, fake messages, and generated events. Your personal account and history will be preserved.',
            actionLabel: 'Switch to Live Mode',
            onConfirm: () => {
                // IMPORTANT: Do not update local state here. 
                // The storage service will reload the page, which is the cleanest way to reset the app state.
                StorageService.removeDemoData();
            }
        });
    } else {
        const currentUser = StorageService.getCurrentUser();
        StorageService.seedDemoData(currentUser?.id);
        // Page reloads in seedDemoData
    }
  };

  const handleFactoryReset = () => {
    setConfirmModal({
        isOpen: true,
        title: 'Factory Reset?',
        message: '⚠️ This will wipe ALL data including your account, messages, and settings. This cannot be undone.',
        actionLabel: 'Reset Everything',
        isDanger: true,
        onConfirm: () => {
            StorageService.clearAllData();
        }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Moderation Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
               <ShieldAlert size={24} />
          </div>
          <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Moderation Dashboard</h1>
              <p className="text-gray-500 dark:text-slate-400">Review reported content and users.</p>
          </div>
        </div>

        {reports.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl text-center border border-gray-200 dark:border-slate-700">
                <CheckCircle size={40} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Clear!</h3>
                <p className="text-gray-500 dark:text-slate-400">There are no pending reports.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {reports.map(report => (
                    <Card key={report.id} className="flex justify-between items-start gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge color="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold uppercase">{report.targetType}</Badge>
                                <span className="text-xs text-gray-400 dark:text-slate-500">{new Date(report.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white mb-1">Reason: <span className="font-normal">{report.reason}</span></p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Reporter ID: {report.reporterId} • Target ID: {report.targetId}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => resolveReport(report.id)} className="text-sm">Dismiss</Button>
                            <Button variant="danger" onClick={() => resolveReport(report.id)} className="text-sm">
                               <Trash2 size={16} /> Ban/Delete
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        )}
      </div>

      {/* Developer Tools Section */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
               <Database size={24} />
          </div>
          <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Developer Settings</h2>
              <p className="text-gray-500 dark:text-slate-400">Manage environment data.</p>
          </div>
        </div>
        
        <div className="space-y-4">
            <Card className={`flex flex-col md:flex-row gap-6 items-center justify-between p-6 border-2 transition-colors ${isDemo ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                <Zap className={isDemo ? "text-indigo-600 fill-indigo-600" : "text-gray-400"} size={20} /> 
                {isDemo ? 'Demo Mode Active' : 'Live Mode'}
                </h3>
                <p className="text-gray-600 dark:text-slate-300 mt-1 max-w-md text-sm">
                {isDemo 
                    ? "The app is populated with dummy users, chats, and events for testing purposes."
                    : "The app is currently clean. Inject demo data to test AI features and social interactions."}
                </p>
            </div>
            <div className="flex flex-col gap-2 min-w-[200px]">
                <Button 
                    onClick={handleToggleDemo} 
                    className={`w-full ${isDemo ? 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                    {isDemo ? (
                        <>Switch to Live Mode</>
                    ) : (
                        <>Switch to Demo Mode</>
                    )}
                </Button>
            </div>
            </Card>

            <Card className="flex flex-col md:flex-row gap-6 items-center justify-between p-6 border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                <div>
                    <h3 className="font-bold text-red-700 dark:text-red-400 text-lg flex items-center gap-2">
                        <Trash2 size={20} /> Danger Zone
                    </h3>
                    <p className="text-red-600/80 dark:text-red-400/80 mt-1 text-sm">
                        Perform a factory reset to wipe all data, including your current account.
                    </p>
                </div>
                <Button onClick={handleFactoryReset} variant="danger" className="whitespace-nowrap">
                    Factory Reset App
                </Button>
            </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
        title={confirmModal.title}
      >
        <div className="mb-6">
            <p className="text-gray-700 dark:text-slate-300">{confirmModal.message}</p>
        </div>
        <div className="flex gap-4">
            <Button variant="outline" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="flex-1">
                Cancel
            </Button>
            <Button 
                variant={confirmModal.isDanger ? "danger" : "primary"} 
                onClick={confirmModal.onConfirm} 
                className="flex-1"
            >
                {confirmModal.actionLabel}
            </Button>
        </div>
      </Modal>

    </div>
  );
};
