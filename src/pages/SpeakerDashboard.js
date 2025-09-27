import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  PlusCircle, 
  Calendar, 
  Clock, 
  FileText, 
  QrCode,
  CheckCircle,
  AlertCircle,
  Edit3,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import SessionForm from '../components/SessionForm';
import DocumentManagement from '../components/DocumentManagement';
import ChangeRequestManagement from '../components/ChangeRequestManagement';
import { getStatusColor, getStatusText, formatDateTime } from '../utils';
import toast from 'react-hot-toast';

const SpeakerDashboard = () => {
  const { userData, user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [availabilityConfirmed, setAvailabilityConfirmed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) return;

    // Subscribe to sessions
    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('speakerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionsData = [];
      snapshot.forEach((doc) => {
        sessionsData.push({ id: doc.id, ...doc.data() });
      });
      setSessions(sessionsData);
      setLoading(false);
    });

    // Check availability confirmation
    setAvailabilityConfirmed(userData?.availabilityConfirmed || false);

    return () => unsubscribe();
  }, [user, userData]);

  const confirmAvailability = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        availabilityConfirmed: true,
        availabilityConfirmedAt: serverTimestamp()
      });
      setAvailabilityConfirmed(true);
      toast.success('Availability confirmed!');
    } catch (error) {
      console.error('Error confirming availability:', error);
      toast.error('Failed to confirm availability');
    }
  };

  const downloadQRCode = async (type, sessionData) => {
    try {
      const response = await fetch('/.netlify/functions/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data: {
            eventId: 'vibeathon-2024',
            speakerId: user.uid,
            sessionId: sessionData?.id,
            speakerName: userData.fullName
          }
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}-qr-${userData.fullName.replace(' ', '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('QR code downloaded!');
      } else {
        throw new Error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const getSessionStats = () => {
    const stats = {
      total: sessions.length,
      submitted: sessions.filter(s => s.status === 'submitted').length,
      approved: sessions.filter(s => s.status === 'approved').length,
      rejected: sessions.filter(s => s.status === 'rejected').length
    };
    return stats;
  };

  const stats = getSessionStats();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: CheckCircle },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'changes', name: 'Change Requests', icon: Edit3 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" text="Loading your dashboard..." />
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
            Welcome back, {userData?.fullName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your sessions for {process.env.REACT_APP_EVENT_NAME || 'the event'}
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Availability Confirmation Alert */}
            {!availabilityConfirmed && sessions.some(s => s.status === 'approved') && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Confirm Your Availability
                    </h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      You have approved sessions. Please confirm your availability to attend the event.
                    </p>
                  </div>
                  <button
                    onClick={confirmAvailability}
                    className="ml-4 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700"
                  >
                    Confirm Availability
                  </button>
                </div>
              </div>
            )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.submitted}</p>
                <p className="text-sm text-gray-600">Under Review</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setShowSessionForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white p-6 rounded-lg flex items-center justify-center transition-colors"
          >
            <PlusCircle className="h-6 w-6 mr-2" />
            Submit New Session
          </button>
          
          <Link
            to="/agenda"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg flex items-center justify-center transition-colors"
          >
            <Calendar className="h-6 w-6 mr-2" />
            View Event Agenda
          </Link>
          
          <button
            onClick={() => downloadQRCode('checkin')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg flex items-center justify-center transition-colors"
          >
            <QrCode className="h-6 w-6 mr-2" />
            Download QR Codes
          </button>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Sessions</h2>
          </div>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by submitting your first session proposal.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowSessionForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Submit Session
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <div key={session.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {session.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {session.type} • {session.duration} minutes
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {session.abstract?.substring(0, 150)}...
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        <span>Submitted {formatDateTime(session.createdAt)}</span>
                        {session.scheduledAt && (
                          <span>• Scheduled for {formatDateTime(session.scheduledAt)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                        {getStatusText(session.status)}
                      </span>
                      
                      {session.status === 'approved' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadQRCode('session', session)}
                            className="text-primary-600 hover:text-primary-800"
                            title="Download Session QR"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                        </div>
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
          </>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && <DocumentManagement />}

        {/* Change Requests Tab */}
        {activeTab === 'changes' && <ChangeRequestManagement />}
      </div>

      {/* Session Form Modal */}
      <Modal
        isOpen={showSessionForm}
        onClose={() => setShowSessionForm(false)}
        title="Submit New Session"
        size="lg"
      >
        <SessionForm onSuccess={() => setShowSessionForm(false)} />
      </Modal>
    </div>
  );
};

export default SpeakerDashboard;