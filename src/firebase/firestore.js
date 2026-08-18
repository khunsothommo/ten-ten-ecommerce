import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from './firebase';

const PRODUCTS_COLLECTION = 'products';

export function subscribeToProducts(onChange, onError) {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const products = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onChange(products);
    },
    onError
  );
}

export async function getProductsOnce() {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function addProduct(product) {
  return addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...product,
    createdAt: serverTimestamp(),
  });
}

export async function bulkAddProducts(products) {
  const results = await Promise.allSettled(
    products.map((product) => {
      const { id, ...rest } = product; 
      return addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...rest,
        createdAt: serverTimestamp(),
      });
    })
  );
 
  const failed = results.filter((r) => r.status === 'rejected');
  return { succeeded: results.length - failed.length, failed: failed.length };
}
 
export async function updateProduct(id, product) {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  return updateDoc(ref, { ...product, updatedAt: serverTimestamp() });
}
 
export async function deleteProduct(id) {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  return deleteDoc(ref);
}