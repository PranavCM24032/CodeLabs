import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { checkAccess } from '../services/authAllowlist';

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
  accessDenied: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);

  useEffect(() => { testFirestoreConnection(); }, []);

  const loadUserProfile = async (firebaseUser: User) => {
    try {
      const email = (firebaseUser.email || '').toLowerCase();
      const accessCheck = await checkAccess(email);
      if (!accessCheck.allowed) {
        setAccessDenied(true);
        try { await signOut(auth); } catch (e) {}
        setUser(null);
        setProfile(null);
        return;
      }

      const isOwner = email === OWNER_EMAIL.toLowerCase();
      const staffUser = accessCheck.user;
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        if (isOwner || (staffUser && staffUser.role === 'superadmin')) {
          if (data.role !== 'superadmin') { await updateDoc(userRef, { role: 'superadmin' }); data.role = 'superadmin'; }
        } else if (staffUser && staffUser.role === 'admin') {
          if (data.role !== 'admin') { await updateDoc(userRef, { role: 'admin' }); data.role = 'admin'; }
        } else if (accessCheck.type === 'participant') {
          if (data.role !== 'participant') { await updateDoc(userRef, { role: 'participant' }); data.role = 'participant'; }
        }
        setProfile(data);
      } else {
        let initialRole: UserRole = 'participant';
        if (isOwner || (staffUser && staffUser.role === 'superadmin')) initialRole = 'superadmin';
        else if (staffUser && staffUser.role === 'admin') initialRole = 'admin';
        else if (accessCheck.type === 'participant') initialRole = 'participant';

        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: staffUser?.name || firebaseUser.displayName || (firebaseUser.email?.split('@')[0]) || 'User',
          photoURL: firebaseUser.photoURL || undefined,
          role: initialRole,
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(userRef, newProfile);
          if (initialRole === 'superadmin' || initialRole === 'admin') {
            const adminRef = doc(db, 'admins', firebaseUser.uid);
            await setDoc(adminRef, { uid: firebaseUser.uid, email: firebaseUser.email, role: initialRole, grantedAt: new Date().toISOString(), grantedBy: 'allowlist' });
          }
        } catch (e) { console.warn('Profile write restricted:', e); }
        setProfile(newProfile);
      }
      setAccessDenied(false);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setProfile({ uid: firebaseUser.uid, email: firebaseUser.email || '', displayName: firebaseUser.displayName || 'User', role: 'participant', status: 'active', createdAt: new Date().toISOString() });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) await loadUserProfile(currentUser);
      else { setProfile(null); setAccessDenied(false); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try { const res = await signInWithPopup(auth, googleProvider); if (res.user) await loadUserProfile(res.user); }
    finally { setLoading(false); }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try { const res = await signInWithEmailAndPassword(auth, email, pass); if (res.user) await loadUserProfile(res.user); }
    finally { setLoading(false); }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const accessCheck = await checkAccess(email);
      if (!accessCheck.allowed) throw new Error('This email is not authorized to register. Contact the administrator.');
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) { await updateProfile(cred.user, { displayName: name }); await loadUserProfile(cred.user); }
    } finally { setLoading(false); }
  };

  const logout = async () => {
    try { await signOut(auth); } catch (e) {}
    setUser(null); setProfile(null); setAccessDenied(false);
  };

  const bootstrapOwnerAsSuperadmin = async (): Promise<boolean> => {
    if (!user) return false;
    const isOwner = (user.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase();
    if (!isOwner) return false;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { uid: user.uid, email: user.email, displayName: user.displayName || 'Superadmin', role: 'superadmin', status: 'active', updatedAt: new Date().toISOString() }, { merge: true });
      const adminRef = doc(db, 'admins', user.uid);
      await setDoc(adminRef, { uid: user.uid, email: user.email, role: 'superadmin', grantedAt: new Date().toISOString(), grantedBy: 'owner_bootstrap_action' });
      if (profile) setProfile({ ...profile, role: 'superadmin' });
      return true;
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, dmins/); return false; }
  };

  const refreshProfile = async () => { if (user) await loadUserProfile(user); };
  const currentRole: UserRole = profile?.role || 'participant';
  const isOwnerEmail = (user?.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider value={{ user, profile, role: currentRole, loading, signInWithGoogle, signInWithEmail, registerWithEmail, logout, bootstrapOwnerAsSuperadmin, isOwnerEmail, refreshProfile, accessDenied }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

