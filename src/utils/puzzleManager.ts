import { ref, set, get, remove } from 'firebase/database';

import type { RawDailyRiddleData } from '../context/GameContext';

import { database } from './firebase';

const PUZZLES_PATH = 'puzzles';
const VERSION_PATH = 'dbVersion';

export class ConcurrentEditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrentEditError';
  }
}

/**
 * Gets the current global database version
 */
export async function getDBVersion(): Promise<number> {
  const versionRef = ref(database, VERSION_PATH);
  const snapshot = await get(versionRef);
  return snapshot.exists() ? (snapshot.val() as number) : 0;
}

/**
 * Increments the global database version
 */
async function incrementDBVersion(): Promise<void> {
  const currentVersion = await getDBVersion();
  const versionRef = ref(database, VERSION_PATH);
  await set(versionRef, currentVersion + 1);
}

/**
 * Fetches all puzzles from Firebase
 */
export async function getAllPuzzles(): Promise<RawDailyRiddleData[]> {
  const puzzlesRef = ref(database, PUZZLES_PATH);
  const snapshot = await get(puzzlesRef);

  if (!snapshot.exists()) {
    return [];
  }

  const puzzlesObj = snapshot.val() as Record<string, RawDailyRiddleData>;
  return Object.values(puzzlesObj).sort((a, b) => a.day - b.day);
}

/**
 * Adds a new puzzle to Firebase
 * Automatically assigns the next available day number
 */
export async function addPuzzle(
  puzzle: Omit<RawDailyRiddleData, 'day'>,
  author: string,
  expectedDBVersion: number
): Promise<RawDailyRiddleData> {
  // Check version
  const currentVersion = await getDBVersion();
  if (currentVersion !== expectedDBVersion) {
    throw new ConcurrentEditError(
      'Database has been modified. Please refresh and try again.'
    );
  }

  const allPuzzles = await getAllPuzzles();
  const maxDay =
    allPuzzles.length > 0 ? Math.max(...allPuzzles.map(p => p.day)) : 0;
  const newDay = maxDay + 1;

  const newPuzzle: RawDailyRiddleData = {
    ...puzzle,
    day: newDay,
    author: author.toLowerCase(),
    lastModified: Date.now(),
  };

  const puzzleRef = ref(database, `${PUZZLES_PATH}/${newDay}`);
  await set(puzzleRef, newPuzzle);
  await incrementDBVersion();

  return newPuzzle;
}

/**
 * Moves a puzzle up or down by swapping day numbers with adjacent puzzle
 * @param day - The day number of the puzzle to move
 * @param direction - 'up' to move earlier (decrease day), 'down' to move later (increase day)
 */
export async function movePuzzle(
  day: number,
  direction: 'up' | 'down',
  expectedDBVersion: number
): Promise<void> {
  // Check version
  const currentVersion = await getDBVersion();
  if (currentVersion !== expectedDBVersion) {
    throw new ConcurrentEditError(
      'Database has been modified. Please refresh and try again.'
    );
  }

  const allPuzzles = await getAllPuzzles();
  const currentIndex = allPuzzles.findIndex(p => p.day === day);

  if (currentIndex === -1) {
    throw new Error(`Puzzle with day ${day} not found`);
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= allPuzzles.length) {
    throw new Error(
      `Cannot move puzzle ${direction}: already at the ${direction === 'up' ? 'top' : 'bottom'}`
    );
  }

  const currentPuzzle = allPuzzles[currentIndex];
  const targetPuzzle = allPuzzles[targetIndex];

  // Swap day numbers
  const tempDay = currentPuzzle.day;
  currentPuzzle.day = targetPuzzle.day;
  targetPuzzle.day = tempDay;
  currentPuzzle.lastModified = Date.now();
  targetPuzzle.lastModified = Date.now();

  // Update both puzzles
  const newCurrentRef = ref(database, `${PUZZLES_PATH}/${currentPuzzle.day}`);
  const newTargetRef = ref(database, `${PUZZLES_PATH}/${targetPuzzle.day}`);

  await Promise.all([
    set(newCurrentRef, currentPuzzle),
    set(newTargetRef, targetPuzzle),
  ]);

  await incrementDBVersion();
}

/**
 * Deletes a puzzle and renumbers all subsequent puzzles
 * @param day - The day number of the puzzle to delete
 */
export async function deletePuzzle(
  day: number,
  expectedDBVersion: number
): Promise<void> {
  // Check version
  const currentVersion = await getDBVersion();
  if (currentVersion !== expectedDBVersion) {
    throw new ConcurrentEditError(
      'Database has been modified. Please refresh and try again.'
    );
  }

  const allPuzzles = await getAllPuzzles();
  const puzzleIndex = allPuzzles.findIndex(p => p.day === day);

  if (puzzleIndex === -1) {
    throw new Error(`Puzzle with day ${day} not found`);
  }

  // Remove the puzzle
  const puzzleRef = ref(database, `${PUZZLES_PATH}/${day}`);
  await remove(puzzleRef);

  // Renumber all puzzles after the deleted one
  const puzzlesToRenumber = allPuzzles.slice(puzzleIndex + 1);

  if (puzzlesToRenumber.length > 0) {
    const updates = puzzlesToRenumber.map((puzzle, index) => {
      const oldDay = puzzle.day;
      const newDay = day + index;

      // Delete old entry and create new one
      const oldRef = ref(database, `${PUZZLES_PATH}/${oldDay}`);
      const newRef = ref(database, `${PUZZLES_PATH}/${newDay}`);

      const updatedPuzzle = {
        ...puzzle,
        day: newDay,
        lastModified: Date.now(),
      };

      return Promise.all([remove(oldRef), set(newRef, updatedPuzzle)]);
    });

    await Promise.all(updates);
  }

  await incrementDBVersion();
}

/**
 * Updates an existing puzzle
 * @param day - The day number of the puzzle to update
 * @param updates - Partial puzzle data to update
 */
export async function updatePuzzle(
  day: number,
  updates: Partial<Omit<RawDailyRiddleData, 'day'>>
): Promise<void> {
  const allPuzzles = await getAllPuzzles();
  const puzzle = allPuzzles.find(p => p.day === day);

  if (!puzzle) {
    throw new Error(`Puzzle with day ${day} not found`);
  }

  const updatedPuzzle = { ...puzzle, ...updates };
  const puzzleRef = ref(database, `${PUZZLES_PATH}/${day}`);
  await set(puzzleRef, updatedPuzzle);
}

/**
 * Edits an existing puzzle
 * @param puzzle - The complete puzzle data to save
 * @throws ConcurrentEditError if the database has been modified by someone else
 */
export async function editPuzzle(
  puzzle: RawDailyRiddleData,
  expectedDBVersion: number
): Promise<void> {
  // Check version
  const currentVersion = await getDBVersion();
  if (currentVersion !== expectedDBVersion) {
    throw new ConcurrentEditError(
      'Database has been modified. Please refresh and try again.'
    );
  }

  const puzzleRef = ref(database, `${PUZZLES_PATH}/${puzzle.day}`);

  // Refetch to make sure puzzle exists
  const snapshot = await get(puzzleRef);
  if (!snapshot.exists()) {
    throw new Error(
      `Puzzle day ${puzzle.day} does not exist in database. Please upload puzzles first.`
    );
  }

  // Update puzzle
  const updatedPuzzle = {
    ...puzzle,
    lastModified: Date.now(),
  };

  await set(puzzleRef, updatedPuzzle);
  await incrementDBVersion();
}

/**
 * Uploads all puzzles from a JSON array to Firebase
 * Useful for initial seeding or bulk import
 */
export async function uploadPuzzles(
  puzzles: RawDailyRiddleData[],
  defaultAuthor: string = 'amp'
): Promise<void> {
  const puzzlesRef = ref(database, PUZZLES_PATH);
  const puzzlesObj: Record<string, RawDailyRiddleData> = {};

  puzzles.forEach(puzzle => {
    puzzlesObj[puzzle.day] = {
      ...puzzle,
      author: puzzle.author || defaultAuthor.toLowerCase(),
      lastModified: Date.now(),
    };
  });

  await set(puzzlesRef, puzzlesObj);
  await incrementDBVersion();
}
