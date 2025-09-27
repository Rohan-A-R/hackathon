import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUserData } from '../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          const userInfo = await getCurrentUserData();
          setUser(firebaseUser);
          setUserData(userInfo);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateUserData = (newUserData) => {
    setUserData(newUserData);
  };

  const value = {
    user,
    userData,
    loading,
    updateUserData,
    isAuthenticated: !!user,
    isSpeaker: userData?.role === 'speaker',
    isEventManager: userData?.role === 'event_manager'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};