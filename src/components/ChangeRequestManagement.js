import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { Edit3, Clock, CheckCircle2, XCircle, AlertCircle, Calendar, MessageSquare, Send } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import toast from 'react-hot-toast';

const ChangeRequestManagement = () => {
  const { user, userData } = useAuth();
  const [changeRequests, setChangeRequests] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canRequestChanges, setCanRequestChanges] = useState(true);
  const [eventDate, setEventDate] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [requestData, setRequestData] = useState({
    type: 'title',
    currentValue: '',
    newValue: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchChangeRequests();
    fetchUserSessions();
    fetchEventSettings();
  }, [user]);

  const fetchChangeRequests = async () => {
    try {
      const q = query(
        collection(db, 'changeRequests'),
        where('requesterId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChangeRequests(requests.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
    } catch (error) {
      console.error('Error fetching change requests:', error);
      toast.error('Failed to load change requests');
    }
  };

  const fetchUserSessions = async () => {
    try {
      const q = query(
        collection(db, 'sessions'),
        where('speakerId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserSessions(sessions);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
    }
  };

  const fetchEventSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'event'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        if (settings.eventDate) {
          const eventTimestamp = new Date(settings.eventDate);
          const oneWeekBefore = new Date(eventTimestamp.getTime() - 7 * 24 * 60 * 60 * 1000);
          const now = new Date();
          setCanRequestChanges(now < oneWeekBefore);
          setEventDate(eventTimestamp);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event settings:', error);
      setLoading(false);
    }
  };

  const openRequestModal = (session) => {
    setSelectedSession(session);
    setRequestData({
      type: 'title',
      currentValue: session.title,
      newValue: '',
      reason: ''
    });
    setShowRequestModal(true);
  };

  const handleTypeChange = (type) => {
    if (!selectedSession) return;
    
    let currentValue = '';
    switch (type) {
      case 'title':
        currentValue = selectedSession.title;
        break;
      case 'abstract':
        currentValue = selectedSession.abstract;
        break;
      case 'coSpeaker':
        currentValue = selectedSession.coSpeakerName || 'No co-speaker';
        break;
      default:
        currentValue = '';
    }
    
    setRequestData({
      ...requestData,
      type,
      currentValue,
      newValue: ''
    });
  };

  const submitChangeRequest = async (e) => {
    e.preventDefault();
    if (!requestData.newValue || !requestData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'changeRequests'), {
        sessionId: selectedSession.id,
        sessionTitle: selectedSession.title,
        requesterId: user.uid,
        requesterName: userData.fullName,
        requesterEmail: userData.email,
        type: requestData.type,
        currentValue: requestData.currentValue,
        requestedValue: requestData.newValue,
        reason: requestData.reason,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Change request submitted successfully!');
      setShowRequestModal(false);
      setSelectedSession(null);
      setRequestData({ type: 'title', currentValue: '', newValue: '', reason: '' });
      fetchChangeRequests();

      // Send notification email to event managers
      try {
        await fetch('/.netlify/functions/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'change_request_submitted',
            to: 'events@company.com', // Configure this email
            data: {
              speakerName: userData.fullName,
              sessionTitle: selectedSession.title,
              changeType: requestData.type,
              reason: requestData.reason
            }
          })
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
    } catch (error) {
      console.error('Error submitting change request:', error);
      toast.error('Failed to submit change request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in-review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'in-review':
        return 'In Review';
      default:
        return 'Pending';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in-review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatChangeType = (type) => {
    switch (type) {
      case 'title':
        return 'Session Title';
      case 'abstract':
        return 'Session Abstract';
      case 'coSpeaker':
        return 'Co-Speaker Details';
      default:
        return type;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading change requests..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Change Requests</h2>
          <p className="text-gray-600 mt-1">Request changes to your session details</p>
        </div>
      </div>

      {/* Change Request Deadline Notice */}
      {eventDate && (
        <div className={`p-4 rounded-md ${canRequestChanges ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center">
            <Calendar className={`h-5 w-5 mr-2 ${canRequestChanges ? 'text-blue-400' : 'text-red-400'}`} />
            <div>
              <h4 className={`text-sm font-medium ${canRequestChanges ? 'text-blue-800' : 'text-red-800'}`}>
                Change Request Deadline
              </h4>
              <p className={`text-sm ${canRequestChanges ? 'text-blue-700' : 'text-red-700'} mt-1`}>
                {canRequestChanges 
                  ? `Change requests are allowed until one week before the event (${new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()})`
                  : `Change request deadline has passed. Contact organizers directly for urgent changes.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Available for Change Requests */}
      {canRequestChanges && userSessions.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Sessions</h3>
          <div className="space-y-3">
            {userSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{session.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{session.type} • {session.duration} minutes</p>
                  {session.coSpeakerName && (
                    <p className="text-sm text-gray-500">Co-speaker: {session.coSpeakerName}</p>
                  )}
                </div>
                <button
                  onClick={() => openRequestModal(session)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Request Changes
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change Requests History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Request History</h3>
        
        {changeRequests.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No change requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              {canRequestChanges ? 'Request changes to your session when needed.' : 'Change request period has ended.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {changeRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(request.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{request.sessionTitle}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Change Type:</span> {formatChangeType(request.type)}</p>
                        <p><span className="font-medium">Current:</span> {request.currentValue}</p>
                        <p><span className="font-medium">Requested:</span> {request.requestedValue}</p>
                        <p><span className="font-medium">Reason:</span> {request.reason}</p>
                      </div>
                      
                      {request.reviewNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Review Notes:</span> {request.reviewNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {new Date(request.createdAt?.toDate()).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Session Changes"
      >
        {selectedSession && (
          <form onSubmit={submitChangeRequest} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-900">{selectedSession.title}</h4>
              <p className="text-sm text-gray-500">{selectedSession.type} • {selectedSession.duration} minutes</p>
            </div>

            <div>
              <label htmlFor="changeType" className="block text-sm font-medium text-gray-700">
                What would you like to change? *
              </label>
              <select
                id="changeType"
                value={requestData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="title">Session Title</option>
                <option value="abstract">Session Abstract</option>
                <option value="coSpeaker">Co-Speaker Details</option>
              </select>
            </div>

            <div>
              <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700">
                Current Value
              </label>
              <textarea
                id="currentValue"
                value={requestData.currentValue}
                readOnly
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="newValue" className="block text-sm font-medium text-gray-700">
                Requested New Value *
              </label>
              <textarea
                id="newValue"
                required
                value={requestData.newValue}
                onChange={(e) => setRequestData({ ...requestData, newValue: e.target.value })}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter the new value you would like..."
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Reason for Change *
              </label>
              <textarea
                id="reason"
                required
                value={requestData.reason}
                onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                rows={2}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Please explain why this change is needed..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" text="" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ChangeRequestManagement;