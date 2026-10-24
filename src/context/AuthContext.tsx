import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

export const OWNER_EMAIL = 'pranavpaunikar.ml24@sbjit.edu.in';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrapOwnerAsSuperadmin: () => Promise<boolean>;
  isOwnerEmail: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Connection test on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  const loadUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      const isOwner = (firebaseUser.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase();

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        if (isOwner && data.role !== 'superadmin') {
          await updateDoc(userRef, { role: 'superadmin' });
          data.role = 'superadmin';
        }
        setProfile(data);
      } else {
        const initialRole: UserRole = isOwner ? 'superadmin' : 'participant';
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL || undefined,
          role: initialRole,
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(userRef, newProfile);
          if (initialRole === 'superadmin') {
            const adminRef = doc(db, 'admins', firebaseUser.uid);
            await setDoc(adminRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'superadmin',
              grantedAt: new Date().toISOString(),
              grantedBy: 'system_bootstrap',
            });
          }
        } catch (e) {
          console.warn('Profile write restricted or offline, using in-memory profile:', e);
        }

        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Developer',
        role: (firebaseUser.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase() ? 'superadmin' : 'participant',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await loadUserProfile(res.user);
      }
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await loadUserProfile(res.user);
      }
    } catch (error) {
      console.error('Email Sign In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        await loadUserProfile(cred.user);
      }
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Sign Out error, resetting local state:', error);
    }
    setUser(null);
    setProfile(null);
  };

  const bootstrapOwnerAsSuperadmin = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const isOwner = (user.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase();
      if (!isOwner) return false;

      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Superadmin',
          role: 'superadmin',
          status: 'active',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      const adminRef = doc(db, 'admins', user.uid);
      await setDoc(adminRef, {
        uid: user.uid,
        email: user.email,
        role: 'superadmin',
        grantedAt: new Date().toISOString(),
        grantedBy: 'owner_bootstrap_action',
      });

      if (profile) {
        setProfile({ ...profile, role: 'superadmin' });
      }
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `admins/${user.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  const currentRole: UserRole = profile?.role || 'participant';
  const isOwnerEmail = (user?.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: isOwnerEmail ? 'superadmin' : currentRole,
        loading,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        logout,\nlogout,
        bootstrapOwnerAsSuperadmin,
        isOwnerEmail,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
