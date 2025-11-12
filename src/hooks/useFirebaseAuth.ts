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
        if (currentUser) {
          // User is signed in, we can stop loading
          setUser(currentUser);
          setLoading(false);
        } else {
          // No user yet, sign in anonymously but keep loading=true
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
