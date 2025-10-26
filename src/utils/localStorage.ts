import type { GameState } from '../context/GameContext';

const ORDERLY_KEY = 'orderlyData';

type OrderlyData = Record<number, GameState>;

/**
 * Reads all orderly data from localStorage
 */
function readAllData(): OrderlyData {
  try {
    const data = localStorage.getItem(ORDERLY_KEY);
    if (!data) {
      return {};
    }
    return JSON.parse(data) as OrderlyData;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return {};
  }
}

/**
 * Writes all orderly data to localStorage
 */
function writeAllData(data: OrderlyData): void {
  try {
    localStorage.setItem(ORDERLY_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

/**
 * Updates the game state for a specific game day in localStorage
 */
export function updateLocalStorage(
  gameDay: number,
  gameState: GameState
): void {
  const allData = readAllData();
  allData[gameDay] = gameState;
  writeAllData(allData);
}

/**
 * Removes the game state for a specific game day from localStorage
 */
export function flushLocalStorage(gameDay: number): void {
  const allData = readAllData();
  delete allData[gameDay];
  writeAllData(allData);
}

/**
 * Reads the game state for a specific game day from localStorage
 * Returns undefined if no data exists for that day
 */
export function readFromLocalStorage(gameDay: number): GameState | undefined {
  const allData = readAllData();
  return allData[gameDay];
}

/**
 * Clears all orderly data from localStorage
 */
export function clearAllLocalStorage(): void {
  try {
    localStorage.removeItem(ORDERLY_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
