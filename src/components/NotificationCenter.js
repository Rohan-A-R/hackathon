import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Mail, Send, Users, MessageSquare, Calendar, Bell } from 'lucide-react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const NotificationCenter = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [recipients, setRecipients] = useState('all');
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    type: 'announcement'
  });

  const emailTemplates = {
    custom: {
      name: 'Custom Message',
      subject: '',
      message: ''
    },
    welcome: {
      name: 'Welcome Message',
      subject: 'Welcome to {{EVENT_NAME}} - Important Information',
      message: `Dear {{SPEAKER_NAME}},

Welcome to {{EVENT_NAME}}! We're excited to have you as one of our speakers.

Here are some important details:
- Event Date: {{EVENT_DATE}}
- Check-in begins at 8:00 AM
- Speaker briefing at 9:00 AM
- Please arrive at least 30 minutes before your session

We'll send more details soon, including the final agenda and logistics information.

Best regards,
{{EVENT_NAME}} Team`
    },
    reminder: {
      name: 'Event Reminder',
      subject: 'Reminder: {{EVENT_NAME}} is Coming Up!',
      message: `Dear {{SPEAKER_NAME}},

This is a friendly reminder that {{EVENT_NAME}} is just around the corner!

Please remember to:
- Confirm your availability if you haven't already
- Upload your presentation materials
- Review the event agenda
- Prepare any technical requirements

If you have any questions or need assistance, please don't hesitate to reach out.

Looking forward to seeing you there!

Best regards,
{{EVENT_NAME}} Team`
    },
    briefing: {
      name: 'Speaker Briefing',
      subject: 'Speaker Briefing Information - {{EVENT_NAME}}',
      message: `Dear {{SPEAKER_NAME}},

Thank you for being part of {{EVENT_NAME}}. Here's important information for speakers:

**Event Details:**
- Date: {{EVENT_DATE}}
- Location: {{EVENT_LOCATION}}
- Your session: {{SESSION_TITLE}}

**Speaker Requirements:**
- Please join the speaker briefing call (link attached)
- Upload your presentation 24 hours before the event
- Arrive 30 minutes before your session
- Have a backup of your presentation ready

**Technical Setup:**
- Microphone will be provided
- HDMI connection available
- Please test your presentation beforehand

We're here to help make your session successful!

Best regards,
{{EVENT_NAME}} Team`
    },
    pack_your_bags: {
      name: 'Pack Your Bags',
      subject: 'Pack Your Bags! {{EVENT_NAME}} is Tomorrow',
      message: `Dear {{SPEAKER_NAME}},

{{EVENT_NAME}} is tomorrow! We can't wait to see you.

**Final Checklist:**
□ Presentation uploaded and tested
□ Travel arrangements confirmed
□ Speaker badge and materials ready
□ Technical requirements verified
□ Emergency contact information updated

**Event Day Schedule:**
- Check-in: 8:00 AM
- Speaker briefing: 9:00 AM  
- Your session: {{SESSION_TIME}}
- Networking lunch: 12:00 PM

**Important Contacts:**
- Event hotline: +1-xxx-xxx-xxxx
- Technical support: tech@event.com
- Emergency contact: emergency@event.com

Thank you for making this event amazing!

Safe travels,
{{EVENT_NAME}} Team`
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSpeakers();
    }
  }, [isOpen]);

  const fetchSpeakers = async () => {
    try {
      const speakersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'speaker')
      );
      const speakersSnapshot = await getDocs(speakersQuery);
      const speakersData = speakersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSpeakers(speakersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching speakers:', error);
      toast.error('Failed to load speakers');
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey);
    const template = emailTemplates[templateKey];
    setEmailData({
      ...emailData,
      subject: template.subject,
      message: template.message
    });
  };

  const getRecipientCount = () => {
    switch (recipients) {
      case 'all':
        return speakers.length;
      case 'confirmed':
        return speakers.filter(s => s.availabilityConfirmed).length;
      case 'pending':
        return speakers.filter(s => !s.availabilityConfirmed).length;
      default:
        return 0;
    }
  };

  const getRecipientEmails = () => {
    let targetSpeakers = speakers;
    
    switch (recipients) {
      case 'confirmed':
        targetSpeakers = speakers.filter(s => s.availabilityConfirmed);
        break;
      case 'pending':
        targetSpeakers = speakers.filter(s => !s.availabilityConfirmed);
        break;
      default:
        targetSpeakers = speakers;
    }
    
    return targetSpeakers.map(speaker => ({
      email: speaker.email,
      name: speaker.fullName,
      data: {
        speakerName: speaker.fullName,
        sessionTitle: 'Your Session', // Could be enhanced to get actual session
        sessionTime: 'TBD'
      }
    }));
  };

  const sendNotifications = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    const recipientList = getRecipientEmails();
    if (recipientList.length === 0) {
      toast.error('No recipients selected');
      return;
    }

    setSending(true);
    try {
      // Send bulk email via Netlify function
      const response = await fetch('/.netlify/functions/send-bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: recipientList,
          subject: emailData.subject,
          message: emailData.message,
          type: emailData.type,
          senderName: user.displayName || 'Event Manager',
          eventName: process.env.REACT_APP_EVENT_NAME || 'Event'
        })
      });

      if (response.ok) {
        toast.success(`Notifications sent successfully to ${recipientList.length} speakers!`);
        onClose();
        // Reset form
        setEmailData({
          subject: '',
          message: '',
          type: 'announcement'
        });
        setSelectedTemplate('custom');
      } else {
        throw new Error('Failed to send notifications');
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Failed to send notifications. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Notifications"
      size="xl"
    >
      <div className="space-y-6">
        {loading ? (
          <LoadingSpinner text="Loading speakers..." />
        ) : (
          <>
            {/* Recipient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send to
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="relative flex items-center">
                  <input
                    type="radio"
                    value="all"
                    checked={recipients === 'all'}
                    onChange={(e) => setRecipients(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`flex-1 p-4 border-2 rounded-lg cursor-pointer ${
                    recipients === 'all' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">All Speakers</div>
                        <div className="text-sm text-gray-500">{speakers.length} speakers</div>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative flex items-center">
                  <input
                    type="radio"
                    value="confirmed"
                    checked={recipients === 'confirmed'}
                    onChange={(e) => setRecipients(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`flex-1 p-4 border-2 rounded-lg cursor-pointer ${
                    recipients === 'confirmed' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-green-400 mr-2" />
                      <div>
                        <div className="font-medium">Confirmed</div>
                        <div className="text-sm text-gray-500">
                          {speakers.filter(s => s.availabilityConfirmed).length} speakers
                        </div>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative flex items-center">
                  <input
                    type="radio"
                    value="pending"
                    checked={recipients === 'pending'}
                    onChange={(e) => setRecipients(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`flex-1 p-4 border-2 rounded-lg cursor-pointer ${
                    recipients === 'pending' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-yellow-400 mr-2" />
                      <div>
                        <div className="font-medium">Pending</div>
                        <div className="text-sm text-gray-500">
                          {speakers.filter(s => !s.availabilityConfirmed).length} speakers
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Email Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                {Object.entries(emailTemplates).map(([key, template]) => (
                  <option key={key} value={key}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Type
              </label>
              <select
                value={emailData.type}
                onChange={(e) => setEmailData({ ...emailData, type: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="announcement">Announcement</option>
                <option value="reminder">Reminder</option>
                <option value="update">Update</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter email subject"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                rows={12}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your message..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Available placeholders: {{SPEAKER_NAME}}, {{EVENT_NAME}}, {{EVENT_DATE}}, {{SESSION_TITLE}}
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
              <p className="text-sm text-gray-600 mb-2">
                This will be sent to <strong>{getRecipientCount()}</strong> speakers
              </p>
              <div className="text-sm">
                <strong>Subject:</strong> {emailData.subject || 'No subject'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <button
                onClick={sendNotifications}
                disabled={sending || !emailData.subject.trim() || !emailData.message.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <LoadingSpinner size="sm" text="" />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to {getRecipientCount()} Speaker{getRecipientCount() !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default NotificationCenter;