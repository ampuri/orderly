import {
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '../utils/firebase';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      currentUser => {
        setUser(currentUser);
        setLoading(false);

        // If no user, sign in anonymously
        if (!currentUser) {
          signInAnonymously(auth).catch(err => {
            console.error('Error signing in anonymously:', err);
            setError(err.message);
            setLoading(false);
          });
        }
      },
      err => {
        console.error('Auth state change error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}
