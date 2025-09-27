import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { Download, FileText, Users, Calendar, MessageSquare, Database } from 'lucide-react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const DataExport = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [selectedFormats, setSelectedFormats] = useState({
    sessions: { json: true, csv: true },
    speakers: { json: true, csv: true },
    documents: { json: false, csv: true },
    changeRequests: { json: false, csv: true },
    agenda: { json: false, csv: true }
  });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all collections
      const [
        sessionsSnapshot,
        speakersSnapshot,
        documentsSnapshot,
        changeRequestsSnapshot,
        agendaSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'sessions')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'speaker'))),
        getDocs(collection(db, 'documents')),
        getDocs(collection(db, 'changeRequests')),
        getDocs(collection(db, 'agenda'))
      ]);

      const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
        reviewedAt: doc.data().reviewedAt?.toDate?.()?.toISOString() || null
      }));

      const speakers = speakersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
      }));

      const documents = documentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
      }));

      const changeRequests = changeRequestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
      }));

      const agenda = agendaSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
      }));

      setData({
        sessions,
        speakers,
        documents,
        changeRequests,
        agenda
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch export data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen]);

  const convertToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error(`No data available for ${filename}`);
      return;
    }

    // Get all unique keys from all objects
    const allKeys = [...new Set(data.flatMap(obj => Object.keys(obj)))];
    
    // Create CSV header
    const header = allKeys.join(',');
    
    // Create CSV rows
    const rows = data.map(item => 
      allKeys.map(key => {
        const value = item[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      }).join(',')
    );

    const csv = [header, ...rows].join('\n');
    downloadFile(csv, `${filename}.csv`, 'text/csv');
  };

  const convertToJSON = (data, filename) => {
    if (!data) {
      toast.error(`No data available for ${filename}`);
      return;
    }

    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${filename}.json`, 'application/json');
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFormatToggle = (dataType, format) => {
    setSelectedFormats(prev => ({
      ...prev,
      [dataType]: {
        ...prev[dataType],
        [format]: !prev[dataType][format]
      }
    }));
  };

  const exportData = (dataType) => {
    const formats = selectedFormats[dataType];
    const exportData = data[dataType];
    const timestamp = new Date().toISOString().split('T')[0];

    if (!exportData) {
      toast.error('No data available to export');
      return;
    }

    if (formats.csv) {
      convertToCSV(exportData, `${dataType}-${timestamp}`);
    }
    if (formats.json) {
      convertToJSON(exportData, `${dataType}-${timestamp}`);
    }

    if (!formats.csv && !formats.json) {
      toast.error('Please select at least one format');
      return;
    }

    toast.success(`${dataType} data exported successfully!`);
  };

  const exportAll = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    Object.keys(selectedFormats).forEach(dataType => {
      const formats = selectedFormats[dataType];
      if (formats.csv || formats.json) {
        exportData(dataType);
      }
    });

    // Also create a complete export
    const completeExport = {
      exportedAt: new Date().toISOString(),
      eventName: process.env.REACT_APP_EVENT_NAME || 'Event',
      summary: {
        sessionsCount: data.sessions?.length || 0,
        speakersCount: data.speakers?.length || 0,
        documentsCount: data.documents?.length || 0,
        changeRequestsCount: data.changeRequests?.length || 0,
        agendaItemsCount: data.agenda?.length || 0
      },
      data
    };

    convertToJSON(completeExport, `complete-export-${timestamp}`);
    toast.success('Complete data export generated!');
  };

  const getDataTypeIcon = (type) => {
    switch (type) {
      case 'sessions':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'speakers':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'documents':
        return <Database className="h-5 w-5 text-purple-600" />;
      case 'changeRequests':
        return <MessageSquare className="h-5 w-5 text-orange-600" />;
      case 'agenda':
        return <Calendar className="h-5 w-5 text-red-600" />;
      default:
        return <Download className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDataTypeLabel = (type) => {
    switch (type) {
      case 'sessions':
        return 'Sessions';
      case 'speakers':
        return 'Speakers';
      case 'documents':
        return 'Documents';
      case 'changeRequests':
        return 'Change Requests';
      case 'agenda':
        return 'Agenda Items';
      default:
        return type;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Event Data"
      size="lg"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner text="Preparing export data..." />
          </div>
        ) : (
          <>
            {/* Export Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Select data to export:</h3>
              
              {Object.keys(selectedFormats).map((dataType) => (
                <div key={dataType} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {getDataTypeIcon(dataType)}
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {getDataTypeLabel(dataType)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {data[dataType]?.length || 0} records available
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => exportData(dataType)}
                      disabled={!data[dataType] || data[dataType].length === 0}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </button>
                  </div>
                  
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFormats[dataType].json}
                        onChange={() => handleFormatToggle(dataType, 'json')}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">JSON</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFormats[dataType].csv}
                        onChange={() => handleFormatToggle(dataType, 'csv')}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">CSV</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Export Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Sessions:</strong> {data.sessions?.length || 0}
                </div>
                <div>
                  <strong>Speakers:</strong> {data.speakers?.length || 0}
                </div>
                <div>
                  <strong>Documents:</strong> {data.documents?.length || 0}
                </div>
                <div>
                  <strong>Requests:</strong> {data.changeRequests?.length || 0}
                </div>
                <div>
                  <strong>Agenda:</strong> {data.agenda?.length || 0}
                </div>
              </div>
            </div>

            {/* Export All Button */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Complete Export</h4>
                  <p className="text-sm text-gray-500">
                    Download all selected data in one comprehensive file
                  </p>
                </div>
                <button
                  onClick={exportAll}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </button>
              </div>
            </div>

            {/* File Format Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Export Formats</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>JSON:</strong> Machine-readable format, preserves data structure</p>
                <p><strong>CSV:</strong> Spreadsheet-compatible format, easy to import into Excel/Google Sheets</p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default DataExport;