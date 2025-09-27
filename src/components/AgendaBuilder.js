import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Calendar, Clock, MapPin, Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const AgendaBuilder = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [agendaItems, setAgendaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    type: 'session', // session, keynote, break, lunch, registration
    startTime: '',
    endTime: '',
    location: '',
    sessionId: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      // Fetch approved sessions
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('status', '==', 'approved')
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessionsData = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(sessionsData);

      // Fetch agenda items
      const agendaQuery = query(collection(db, 'agenda'));
      const agendaSnapshot = await getDocs(agendaQuery);
      const agendaData = agendaSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by start time
      agendaData.sort((a, b) => new Date(`2024-01-01 ${a.startTime}`) - new Date(`2024-01-01 ${b.startTime}`));
      setAgendaItems(agendaData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load agenda data');
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...newItem,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (newItem.type === 'session' && newItem.sessionId) {
        const session = sessions.find(s => s.id === newItem.sessionId);
        itemData.title = session.title;
        itemData.speaker = session.speakerName;
        itemData.description = session.abstract;
      }

      await addDoc(collection(db, 'agenda'), itemData);
      toast.success('Agenda item added successfully!');
      setShowAddModal(false);
      setNewItem({
        title: '',
        type: 'session',
        startTime: '',
        endTime: '',
        location: '',
        sessionId: '',
        description: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error adding agenda item:', error);
      toast.error('Failed to add agenda item');
    }
  };

  const handleUpdateItem = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'agenda', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      toast.success('Agenda item updated successfully!');
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error updating agenda item:', error);
      toast.error('Failed to update agenda item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this agenda item?')) {
      try {
        await deleteDoc(doc(db, 'agenda', id));
        toast.success('Agenda item deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting agenda item:', error);
        toast.error('Failed to delete agenda item');
      }
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'session': return 'bg-blue-100 text-blue-800';
      case 'keynote': return 'bg-purple-100 text-purple-800';
      case 'break': return 'bg-green-100 text-green-800';
      case 'lunch': return 'bg-orange-100 text-orange-800';
      case 'registration': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agenda Builder"
      size="xl"
    >
      <div className="space-y-6">
        {/* Add Item Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Event Schedule</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>

        {/* Agenda Items */}
        {loading ? (
          <LoadingSpinner text="Loading agenda..." />
        ) : (
          <div className="space-y-3">
            {agendaItems.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No agenda items</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first agenda item.</p>
              </div>
            ) : (
              agendaItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {item.startTime} - {item.endTime}
                        </div>
                        {item.location && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {item.location}
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      {item.speaker && (
                        <p className="text-sm text-gray-600">by {item.speaker}</p>
                      )}
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1">{item.description.substring(0, 100)}...</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Publish Button */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => {
              toast.success('Agenda published successfully!');
              onClose();
            }}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Publish Agenda
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Agenda Item"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="session">Session</option>
              <option value="keynote">Keynote</option>
              <option value="break">Break</option>
              <option value="lunch">Lunch</option>
              <option value="registration">Registration</option>
            </select>
          </div>

          {newItem.type === 'session' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Session</label>
              <select
                value={newItem.sessionId}
                onChange={(e) => setNewItem({ ...newItem, sessionId: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Choose a session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title} - {session.speakerName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {newItem.type !== 'session' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={newItem.startTime}
                onChange={(e) => setNewItem({ ...newItem, startTime: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={newItem.endTime}
                onChange={(e) => setNewItem({ ...newItem, endTime: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={newItem.location}
              onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Main Hall, Room A, Online"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Add Item
            </button>
          </div>
        </form>
      </Modal>
    </Modal>
  );
};

export default AgendaBuilder;