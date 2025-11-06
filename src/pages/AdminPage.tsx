import { useState } from 'react';

import { PuzzleManager } from '../components/FirebaseTest/PuzzleManager';
import { ToastProvider } from '../context/ToastContext';

import styles from './AdminPage.module.css';

export function AdminPage() {
  const [userName, setUserName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setUserName(inputValue.trim());
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.accessControl}>
        <div className={styles.loginBox}>
          <h2>Admin Access</h2>
          <p>Enter your name to continue</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={e =>
                setInputValue(
                  e.target.value.toLowerCase().replace(/[^a-z]/g, '')
                )
              }
              placeholder="Your name"
              className={styles.input}
              autoFocus
            />
            <button type="submit" className={styles.button}>
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div>
        <div className={styles.header}>
          <h1>Admin Panel</h1>
          <div className={styles.userInfo}>
            Logged in as: <strong>{userName}</strong>
          </div>
        </div>
        <PuzzleManager userName={userName} />
      </div>
    </ToastProvider>
  );
}
