import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { DEFAULT_USER_PROFILE } from '../utils/constants';

/**
 * Sign up a new user and create their Firestore profile
 */
export const signUp = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    ...DEFAULT_USER_PROFILE,
    name,
    email,
    healthGoal: '',
    selectedInterests: [],
    createdAt: new Date().toISOString(),
  });

  return user;
};

/**
 * Log in an existing user
 */
export const logIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Log out the current user
 */
export const logOut = async () => {
  await signOut(auth);
};
