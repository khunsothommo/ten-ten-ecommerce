import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from './firebase';

const CONTACT_MESSAGES_COLLECTION = 'contact_messages';

export async function addContactMessage({ name, email, subject, message }) {
  return addDoc(collection(db, CONTACT_MESSAGES_COLLECTION), {
    name,
    email,
    subject,
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToContactMessages(onChange, onError) {
  const q = query(collection(db, CONTACT_MESSAGES_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function markContactMessageAsRead(id) {
  const ref = doc(db, CONTACT_MESSAGES_COLLECTION, id);
  return updateDoc(ref, { read: true });
}

export async function markContactMessageAsUnread(id) {
  const ref = doc(db, CONTACT_MESSAGES_COLLECTION, id);
  return updateDoc(ref, { read: false });
}

export async function deleteContactMessage(id) {
  const ref = doc(db, CONTACT_MESSAGES_COLLECTION, id);
  return deleteDoc(ref);
}