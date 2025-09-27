import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugAuth = () => {
  const { user, userData, loading, isAuthenticated, isSpeaker, isEventManager } = useAuth();

  console.log('Debug Auth State:', {
    user,
    userData,
    loading,
    isAuthenticated,
    isSpeaker,
    isEventManager
  });

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="text-sm font-bold mb-2">Debug Auth</h3>
      <div className="text-xs space-y-1">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
        <div>User UID: {user?.uid || 'null'}</div>
        <div>User Role: {userData?.role || 'null'}</div>
        <div>User Name: {userData?.fullName || 'null'}</div>
        <div>Is Speaker: {isSpeaker ? 'true' : 'false'}</div>
        <div>Is Event Manager: {isEventManager ? 'true' : 'false'}</div>
      </div>
    </div>
  );
};

export default DebugAuth;