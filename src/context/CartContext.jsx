import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToCart, saveCart } from '../firebase/cart';

const CartContext = createContext(null);

function mergeItems(a, b) {
  const map = new Map(a.map((item) => [item.productId, { ...item }]));
  for (const item of b) {
    if (map.has(item.productId)) {
      map.get(item.productId).quantity += item.quantity;
    } else {
      map.set(item.productId, { ...item });
    }
  }
  return Array.from(map.values());
}

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const guestItemsAtLogin = useRef(null);

 
  useEffect(() => {
    if (!currentUser) {
      guestItemsAtLogin.current = null;
      return;
    }

    guestItemsAtLogin.current = items;
    setLoading(true);

    const unsubscribe = subscribeToCart(
      currentUser.uid,
      (firestoreItems) => {
        setItems(() => {
          
          if (guestItemsAtLogin.current) {
            const merged = mergeItems(firestoreItems, guestItemsAtLogin.current);
            guestItemsAtLogin.current = null;
            if (merged.length !== firestoreItems.length || merged.some((m, i) => m.quantity !== firestoreItems[i]?.quantity)) {
              saveCart(currentUser.uid, merged).catch(() => {});
            }
            return merged;
          }
          return firestoreItems;
        });
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsubscribe;
  
  }, [currentUser]);

  const persist = (nextItems) => {
    setItems(nextItems);
    if (currentUser) {
      saveCart(currentUser.uid, nextItems).catch(() => {});
    }
  };

  const addItem = (product, quantity = 1) => {
    const existing = items.find((i) => i.productId === product.id);
    let next;
    if (existing) {
      next = items.map((i) =>
        i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      next = [
        ...items,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image || '',
          quantity,
        },
      ];
    }
    persist(next);
  };

  const removeItem = (productId) => {
    persist(items.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    persist(items.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  };

  const clearCart = () => persist([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const value = {
    items,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
