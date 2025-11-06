import { useState, useEffect } from 'react';

import type { RawDailyRiddleData } from '../../context/GameContext';
import { useToast } from '../../context/ToastContext';

import styles from './PuzzleFormModal.module.css';

interface PuzzleFormModalProps {
  puzzle?: RawDailyRiddleData;
  onSave: (puzzle: RawDailyRiddleData) => Promise<void>;
  onClose: () => void;
  userName: string;
  disabled?: boolean;
}

// Extract keywords from question (words between $$)
function extractKeywords(question: string): string[] {
  const matches = question.match(/\$\$([^$]+)\$\$/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/\$\$/g, '').trim());
}

export function PuzzleFormModal({
  puzzle,
  onSave,
  onClose,
  userName,
  disabled = false,
}: PuzzleFormModalProps) {
  const isNewPuzzle = !puzzle;
  const { showToast } = useToast();

  const [question, setQuestion] = useState(
    puzzle?.question || 'This is my $$new$$ $$puzzle$$'
  );
  const [intendedOrder, setIntendedOrder] = useState<string[]>(
    puzzle?.intendedOrder || [
      'item 1',
      'item 2',
      'item 3',
      'item 4',
      'item 5',
      'item 6',
    ]
  );
  const [alsoAccepts, setAlsoAccepts] = useState<Record<string, string[]>>(
    puzzle?.alsoAccepts || {
      new: ['fresh', 'latest'],
      puzzle: ['riddle', 'challenge'],
    }
  );
  const [highestText, setHighestText] = useState(puzzle?.highestText || 'most');
  const [lowestText, setLowestText] = useState(puzzle?.lowestText || 'least');
  const [saving, setSaving] = useState(false);

  // Track keywords from question
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newSynonyms, setNewSynonyms] = useState<Record<string, string>>({});

  useEffect(() => {
    const extracted = extractKeywords(question);
    setKeywords(extracted);

    // Initialize alsoAccepts for new keywords
    setAlsoAccepts(prev => {
      const updated = { ...prev };
      extracted.forEach(keyword => {
        if (!updated[keyword]) {
          updated[keyword] = [];
        }
      });
      // Remove keywords that are no longer in the question
      Object.keys(updated).forEach(key => {
        if (!extracted.includes(key)) {
          delete updated[key];
        }
      });
      return updated;
    });
  }, [question]);

  const handleIntendedOrderChange = (index: number, value: string) => {
    const newOrder = [...intendedOrder];
    newOrder[index] = value;
    setIntendedOrder(newOrder);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...intendedOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];
    setIntendedOrder(newOrder);
  };

  const handleAddSynonym = (keyword: string) => {
    const synonym = newSynonyms[keyword]?.trim();
    if (!synonym) return;

    setAlsoAccepts(prev => ({
      ...prev,
      [keyword]: [...(prev[keyword] || []), synonym],
    }));
    setNewSynonyms(prev => ({ ...prev, [keyword]: '' }));
  };

  const handleRemoveSynonym = (keyword: string, synonym: string) => {
    setAlsoAccepts(prev => ({
      ...prev,
      [keyword]: prev[keyword].filter(s => s !== synonym),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that we have exactly 6 items
    const validItems = intendedOrder.filter(item => item.trim() !== '');
    if (validItems.length !== 6) {
      showToast(
        'Please provide exactly 6 items in the intended order',
        'warning'
      );
      return;
    }

    try {
      setSaving(true);
      const puzzleData: RawDailyRiddleData = {
        day: puzzle?.day || 0, // Will be set by addPuzzle if new
        question,
        intendedOrder: validItems,
        alsoAccepts,
        ...(highestText && { highestText }),
        ...(lowestText && { lowestText }),
        author: userName.toLowerCase(),
        lastModified: puzzle?.lastModified,
      };

      await onSave(puzzleData);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      showToast(
        `Error saving: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className={styles.header}>
            <h2>
              {isNewPuzzle ? 'New Puzzle' : `Edit Puzzle Day ${puzzle.day}`}
              {disabled && ' 🔒 (Read-only)'}
            </h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className={styles.content}>
            <div className={styles.section}>
              <label className={styles.label}>Question</label>
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className={styles.input}
                required
                placeholder="$$word1$$ $$word2$$"
                disabled={disabled}
              />
              <div className={styles.hint}>
                Use $$word$$ syntax for blanks that need to be filled
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label}>Author</label>
              <div className={styles.readOnlyField}>{userName}</div>
            </div>

            <div className={styles.section}>
              <label className={styles.label}>Intended Order</label>
              <div className={styles.orderList}>
                {intendedOrder.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <span className={styles.orderNumber}>{index + 1}.</span>
                    <input
                      type="text"
                      value={item}
                      onChange={e =>
                        handleIntendedOrderChange(index, e.target.value)
                      }
                      className={styles.orderInput}
                      placeholder={`Item ${index + 1}`}
                      required
                      disabled={disabled}
                    />
                    <div className={styles.moveButtons}>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, 'up')}
                        className={styles.moveButton}
                        disabled={index === 0 || disabled}
                        title="Move up"
                      >
                        ⬆️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, 'down')}
                        className={styles.moveButton}
                        disabled={
                          index === intendedOrder.length - 1 || disabled
                        }
                        title="Move down"
                      >
                        ⬇️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label}>Also-accepted Keywords</label>
              <div className={styles.hint}>
                Add synonyms for each keyword in your question, they will also
                be accepted.
              </div>
              {keywords.length === 0 && (
                <div className={styles.noKeywords}>
                  No keywords found. Use $$keyword$$ syntax in your question.
                </div>
              )}
              {keywords.map(keyword => (
                <div key={keyword} className={styles.keywordSection}>
                  <div className={styles.keywordHeader}>
                    <strong className={styles.keywordName}>{keyword}</strong>
                  </div>
                  <div className={styles.synonymPills}>
                    {(alsoAccepts[keyword] || []).map(synonym => (
                      <div key={synonym} className={styles.pill}>
                        <span>{synonym}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSynonym(keyword, synonym)}
                          className={styles.pillRemove}
                          disabled={disabled}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {!disabled && (
                      <div className={styles.addSynonym}>
                        <input
                          type="text"
                          value={newSynonyms[keyword] || ''}
                          onChange={e =>
                            setNewSynonyms(prev => ({
                              ...prev,
                              [keyword]: e.target.value,
                            }))
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSynonym(keyword);
                            }
                          }}
                          placeholder="Add synonym..."
                          className={styles.synonymInput}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSynonym(keyword)}
                          className={styles.addSynonymButton}
                          disabled={!newSynonyms[keyword]?.trim()}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.section}>
              <label className={styles.label}>Highest Text</label>
              <input
                type="text"
                value={highestText}
                onChange={e => setHighestText(e.target.value)}
                className={styles.input}
                placeholder="e.g., 'earlier', 'most', leave empty for default"
                disabled={disabled}
              />
            </div>

            <div className={styles.section}>
              <label className={styles.label}>Lowest Text</label>
              <input
                type="text"
                value={lowestText}
                onChange={e => setLowestText(e.target.value)}
                className={styles.input}
                placeholder="e.g., 'later', 'least', leave empty for default"
                disabled={disabled}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={saving}
            >
              {disabled ? 'Close' : 'Cancel'}
            </button>
            {!disabled && (
              <button
                type="submit"
                className={styles.saveButton}
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : isNewPuzzle
                    ? 'Create Puzzle'
                    : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
