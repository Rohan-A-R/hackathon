import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Calendar, Clock, MapPin, User, Filter } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateTime, TRACKS } from '../utils';

const Agenda = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');

  useEffect(() => {
    fetchApprovedSessions();
  }, []);

  const fetchApprovedSessions = async () => {
    try {
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('status', '==', 'approved'),
        orderBy('scheduledAt', 'asc')
      );
      
      const snapshot = await getDocs(sessionsQuery);
      const sessionsData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only include sessions that have been scheduled
        if (data.scheduledAt) {
          sessionsData.push({ id: doc.id, ...data });
        }
      });
      
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group sessions by day
  const groupSessionsByDay = (sessions) => {
    const grouped = {};
    sessions.forEach(session => {
      if (session.scheduledAt) {
        const date = session.scheduledAt.toDate();
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        const dayName = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        if (!grouped[dayKey]) {
          grouped[dayKey] = {
            date: dayName,
            sessions: []
          };
        }
        grouped[dayKey].sessions.push(session);
      }
    });
    
    // Sort sessions within each day by time
    Object.keys(grouped).forEach(day => {
      grouped[day].sessions.sort((a, b) => 
        a.scheduledAt.toDate() - b.scheduledAt.toDate()
      );
    });
    
    return grouped;
  };

  const filteredSessions = sessions.filter(session => {
    const trackMatch = selectedTrack === 'all' || session.track === selectedTrack;
    
    let dayMatch = true;
    if (selectedDay !== 'all' && session.scheduledAt) {
      const sessionDay = session.scheduledAt.toDate().toISOString().split('T')[0];
      dayMatch = sessionDay === selectedDay;
    }
    
    return trackMatch && dayMatch;
  });

  const groupedSessions = groupSessionsByDay(filteredSessions);
  const availableDays = Object.keys(groupSessionsByDay(sessions));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" text="Loading agenda..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {process.env.REACT_APP_EVENT_NAME || 'Event'} Agenda
          </h1>
          <p className="text-xl text-gray-600">
            Discover amazing sessions and plan your schedule
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Track Filter */}
              <div>
                <label htmlFor="track" className="sr-only">Track</label>
                <select
                  id="track"
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Tracks</option>
                  <option value={TRACKS.TECH}>Technology</option>
                  <option value={TRACKS.DESIGN}>Design</option>
                  <option value={TRACKS.BUSINESS}>Business</option>
                  <option value={TRACKS.MARKETING}>Marketing</option>
                  <option value={TRACKS.PRODUCT}>Product</option>
                </select>
              </div>

              {/* Day Filter */}
              <div>
                <label htmlFor="day" className="sr-only">Day</label>
                <select
                  id="day"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Days</option>
                  {availableDays.map(day => {
                    const date = new Date(day);
                    return (
                      <option key={day} value={day}>
                        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Sessions */}
        {Object.keys(groupedSessions).length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions scheduled</h3>
            <p className="mt-1 text-sm text-gray-500">
              {sessions.length === 0 
                ? 'No sessions have been approved yet.'
                : selectedTrack !== 'all' || selectedDay !== 'all'
                ? 'No sessions match your current filters.'
                : 'Sessions are being scheduled. Check back soon!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedSessions)
              .sort()
              .map(dayKey => {
                const dayData = groupedSessions[dayKey];
                return (
                  <div key={dayKey} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-primary-600 text-white px-6 py-4">
                      <h2 className="text-xl font-semibold">{dayData.date}</h2>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {dayData.sessions.map((session) => (
                        <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {session.title}
                                  </h3>
                                  
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-1" />
                                      {session.speakerName}
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {session.scheduledAt && formatDateTime(session.scheduledAt)}
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {session.duration} minutes
                                    </div>
                                    
                                    {session.room && (
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {session.room}
                                      </div>
                                    )}
                                  </div>

                                  <p className="text-gray-700 mb-4 leading-relaxed">
                                    {session.abstract}
                                  </p>

                                  <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                      {session.type}
                                    </span>
                                    
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      {session.track}
                                    </span>

                                    {session.targetAudience && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {session.targetAudience}
                                      </span>
                                    )}

                                    {session.tags && session.tags.map((tag, index) => (
                                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Speaker Bio */}
                          {session.speakerBio && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">About the Speaker</h4>
                              <p className="text-sm text-gray-600">
                                <strong>{session.speakerName}</strong>
                                {session.speakerOrganization && ` from ${session.speakerOrganization}`}
                                {session.speakerBio && ` - ${session.speakerBio}`}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Agenda;