import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from './firebase';
import { isAllowedAdminEmail } from '../utils/adminAllowlist';

export async function ensureUserDocument(user, name = '') {
  if (!user) return;

  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: name.trim() || user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: isAllowedAdminEmail(user.email) ? 'admin' : 'user',
      createdAt: serverTimestamp(),
    });

    return;
  }

  const existing = snap.data();

  if (!existing.name && (name.trim() || user.displayName)) {
    await setDoc(
      ref,
      {
        name: name.trim() || user.displayName || '',
        email: user.email || existing.email || '',
        photoURL: user.photoURL || existing.photoURL || '',
      },
      { merge: true }
    );
  }
}

export async function registerUser({ name, email, password }) {
  const cleanName = name.trim();
  const cleanEmail = email.trim();

  const cred = await createUserWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  if (cleanName) {
    await updateProfile(cred.user, {
      displayName: cleanName,
    });
  }

  await ensureUserDocument(cred.user, cleanName);

  return cred.user;
}

export async function loginUser({ email, password }) {
  const cred = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  await ensureUserDocument(cred.user);

  return cred.user;
}

export async function logoutUser() {
  return signOut(auth);
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email.trim());
}