import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { SESSION_TYPES, TRACKS } from '../utils';
import { Sparkles, Users, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const SessionForm = ({ onSuccess, editSession = null }) => {
  const { user, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [eventDate, setEventDate] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: editSession || {
      title: '',
      abstract: '',
      type: '',
      track: '',
      duration: 30,
      requirements: '',
      targetAudience: '',
      tags: '',
      // Co-speaker details
      coSpeakerName: userData?.speaker2Name || '',
      coSpeakerEmail: userData?.speaker2Email || ''
    }
  });

  // Check if edits are allowed (not within 1 week of event)
  useEffect(() => {
    const fetchEventSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'event'));
        if (settingsDoc.exists()) {
          const settings = settingsDoc.data();
          if (settings.eventDate) {
            const eventTimestamp = new Date(settings.eventDate);
            const oneWeekBefore = new Date(eventTimestamp.getTime() - 7 * 24 * 60 * 60 * 1000);
            const now = new Date();
            setCanEdit(now < oneWeekBefore);
            setEventDate(eventTimestamp);
          }
        }
      } catch (error) {
        console.error('Error fetching event settings:', error);
      }
    };
    
    fetchEventSettings();
  }, []);

  const abstract = watch('abstract');
  const title = watch('title');

  const enhanceWithAI = async (field) => {
    if (!title && !abstract) {
      toast.error('Please provide a title or abstract first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch('/.netlify/functions/ai-enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field,
          title,
          abstract,
          speakerInfo: {
            name: userData.fullName,
            bio: userData.bio,
            organization: userData.organization
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (field === 'title') {
          setValue('title', data.enhancedTitle);
          toast.success('Title enhanced with AI!');
        } else if (field === 'abstract') {
          setValue('abstract', data.enhancedAbstract);
          toast.success('Abstract enhanced with AI!');
        }
      } else {
        throw new Error('Failed to enhance with AI');
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
      toast.error('Failed to enhance with AI');
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const sessionData = {
        ...data,
        speakerId: user.uid,
        speakerName: userData.fullName,
        speakerEmail: userData.email,
        speakerBio: userData.bio,
        speakerOrganization: userData.organization,
        // Co-speaker details
        coSpeakerName: data.coSpeakerName || null,
        coSpeakerEmail: data.coSpeakerEmail || null,
        hasCoSpeaker: !!(data.coSpeakerName && data.coSpeakerEmail),
        status: 'submitted',
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'sessions'), sessionData);
      
      toast.success('Session submitted successfully!');
      
      // Send notification email
      try {
        await fetch('/.netlify/functions/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'session_submitted',
            to: userData.email,
            data: {
              speakerName: userData.fullName,
              sessionTitle: data.title,
              sessionType: data.type
            }
          })
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }

      onSuccess();
    } catch (error) {
      console.error('Error submitting session:', error);
      toast.error('Failed to submit session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Session Title *
          </label>
          <button
            type="button"
            onClick={() => enhanceWithAI('title')}
            disabled={aiLoading}
            className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50"
          >
            {aiLoading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            AI Enhance
          </button>
        </div>
        <input
          {...register('title', {
            required: 'Session title is required',
            minLength: {
              value: 5,
              message: 'Title must be at least 5 characters'
            },
            maxLength: {
              value: 100,
              message: 'Title must be less than 100 characters'
            }
          })}
          type="text"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Enter an engaging session title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Abstract */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="abstract" className="block text-sm font-medium text-gray-700">
            Abstract *
          </label>
          <button
            type="button"
            onClick={() => enhanceWithAI('abstract')}
            disabled={aiLoading}
            className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50"
          >
            {aiLoading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            AI Enhance
          </button>
        </div>
        <textarea
          {...register('abstract', {
            required: 'Abstract is required',
            minLength: {
              value: 50,
              message: 'Abstract must be at least 50 characters'
            },
            maxLength: {
              value: 1000,
              message: 'Abstract must be less than 1000 characters'
            }
          })}
          rows={5}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Describe your session in detail..."
        />
        <div className="flex justify-between mt-1">
          {errors.abstract ? (
            <p className="text-sm text-red-600">{errors.abstract.message}</p>
          ) : (
            <p className="text-sm text-gray-500">
              {abstract?.length || 0}/1000 characters
            </p>
          )}
        </div>
      </div>

      {/* Session Type and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Session Type *
          </label>
          <select
            {...register('type', { required: 'Session type is required' })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="">Select session type</option>
            <option value={SESSION_TYPES.KEYNOTE}>Keynote</option>
            <option value={SESSION_TYPES.TALK}>Talk</option>
            <option value={SESSION_TYPES.WORKSHOP}>Workshop</option>
            <option value={SESSION_TYPES.PANEL}>Panel Discussion</option>
            <option value={SESSION_TYPES.LIGHTNING}>Lightning Talk</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (minutes) *
          </label>
          <select
            {...register('duration', { required: 'Duration is required' })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
          </select>
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
          )}
        </div>
      </div>

      {/* Track */}
      <div>
        <label htmlFor="track" className="block text-sm font-medium text-gray-700">
          Track *
        </label>
        <select
          {...register('track', { required: 'Track is required' })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="">Select track</option>
          <option value={TRACKS.TECH}>Technology</option>
          <option value={TRACKS.DESIGN}>Design</option>
          <option value={TRACKS.BUSINESS}>Business</option>
          <option value={TRACKS.MARKETING}>Marketing</option>
          <option value={TRACKS.PRODUCT}>Product</option>
        </select>
        {errors.track && (
          <p className="mt-1 text-sm text-red-600">{errors.track.message}</p>
        )}
      </div>

      {/* Target Audience */}
      <div>
        <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
          Target Audience
        </label>
        <select
          {...register('targetAudience')}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="">Select target audience</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="all">All levels</option>
        </select>
      </div>

      {/* Requirements */}
      <div>
        <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
          Technical Requirements
        </label>
        <textarea
          {...register('requirements')}
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Any special equipment, software, or setup requirements..."
        />
      </div>

      {/* Co-Speaker Details */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 text-gray-400 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">Co-Speaker Details (Optional)</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="coSpeakerName" className="block text-sm font-medium text-gray-700">
              Co-Speaker Name
            </label>
            <input
              {...register('coSpeakerName')}
              type="text"
              disabled={!canEdit}
              className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                !canEdit ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Co-speaker full name"
            />
          </div>
          <div>
            <label htmlFor="coSpeakerEmail" className="block text-sm font-medium text-gray-700">
              Co-Speaker Email
            </label>
            <input
              {...register('coSpeakerEmail', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email'
                }
              })}
              type="email"
              disabled={!canEdit}
              className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                !canEdit ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="co-speaker@example.com"
            />
            {errors.coSpeakerEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.coSpeakerEmail.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags
        </label>
        <input
          {...register('tags')}
          type="text"
          disabled={!canEdit}
          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
            !canEdit ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          placeholder="Enter tags separated by commas (e.g., React, JavaScript, Frontend)"
        />
        <p className="mt-1 text-sm text-gray-500">
          Add relevant tags to help categorize your session
        </p>
      </div>

      {/* Deadline Warning */}
      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Changes No Longer Allowed
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Session modifications are disabled within one week of the event date. Please contact the event organizers if you need to make urgent changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !canEdit}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            canEdit
              ? 'bg-primary-600 hover:bg-primary-700'
              : 'bg-gray-400 cursor-not-allowed'
          } disabled:opacity-50`}
        >
          {isLoading ? <LoadingSpinner size="sm" text="" /> : (editSession ? 'Update Session' : 'Submit Session')}
        </button>
      </div>
    </form>
  );
};

export default SessionForm;