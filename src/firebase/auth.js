import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

export const USER_ROLES = {
  SPEAKER: 'speaker',
  EVENT_MANAGER: 'event_manager'
};

// Create user with role
export const createUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, {
      displayName: userData.fullName
    });
    
    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      fullName: userData.fullName,
      role: userData.role,
      phone: userData.phone || '',
      organization: userData.organization || '',
      bio: userData.bio || '',
      profileImage: userData.profileImage || '',
      // New required fields
      track: userData.track || '',
      sessionCategory: userData.sessionCategory || '',
      tshirtSize: userData.tshirtSize || '',
      foodChoice: userData.foodChoice || '',
      // Optional co-speaker fields
      speaker2Name: userData.speaker2Name || null,
      speaker2Email: userData.speaker2Email || null,
      speaker2TshirtSize: userData.speaker2TshirtSize || null,
      // Emergency contact fields
      bloodGroup: userData.bloodGroup || null,
      emergencyContactName: userData.emergencyContactName || null,
      emergencyContactNumber: userData.emergencyContactNumber || null,
      // Professional links
      linkedinProfile: userData.linkedinProfile || null,
      sapCommunityUrl: userData.sapCommunityUrl || null,
      // System fields
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    
    return { user, userData: userDoc };
  } catch (error) {
    throw error;
  }
};

// Sign in user
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return { user, userData: userDoc.data() };
    } else {
      throw new Error('User data not found');
    }
  } catch (error) {
    throw error;
  }
};

// Sign out user
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};

// Get current user data
export const getCurrentUserData = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  return userDoc.exists() ? userDoc.data() : null;
};

// Update user profile
export const updateUserProfile = async (userId, updateData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...updateData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Auth state listener
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};