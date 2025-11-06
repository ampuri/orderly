import {
  Lock,
  EyeOff,
  FlaskConical,
  Pencil,
  ChevronUp,
  ChevronDown,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import type { RawDailyRiddleData } from '../../context/GameContext';
import { useToast } from '../../context/ToastContext';
import { getCurrentPuzzleDay } from '../../utils/puzzleDay';
import {
  getAllPuzzles,
  addPuzzle,
  movePuzzle,
  deletePuzzle,
  editPuzzle,
  getDBVersion,
  ConcurrentEditError,
} from '../../utils/puzzleManager';

import { PuzzleFormModal } from './PuzzleFormModal';
import styles from './PuzzleManager.module.css';

interface PuzzleManagerProps {
  userName: string;
}

export function PuzzleManager({ userName }: PuzzleManagerProps) {
  const [puzzles, setPuzzles] = useState<RawDailyRiddleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<RawDailyRiddleData | null>(
    null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [dbVersion, setDbVersion] = useState<number>(0);
  const [isOutdated, setIsOutdated] = useState(false);
  const { showToast } = useToast();

  // Get current puzzle day for access control
  const currentDay = getCurrentPuzzleDay();

  // Check if a puzzle is disabled or hidden based on logic
  const isPuzzleDisabled = (puzzle: RawDailyRiddleData) => {
    // Puzzles on or before current day are disabled (already shown to users)
    return puzzle.day <= currentDay;
  };

  const isPuzzleHidden = (puzzle: RawDailyRiddleData) => {
    // Puzzles by other authors are hidden (no spoilers)
    return puzzle.author !== userName.toLowerCase();
  };

  const getTestingLink = (puzzle: RawDailyRiddleData) => {
    // Base64 encode the question for the test parameter
    const encodedQuestion = btoa(puzzle.question);
    return `/#/?test=${encodedQuestion}`;
  };

  const loadPuzzles = async () => {
    try {
      setLoading(true);
      const [data, version] = await Promise.all([
        getAllPuzzles(),
        getDBVersion(),
      ]);
      setPuzzles(data);
      setDbVersion(version);
      setIsOutdated(false);
    } catch (err) {
      console.error('Load error:', err);
      showToast('Failed to load puzzles', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load puzzles on mount
  useEffect(() => {
    loadPuzzles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for version changes every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentVersion = await getDBVersion();
        if (currentVersion !== dbVersion) {
          setIsOutdated(true);
        }
      } catch (err) {
        console.error('Version check error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [dbVersion]);

  const handleSaveNewPuzzle = async (puzzleData: RawDailyRiddleData) => {
    try {
      setLoading(true);
      const { author, ...puzzleWithoutDay } = puzzleData;
      const newPuzzle = await addPuzzle(
        puzzleWithoutDay,
        author || userName,
        dbVersion
      );
      showToast(`Added puzzle for day ${newPuzzle.day}`, 'success');
      await loadPuzzles();
    } catch (err) {
      console.error('Add error:', err);
      if (err instanceof ConcurrentEditError) {
        showToast(err.message, 'error');
        await loadPuzzles(); // Refresh to get latest data
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        showToast(errorMsg, 'error');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditPuzzle = async (puzzleData: RawDailyRiddleData) => {
    try {
      setLoading(true);
      await editPuzzle(puzzleData, dbVersion);
      showToast(`Updated puzzle day ${puzzleData.day}`, 'success');
      await loadPuzzles();
    } catch (err) {
      console.error('Edit error:', err);
      if (err instanceof ConcurrentEditError) {
        showToast(err.message, 'error');
        await loadPuzzles(); // Refresh to get latest data
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        showToast(errorMsg, 'error');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (day: number, direction: 'up' | 'down') => {
    try {
      setLoading(true);
      await movePuzzle(day, direction, dbVersion);
      showToast(`Moved puzzle ${day} ${direction}`, 'success');
      await loadPuzzles();
    } catch (err) {
      console.error('Move error:', err);
      if (err instanceof ConcurrentEditError) {
        showToast(err.message, 'error');
        await loadPuzzles(); // Refresh to get latest data
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        showToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (day: number) => {
    if (
      !confirm(
        `Delete puzzle ${day}? This will renumber all subsequent puzzles.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await deletePuzzle(day, dbVersion);
      showToast(`Deleted puzzle ${day}`, 'success');
      await loadPuzzles();
    } catch (err) {
      console.error('Delete error:', err);
      if (err instanceof ConcurrentEditError) {
        showToast(err.message, 'error');
        await loadPuzzles(); // Refresh to get latest data
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        showToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Puzzle Manager</h2>

      <div className={styles.infoBox}>
        <strong>Current Day: {currentDay}</strong>
        <div className={styles.infoText}>
          <Lock
            size={14}
            style={{ verticalAlign: 'middle', display: 'inline' }}
          />{' '}
          Puzzles ≤ Day {currentDay} are locked (already shown) •{' '}
          <EyeOff
            size={14}
            style={{ verticalAlign: 'middle', display: 'inline' }}
          />{' '}
          Other authors' puzzles are hidden
        </div>
      </div>

      {isOutdated && (
        <div className={styles.warningBanner}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            Data has changed. Please refresh to pull the latest updates.
          </span>
          <button onClick={loadPuzzles} className={styles.refreshButton}>
            Refresh Now
          </button>
        </div>
      )}

      <div className={styles.actions}>
        <button
          onClick={() => setIsCreatingNew(true)}
          disabled={loading}
          className={styles.button}
        >
          Add New Puzzle
        </button>
      </div>

      {loading && <div className={styles.loading}>Loading...</div>}

      <div className={styles.puzzleList}>
        {puzzles.map((puzzle, index) => {
          const isDisabled = isPuzzleDisabled(puzzle);
          // Hidden only applies if not disabled (disabled takes priority)
          const isHidden = !isDisabled && isPuzzleHidden(puzzle);

          // Check if we can move up/down (can't move into disabled entries)
          const targetUpPuzzle = index > 0 ? puzzles[index - 1] : null;
          const targetDownPuzzle =
            index < puzzles.length - 1 ? puzzles[index + 1] : null;
          const canMoveUp =
            index > 0 &&
            !isDisabled &&
            !isHidden &&
            targetUpPuzzle &&
            !isPuzzleDisabled(targetUpPuzzle);
          const canMoveDown =
            index < puzzles.length - 1 &&
            !isDisabled &&
            !isHidden &&
            targetDownPuzzle &&
            !isPuzzleDisabled(targetDownPuzzle);

          return (
            <div
              key={puzzle.day}
              className={`${styles.puzzleItem} ${isDisabled ? styles.disabled : ''} ${isHidden ? styles.hidden : ''}`}
            >
              <div className={styles.puzzleHeader}>
                <strong className={styles.dayHeader}>
                  Day {puzzle.day}
                  {isDisabled && (
                    <Lock size={16} className={styles.statusIcon} />
                  )}
                  {isHidden && (
                    <EyeOff size={16} className={styles.statusIcon} />
                  )}
                </strong>
                <div className={styles.puzzleActions}>
                  {!isHidden && (
                    <a
                      href={getTestingLink(puzzle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.testButton}
                      title="Test puzzle"
                    >
                      <FlaskConical size={16} />
                    </a>
                  )}
                  <button
                    onClick={() => setEditingPuzzle(puzzle)}
                    disabled={loading || isHidden}
                    className={styles.infoButton}
                    title={isHidden ? 'Hidden puzzle' : 'Edit puzzle'}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleMove(puzzle.day, 'up')}
                    disabled={loading || !canMoveUp}
                    className={styles.smallButton}
                    title="Move up"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMove(puzzle.day, 'down')}
                    disabled={loading || !canMoveDown}
                    className={styles.smallButton}
                    title="Move down"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(puzzle.day)}
                    disabled={loading || isDisabled || isHidden}
                    className={styles.deleteButton}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className={styles.puzzleContent}>
                {isHidden ? (
                  <div className={styles.question}>[Hidden Puzzle]</div>
                ) : (
                  <div className={styles.question}>{puzzle.question}</div>
                )}
                {puzzle.author && (
                  <div className={styles.author}>by {puzzle.author}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingPuzzle && (
        <PuzzleFormModal
          puzzle={editingPuzzle}
          onSave={handleSaveEditPuzzle}
          onClose={() => setEditingPuzzle(null)}
          userName={userName}
          disabled={isPuzzleDisabled(editingPuzzle)}
        />
      )}

      {isCreatingNew && (
        <PuzzleFormModal
          onSave={handleSaveNewPuzzle}
          onClose={() => setIsCreatingNew(false)}
          userName={userName}
        />
      )}
    </div>
  );
}
