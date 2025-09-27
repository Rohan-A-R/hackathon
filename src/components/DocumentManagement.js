import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { FileText, Download, Upload, Calendar, AlertCircle, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import toast from 'react-hot-toast';

const DocumentManagement = () => {
  const { user, userData } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDeadline, setUploadDeadline] = useState(null);
  const [canUpload, setCanUpload] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', driveLink: '', type: 'presentation' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchTemplates();
    fetchUploadSettings();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const q = query(
        collection(db, 'documents'),
        where('uploadedBy', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const docsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docsData);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const fetchTemplates = async () => {
    try {
      const templatesQuery = query(
        collection(db, 'templates'),
        where('active', '==', true)
      );
      const querySnapshot = await getDocs(templatesQuery);
      const templatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchUploadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'documents'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        if (settings.uploadDeadline) {
          const deadline = new Date(settings.uploadDeadline);
          const now = new Date();
          setUploadDeadline(deadline);
          setCanUpload(now < deadline && settings.uploadsEnabled);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching upload settings:', error);
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.driveLink) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate Google Drive link
    const driveRegex = /^https:\/\/drive\.google\.com\/(file\/d\/|open\?id=)/;
    if (!driveRegex.test(uploadData.driveLink)) {
      toast.error('Please provide a valid Google Drive link');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'documents'), {
        title: uploadData.title,
        driveLink: uploadData.driveLink,
        type: uploadData.type,
        uploadedBy: user.uid,
        uploaderName: userData.fullName,
        uploaderEmail: userData.email,
        status: 'uploaded',
        uploadedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Document uploaded successfully!');
      setShowUploadModal(false);
      setUploadData({ title: '', driveLink: '', type: 'presentation' });
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'reviewed':
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'uploaded':
        return 'Uploaded';
      case 'reviewed':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading documents..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
          <p className="text-gray-600 mt-1">Upload your presentation materials and download templates</p>
        </div>
        
        {canUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </button>
        )}
      </div>

      {/* Upload Deadline Notice */}
      {uploadDeadline && (
        <div className={`p-4 rounded-md ${canUpload ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center">
            <Calendar className={`h-5 w-5 mr-2 ${canUpload ? 'text-blue-400' : 'text-red-400'}`} />
            <div>
              <h4 className={`text-sm font-medium ${canUpload ? 'text-blue-800' : 'text-red-800'}`}>
                Document Upload Deadline
              </h4>
              <p className={`text-sm ${canUpload ? 'text-blue-700' : 'text-red-700'} mt-1`}>
                {canUpload 
                  ? `Upload deadline: ${uploadDeadline.toLocaleDateString()} at ${uploadDeadline.toLocaleTimeString()}`
                  : `Upload deadline has passed (${uploadDeadline.toLocaleDateString()}). Contact organizers for urgent uploads.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Templates Section */}
      {templates.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{template.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                      {template.type}
                    </span>
                  </div>
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <div className="mt-4">
                  <a
                    href={template.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Documents */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">My Documents</h3>
        
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
            <p className="mt-1 text-sm text-gray-500">
              {canUpload ? 'Upload your first document to get started.' : 'Upload deadline has passed.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(document.status)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{document.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>Type: {document.type}</span>
                        <span>Status: {getStatusText(document.status)}</span>
                        <span>Uploaded: {new Date(document.uploadedAt?.toDate()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <a
                      href={document.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </div>
                </div>
                
                {document.reviewNotes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Review Notes:</span> {document.reviewNotes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Document Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter document title"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Document Type *
            </label>
            <select
              id="type"
              value={uploadData.type}
              onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="presentation">Presentation Slides</option>
              <option value="handout">Handout</option>
              <option value="resource">Additional Resource</option>
              <option value="demo">Demo Materials</option>
            </select>
          </div>

          <div>
            <label htmlFor="driveLink" className="block text-sm font-medium text-gray-700">
              Google Drive Link *
            </label>
            <input
              type="url"
              id="driveLink"
              required
              value={uploadData.driveLink}
              onChange={(e) => setUploadData({ ...uploadData, driveLink: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="https://drive.google.com/..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Share your Google Drive file and paste the link here. Make sure the file has proper viewing permissions.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
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
                  <span className="ml-2">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DocumentManagement;