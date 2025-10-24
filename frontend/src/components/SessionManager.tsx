import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ConfirmDialog from './ConfirmDialog';
import { showToast } from '../utils/toast.tsx';
import { Skeleton, SkeletonCard } from './Skeleton';

interface Session {
  id: string;
  name: string;
  browser?: string;
  device?: string;
  type?: string;
  ip_address?: string;
  created_at: string;
  last_used_at: string | null;
  is_current?: boolean;
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: 'single' | 'all';
    sessionId?: string;
  }>({ isOpen: false, action: 'single' });
  const [isTerminating, setIsTerminating] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/api/sessions');
      setSessions(response.data.sessions);
      setCurrentSession(response.data.current_session);
    } catch (err: any) {
      setError('Failed to load sessions: ' + (err.response?.data?.message || 'Unknown error'));
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const terminateSession = async (id: string) => {
    setIsTerminating(true);
    
    // Optimistic update: remove session from UI immediately
    const originalSessions = [...sessions];
    setSessions(sessions.filter(session => session.id !== id));
    
    try {
      await api.delete(`/api/sessions/${id}`);
      showToast.success('Session terminated successfully');
      // Refresh to ensure sync with backend
      fetchSessions();
    } catch (err: any) {
      // Rollback on error
      setSessions(originalSessions);
      const errorMsg = err.response?.data?.message || 'Unknown error';
      setError('Failed to terminate session: ' + errorMsg);
      showToast.error(errorMsg);
      console.error('Error terminating session:', err);
    } finally {
      setIsTerminating(false);
    }
  };

  const terminateAllOtherSessions = async () => {
    setIsTerminating(true);
    
    // Optimistic update: keep only current session
    const originalSessions = [...sessions];
    const currentSession = sessions.find(s => s.is_current);
    if (currentSession) {
      setSessions([currentSession]);
    }
    
    try {
      await api.delete('/api/sessions');
      showToast.success('All other sessions terminated');
      // Refresh to ensure sync with backend
      fetchSessions();
    } catch (err: any) {
      // Rollback on error
      setSessions(originalSessions);
      const errorMsg = err.response?.data?.message || 'Unknown error';
      setError('Failed to terminate sessions: ' + errorMsg);
      showToast.error(errorMsg);
      console.error('Error terminating sessions:', err);
    } finally {
      setIsTerminating(false);
    }
  };
  
  const handleConfirmTerminate = () => {
    if (confirmDialog.action === 'single' && confirmDialog.sessionId) {
      terminateSession(confirmDialog.sessionId);
    } else if (confirmDialog.action === 'all') {
      terminateAllOtherSessions();
    }
    setConfirmDialog({ isOpen: false, action: 'single' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Active Sessions</h3>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4 mb-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">Failed to load sessions</p>
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchSessions}
              className="flex-shrink-0 px-3 py-1 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-sm font-medium rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="space-y-4">
          {/* Desktop Skeleton */}
          <div className="hidden md:block space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile Skeleton */}
          <div className="md:hidden space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : sessions.length > 0 ? (
        <div>
          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Device / Browser
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sessions.map((session) => (
                  <tr key={session.id} className={session.is_current ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {session.name}
                      {session.is_current && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {session.ip_address || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {session.last_used_at ? new Date(session.last_used_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {!session.is_current && (
                        <button
                          onClick={() => setConfirmDialog({ 
                            isOpen: true, 
                            action: 'single', 
                            sessionId: session.id 
                          })}
                          className="min-h-[44px] px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium"
                        >
                          Terminate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Shown on Mobile Only */}
          <div className="md:hidden space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className={`rounded-lg border p-4 ${
                  session.is_current 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {session.name}
                  </div>
                  {session.is_current && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                      Current
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  {session.ip_address && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">IP Address: </span>
                      <span className="text-gray-900 dark:text-gray-100">{session.ip_address}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Last Active: </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {session.last_used_at ? new Date(session.last_used_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
                
                {!session.is_current && (
                  <button
                    onClick={() => setConfirmDialog({ 
                      isOpen: true, 
                      action: 'single', 
                      sessionId: session.id 
                    })}
                    className="mt-3 w-full min-h-[44px] px-4 py-2 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Terminate Session
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => setConfirmDialog({ isOpen: true, action: 'all' })}
              className="inline-flex items-center min-h-[44px] w-full sm:w-auto justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign out other sessions
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No active sessions found.</p>
      )}
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: 'single' })}
        onConfirm={handleConfirmTerminate}
        title={confirmDialog.action === 'all' ? 'Terminate All Other Sessions?' : 'Terminate This Session?'}
        message={
          confirmDialog.action === 'all'
            ? 'This will sign you out from all devices except this one. You will need to sign in again on those devices.'
            : 'This device will be signed out immediately. The user will need to sign in again.'
        }
        confirmText="Terminate"
        cancelText="Cancel"
        variant="danger"
        isLoading={isTerminating}
      />
    </div>
  );
}