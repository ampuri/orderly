const START_DATE = new Date('2025-10-26T00:00:00');

/**
 * Calculates the current puzzle day based on the start date
 * Returns 1 for the first day (2025-10-26), 2 for the next day, etc.
 * Can be overridden with ?day=x query parameter for testing
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
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfStartDate = new Date(
    START_DATE.getFullYear(),
    START_DATE.getMonth(),
    START_DATE.getDate()
  );

  const diffTime = startOfToday.getTime() - startOfStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1; // Day 1 is the start date
}

/**
 * Gets the time remaining until the next puzzle (midnight)
 * Returns milliseconds until next day
 */
export function getTimeUntilNextPuzzle(): number {
  const now = new Date();

  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  return tomorrow.getTime() - now.getTime();
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
