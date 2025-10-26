import { useState, useEffect } from 'react';

import {
  getTimeUntilNextPuzzle,
  formatTimeRemaining,
} from '../utils/puzzleDay';

/**
 * Hook that provides a countdown timer until the next puzzle
 * Updates every second
 */
export function useCountdown(): string {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    formatTimeRemaining(getTimeUntilNextPuzzle())
  );

  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(getTimeUntilNextPuzzle()));
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeRemaining;
}
