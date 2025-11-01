// Start date at 2:00 UTC on October 26, 2025 (10PM ET on October 25)
const START_DATE = new Date('2025-10-26T02:00:00Z');

/**
 * Calculates the current puzzle day based on the start date
 * Returns 1 for the first day (2025-10-25 at 10PM ET / 2025-10-26 at 2:00 UTC), 2 for the next day, etc.
 * Can be overridden with ?day=x query parameter for testing
 * Use ?tmr=1 to get tomorrow's puzzle
 *
 * Note: Each day starts at 2:00 UTC (10PM ET), so everyone worldwide sees the new puzzle at the same time
 */
export function getCurrentPuzzleDay(): number {
  // Check for testing query param
  const urlParams = new URLSearchParams(window.location.search);
  const dayParam = urlParams.get('day');
  if (dayParam) {
    const parsedDay = parseInt(dayParam, 10);
    if (!isNaN(parsedDay) && parsedDay > 0) {
      return parsedDay;
    }
  }

  const now = new Date();
  const diffTime = now.getTime() - START_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const currentDay = diffDays + 1; // Day 1 is the start date

  // Check for tomorrow parameter
  const tmrParam = urlParams.get('tmr');
  if (tmrParam !== null) {
    return currentDay + 1;
  }

  return currentDay;
}

/**
 * Gets the time remaining until the next puzzle (2:00 UTC / 10PM ET)
 * Returns milliseconds until next day
 */
export function getTimeUntilNextPuzzle(): number {
  const now = new Date();

  // Create a date for today at 2:00 UTC (10PM ET)
  const todayAt2UTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      2,
      0,
      0,
      0
    )
  );

  // If we're past 2:00 UTC today, the next puzzle is tomorrow at 2:00 UTC
  let nextPuzzleTime: Date;
  if (now.getTime() >= todayAt2UTC.getTime()) {
    nextPuzzleTime = new Date(todayAt2UTC.getTime() + 24 * 60 * 60 * 1000);
  } else {
    nextPuzzleTime = todayAt2UTC;
  }

  return nextPuzzleTime.getTime() - now.getTime();
}

/**
 * Formats milliseconds into HH:MM:SS format
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) {
    return 'REFRESH FOR UPDATE';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} UNTIL NEXT`;
}
