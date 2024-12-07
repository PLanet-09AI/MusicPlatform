import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';
import type { LoginFormData, SignupFormData } from './validation';

export async function signUp(data: SignupFormData): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );

  // Update display name
  await updateProfile(userCredential.user, {
    displayName: data.name
  });

  // Create user document
  const userData: Omit<User, 'id'> = {
    email: data.email,
    name: data.name,
    role: 'user',
    createdAt: new Date()
  };

  await setDoc(doc(db, 'users', userCredential.user.uid), userData);

  return {
    id: userCredential.user.uid,
    ...userData
  };
}

export async function signIn(data: LoginFormData): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );

  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  if (!userDoc.exists()) {
    throw new Error('User data not found');
  }

  const userData = userDoc.data() as Omit<User, 'id'>;
  return {
    id: userCredential.user.uid,
    ...userData
  };
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function getCurrentUser(): Promise<User | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) return null;

  const userData = userDoc.data() as Omit<User, 'id'>;
  return {
    id: user.uid,
    ...userData
  };
}

export async function createAdminUser(email: string, password: string): Promise<User> {
  // Check if admin exists
  const adminQuery = await getDoc(doc(db, 'users', 'admin'));
  if (adminQuery.exists()) {
    throw new Error('Admin user already exists');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  const userData: Omit<User, 'id'> = {
    email,
    name: 'Admin',
    role: 'admin',
    createdAt: new Date()
  };

  await setDoc(doc(db, 'users', userCredential.user.uid), userData);

  return {
    id: userCredential.user.uid,
    ...userData
  };
}