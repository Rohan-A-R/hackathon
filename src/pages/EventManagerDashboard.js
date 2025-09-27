import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  BarChart3,
  Filter
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { getStatusColor, getStatusText, formatDateTime } from '../utils';
import toast from 'react-hot-toast';

const EventManagerDashboard = () => {
  const { userData } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Subscribe to sessions
    const sessionsQuery = query(
      collection(db, 'sessions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionsData = [];
      snapshot.forEach((doc) => {
        sessionsData.push({ id: doc.id, ...doc.data() });
      });
      setSessions(sessionsData);
    });

    // Subscribe to speakers
    const speakersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'speaker')
    );

    const unsubscribeSpeakers = onSnapshot(speakersQuery, (snapshot) => {
      const speakersData = [];
      snapshot.forEach((doc) => {
        speakersData.push({ id: doc.id, ...doc.data() });
      });
      setSpeakers(speakersData);
      setLoading(false);
    });

    return () => {
      unsubscribeSessions();
      unsubscribeSpeakers();
    };
  }, []);

  const updateSessionStatus = async (sessionId, newStatus, feedback = '') => {
    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        status: newStatus,
        feedback: feedback || null,
        reviewedAt: serverTimestamp(),
        reviewedBy: userData.fullName
      });

      // Send notification email
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        try {
          await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: `session_${newStatus}`,
              to: session.speakerEmail,
              data: {
                speakerName: session.speakerName,
                sessionTitle: session.title,
                feedback: feedback
              }
            })
          });
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      }

      toast.success(`Session ${newStatus} successfully!`);
      setShowReviewModal(false);
    } catch (error) {
      console.error('Error updating session status:', error);
      toast.error('Failed to update session status');
    }
  };

  const getSessionStats = () => {
    const stats = {
      total: sessions.length,
      submitted: sessions.filter(s => s.status === 'submitted').length,
      approved: sessions.filter(s => s.status === 'approved').length,
      rejected: sessions.filter(s => s.status === 'rejected').length,
      hold: sessions.filter(s => s.status === 'hold').length
    };
    return stats;
  };

  const getSpeakerStats = () => {
    const stats = {
      total: speakers.length,
      confirmed: speakers.filter(s => s.availabilityConfirmed).length,
      pending: speakers.filter(s => !s.availabilityConfirmed).length
    };
    return stats;
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const sessionStats = getSessionStats();
  const speakerStats = getSpeakerStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" text="Loading event dashboard..." />
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
            Event Manager Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage sessions and speakers for {process.env.REACT_APP_EVENT_NAME || 'your event'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{sessionStats.total}</p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{sessionStats.submitted}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{sessionStats.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{speakerStats.total}</p>
                <p className="text-sm text-gray-600">Total Speakers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-lg flex items-center justify-center transition-colors">
            <Calendar className="h-5 w-5 mr-2" />
            Build Agenda
          </button>
          
          <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center justify-center transition-colors">
            <Mail className="h-5 w-5 mr-2" />
            Send Notifications
          </button>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center transition-colors">
            <BarChart3 className="h-5 w-5 mr-2" />
            View Analytics
          </button>
          
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center justify-center transition-colors">
            <FileText className="h-5 w-5 mr-2" />
            Export Data
          </button>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Session Submissions</h2>
            
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Sessions</option>
                <option value="submitted">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="hold">On Hold</option>
              </select>
            </div>
          </div>
          
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? 'No sessions have been submitted yet.'
                  : `No sessions with status "${filter}".`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <div key={session.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {session.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                          {getStatusText(session.status)}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{session.speakerName}</span>
                        <span>•</span>
                        <span>{session.type}</span>
                        <span>•</span>
                        <span>{session.duration} min</span>
                        <span>•</span>
                        <span>{session.track}</span>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                        {session.abstract}
                      </p>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Submitted {formatDateTime(session.createdAt)}
                        {session.reviewedAt && (
                          <span> • Reviewed {formatDateTime(session.reviewedAt)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2">
                      {session.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowReviewModal(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => updateSessionStatus(session.id, 'approved')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => updateSessionStatus(session.id, 'hold')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200"
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Hold
                          </button>
                          <button
                            onClick={() => updateSessionStatus(session.id, 'rejected')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {session.feedback && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Feedback:</strong> {session.feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Speakers Section */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Speakers</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {speakers.map((speaker) => (
                <div key={speaker.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {speaker.fullName.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{speaker.fullName}</p>
                      <p className="text-xs text-gray-500">{speaker.organization}</p>
                    </div>
                    {speaker.availabilityConfirmed && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review Session"
        size="lg"
      >
        {selectedSession && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{selectedSession.title}</h3>
              <p className="text-sm text-gray-600">by {selectedSession.speakerName}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Abstract</h4>
              <p className="mt-1 text-sm text-gray-700">{selectedSession.abstract}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Type</h4>
                <p className="text-sm text-gray-700">{selectedSession.type}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Duration</h4>
                <p className="text-sm text-gray-700">{selectedSession.duration} minutes</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Track</h4>
                <p className="text-sm text-gray-700">{selectedSession.track}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Target Audience</h4>
                <p className="text-sm text-gray-700">{selectedSession.targetAudience || 'Not specified'}</p>
              </div>
            </div>
            
            {selectedSession.requirements && (
              <div>
                <h4 className="font-medium text-gray-900">Requirements</h4>
                <p className="text-sm text-gray-700">{selectedSession.requirements}</p>
              </div>
            )}
            
            <div className="flex space-x-4 pt-4">
              <button
                onClick={() => updateSessionStatus(selectedSession.id, 'approved')}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => updateSessionStatus(selectedSession.id, 'hold')}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
              >
                Hold
              </button>
              <button
                onClick={() => updateSessionStatus(selectedSession.id, 'rejected')}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventManagerDashboard;