import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const ORDERS_COLLECTION = 'orders';

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'completed',
  'cancelled',
];

export async function createOrder({ uid, customer, items, subtotal }) {
  return addDoc(collection(db, ORDERS_COLLECTION), {
    uid: uid || null,
    customer,
    items,
    subtotal,
    total: subtotal,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function getOrderOnce(orderId) {
  const ref = doc(db, ORDERS_COLLECTION, orderId);
  const snap = await getDoc(ref);

  return snap.exists()
    ? { id: snap.id, ...snap.data() }
    : null;
}

export function subscribeToOrders(onChange, onError) {
  const q = query(
    collection(db, ORDERS_COLLECTION)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      orders.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;
      });

      onChange(orders);
    },
    onError
  );
}

export function subscribeToUserOrders(uid, onChange, onError) {
  if (!uid) {
    onChange([]);
    return () => {};
  }

  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('uid', '==', uid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      orders.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;
      });

      onChange(orders);
    },
    onError
  );
}

export async function updateOrderStatus(orderId, status) {
  const ref = doc(db, ORDERS_COLLECTION, orderId);

  return updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}