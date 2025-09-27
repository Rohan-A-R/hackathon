import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SpeakerDashboardSimple = () => {
  const { userData, user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  console.log('SpeakerDashboardSimple render:', { authLoading, loading, user: !!user, userData: !!userData });

  useEffect(() => {
    const fetchSessions = async () => {
      console.log('fetchSessions called, user:', user);
      
      if (!user) {
        console.log('No user found, setting loading to false');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching sessions for user:', user.uid);
        console.log('Database reference:', db);
        
        // First, let's try to just get all sessions without filters
        const allSessionsQuery = query(collection(db, 'sessions'));
        const allSessionsSnapshot = await getDocs(allSessionsQuery);
        console.log('Total sessions in database:', allSessionsSnapshot.size);
        
        // Now try with the user filter
        const q = query(
          collection(db, 'sessions'),
          where('speakerId', '==', user.uid)
        );
        
        console.log('Executing query...');
        const querySnapshot = await getDocs(q);
        console.log('Query completed, found documents:', querySnapshot.size);
        
        const sessionsData = [];
        querySnapshot.forEach((doc) => {
          console.log('Session document:', doc.id, doc.data());
          sessionsData.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('Final sessions data:', sessionsData);
        setSessions(sessionsData);
        setError(null);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        setError(`${error.code}: ${error.message}`);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    // Add a small delay to ensure auth is fully loaded
    const timer = setTimeout(() => {
      fetchSessions();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user]);
  
  // If auth is still loading, show loading
  if (authLoading) {
    console.log('Auth still loading...');
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" text="Loading authentication..." />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userData?.fullName || 'Speaker'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Simple Speaker Dashboard - Debug Version
          </p>
        </div>

        {/* Debug Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Debug Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User ID:</strong> {user?.uid || 'Not available'}
            </div>
            <div>
              <strong>User Email:</strong> {user?.email || 'Not available'}
            </div>
            <div>
              <strong>User Role:</strong> {userData?.role || 'Not available'}
            </div>
            <div>
              <strong>Sessions Count:</strong> {sessions.length}
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Sessions</h2>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No sessions found</p>
              <p className="text-sm text-gray-400 mt-2">
                This could be because you haven't submitted any sessions yet, or there might be a database connection issue.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{session.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{session.abstract}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Status: {session.status} | Type: {session.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Test Buttons */}
        <div className="mt-8 space-x-4">
          <button
            onClick={() => {
              console.log('Test button clicked');
              console.log('Current user:', user);
              console.log('Current userData:', userData);
              console.log('Current sessions:', sessions);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Log Debug Info
          </button>
          
          <button
            onClick={async () => {
              try {
                console.log('Creating test session...');
                const testSession = {
                  title: 'Test Session ' + Date.now(),
                  abstract: 'This is a test session created for debugging purposes.',
                  type: 'talk',
                  duration: 30,
                  track: 'technology',
                  speakerId: user.uid,
                  speakerName: userData.fullName,
                  speakerEmail: userData.email,
                  status: 'submitted',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                };
                
                const docRef = await addDoc(collection(db, 'sessions'), testSession);
                console.log('Test session created with ID:', docRef.id);
                toast.success('Test session created!');
                
                // Refresh sessions
                window.location.reload();
              } catch (error) {
                console.error('Error creating test session:', error);
                toast.error('Failed to create test session: ' + error.message);
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Create Test Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeakerDashboardSimple;