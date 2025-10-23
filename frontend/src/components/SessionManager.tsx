import React, { useState, useEffect } from 'react';
import api from '../api/axios';

interface Session {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  is_current?: boolean;
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      await api.delete(`/api/sessions/${id}`);
      // Refresh the sessions list
      fetchSessions();
    } catch (err: any) {
      setError('Failed to terminate session: ' + (err.response?.data?.message || 'Unknown error'));
      console.error('Error terminating session:', err);
    }
  };

  const terminateAllOtherSessions = async () => {
    if (window.confirm('Are you sure you want to terminate all other sessions?')) {
      try {
        await api.delete('/api/sessions');
        // Refresh the sessions list
        fetchSessions();
      } catch (err: any) {
        setError('Failed to terminate sessions: ' + (err.response?.data?.message || 'Unknown error'));
        console.error('Error terminating sessions:', err);
      }
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-gray-500">Loading sessions...</div>
      ) : sessions.length > 0 ? (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device / App
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id} className={session.is_current ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {session.name}
                      {session.is_current && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.last_used_at ? new Date(session.last_used_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {!session.is_current && (
                        <button
                          onClick={() => terminateSession(session.id)}
                          className="text-red-600 hover:text-red-900"
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
          
          <div className="mt-4">
            <button
              onClick={terminateAllOtherSessions}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign out other sessions
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No active sessions found.</p>
      )}
    </div>
  );
}