import { useEffect, useState } from 'react';
import { subscribeToContactMessages } from '../firebase/contactMessages';

export default function useContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToContactMessages(
      (data) => {
        setMessages(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        setError(err);
      }
    );
    return unsubscribe;
  }, []);

  const unreadCount = messages.filter((m) => !m.read).length;

  return { messages, loading, error, unreadCount };
}