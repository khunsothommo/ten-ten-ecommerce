import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export function subscribeToCart(uid, onChange, onError) {
  const ref = doc(db, 'carts', uid);
  return onSnapshot(
    ref,
    (snap) => {
      onChange(snap.exists() ? snap.data().items || [] : []);
    },
    onError
  );
}

export async function getCartOnce(uid) {
  const ref = doc(db, 'carts', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().items || [] : [];
}

export async function saveCart(uid, items) {
  const ref = doc(db, 'carts', uid);
  return setDoc(ref, { items, updatedAt: serverTimestamp() });
}
