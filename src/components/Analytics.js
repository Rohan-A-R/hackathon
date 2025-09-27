import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { BarChart3, Users, FileText, Calendar, TrendingUp, PieChart, Download } from 'lucide-react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const Analytics = ({ isOpen, onClose }) => {
  const [data, setData] = useState({
    sessions: [],
    speakers: [],
    documents: [],
    changeRequests: []
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchAnalyticsData();
    }
  }, [isOpen]);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch all data
      const [sessionsSnapshot, speakersSnapshot, documentsSnapshot, changeRequestsSnapshot] = await Promise.all([
        getDocs(collection(db, 'sessions')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'speaker'))),
        getDocs(collection(db, 'documents')),
        getDocs(collection(db, 'changeRequests'))
      ]);

      const sessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const speakers = speakersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const documents = documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const changeRequests = changeRequestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setData({ sessions, speakers, documents, changeRequests });
      calculateStats({ sessions, speakers, documents, changeRequests });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
      setLoading(false);
    }
  };

  const calculateStats = ({ sessions, speakers, documents, changeRequests }) => {
    // Session stats
    const sessionStats = {
      total: sessions.length,
      approved: sessions.filter(s => s.status === 'approved').length,
      pending: sessions.filter(s => s.status === 'submitted').length,
      rejected: sessions.filter(s => s.status === 'rejected').length,
      onHold: sessions.filter(s => s.status === 'hold').length,
    };

    // Session types breakdown
    const sessionTypes = sessions.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {});

    // Track breakdown
    const trackBreakdown = sessions.reduce((acc, session) => {
      acc[session.track] = (acc[session.track] || 0) + 1;
      return acc;
    }, {});

    // Speaker stats
    const speakerStats = {
      total: speakers.length,
      confirmed: speakers.filter(s => s.availabilityConfirmed).length,
      withSessions: speakers.filter(s => sessions.some(session => session.speakerId === s.uid)).length,
    };

    // Document stats
    const documentStats = {
      total: documents.length,
      uploaded: documents.filter(d => d.status === 'uploaded').length,
      reviewed: documents.filter(d => d.status === 'reviewed').length,
      rejected: documents.filter(d => d.status === 'rejected').length,
    };

    // Change request stats
    const changeRequestStats = {
      total: changeRequests.length,
      pending: changeRequests.filter(r => r.status === 'pending').length,
      approved: changeRequests.filter(r => r.status === 'approved').length,
      rejected: changeRequests.filter(r => r.status === 'rejected').length,
    };

    // Time-based analysis (submissions over time)
    const submissionTrend = sessions.reduce((acc, session) => {
      if (session.createdAt?.toDate) {
        const date = session.createdAt.toDate().toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});

    setStats({
      sessions: sessionStats,
      sessionTypes,
      trackBreakdown,
      speakers: speakerStats,
      documents: documentStats,
      changeRequests: changeRequestStats,
      submissionTrend
    });
  };

  const exportAnalytics = () => {
    const analyticsData = {
      generatedAt: new Date().toISOString(),
      stats,
      rawData: {
        sessionsCount: data.sessions.length,
        speakersCount: data.speakers.length,
        documentsCount: data.documents.length,
        changeRequestsCount: data.changeRequests.length
      }
    };

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported successfully!');
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Analytics"
      size="xl"
    >
      <div className="space-y-6">
        {loading ? (
          <LoadingSpinner text="Loading analytics..." />
        ) : (
          <>
            {/* Header with Export */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Event Statistics</h3>
              <button
                onClick={exportAnalytics}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-2xl font-semibold text-blue-900">{stats.sessions?.total || 0}</p>
                    <p className="text-sm text-blue-600">Total Sessions</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-2xl font-semibold text-green-900">{stats.speakers?.total || 0}</p>
                    <p className="text-sm text-green-600">Total Speakers</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-2xl font-semibold text-purple-900">{stats.sessions?.approved || 0}</p>
                    <p className="text-sm text-purple-600">Approved Sessions</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-2xl font-semibold text-yellow-900">
                      {stats.speakers?.confirmed || 0}/{stats.speakers?.total || 0}
                    </p>
                    <p className="text-sm text-yellow-600">Confirmed Speakers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Status Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Session Status Breakdown
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.sessions?.approved || 0}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.sessions?.pending || 0}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.sessions?.rejected || 0}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.sessions?.onHold || 0}</div>
                  <div className="text-sm text-gray-600">On Hold</div>
                </div>
              </div>
            </div>

            {/* Session Types */}
            {stats.sessionTypes && Object.keys(stats.sessionTypes).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Session Types</h4>
                <div className="space-y-3">
                  {Object.entries(stats.sessionTypes).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 capitalize">{type}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${(count / stats.sessions.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Track Breakdown */}
            {stats.trackBreakdown && Object.keys(stats.trackBreakdown).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Track Distribution</h4>
                <div className="space-y-3">
                  {Object.entries(stats.trackBreakdown).map(([track, count]) => (
                    <div key={track} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 capitalize">{track}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / stats.sessions.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document and Change Request Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Document Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Documents</span>
                    <span className="font-medium">{stats.documents?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uploaded</span>
                    <span className="font-medium text-blue-600">{stats.documents?.uploaded || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reviewed</span>
                    <span className="font-medium text-green-600">{stats.documents?.reviewed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rejected</span>
                    <span className="font-medium text-red-600">{stats.documents?.rejected || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Change Requests</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Requests</span>
                    <span className="font-medium">{stats.changeRequests?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-medium text-yellow-600">{stats.changeRequests?.pending || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Approved</span>
                    <span className="font-medium text-green-600">{stats.changeRequests?.approved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rejected</span>
                    <span className="font-medium text-red-600">{stats.changeRequests?.rejected || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-primary-50 p-4 rounded-lg">
              <h4 className="font-medium text-primary-900 mb-2">Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-primary-700">
                <div>
                  <strong>Completion Rate:</strong> {
                    stats.sessions?.total > 0 
                      ? Math.round((stats.sessions?.approved / stats.sessions?.total) * 100) 
                      : 0
                  }% sessions approved
                </div>
                <div>
                  <strong>Speaker Engagement:</strong> {
                    stats.speakers?.total > 0 
                      ? Math.round((stats.speakers?.confirmed / stats.speakers?.total) * 100) 
                      : 0
                  }% confirmed availability
                </div>
                <div>
                  <strong>Active Speakers:</strong> {
                    stats.speakers?.withSessions || 0
                  } speakers with sessions
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default Analytics;