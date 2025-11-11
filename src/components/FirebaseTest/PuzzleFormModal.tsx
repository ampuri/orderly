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

type ItemFormat = 'text' | 'image' | 'link' | 'html';

interface OrderItem {
  format: ItemFormat;
  value: string;
  linkUrl?: string;
  linkText?: string;
}

// Parse a stored string into an OrderItem
function parseOrderItem(text: string): OrderItem {
  if (text.startsWith('img::')) {
    return { format: 'image', value: text.substring(5).trim() };
  }
  if (text.startsWith('link::')) {
    const match = text.match(/link::(.+?)(?:\s+)?text::(.+)/);
    if (match) {
      return {
        format: 'link',
        value: '',
        linkUrl: match[1].trim(),
        linkText: match[2].trim(),
      };
    }
  }
  if (text.startsWith('html::')) {
    return { format: 'html', value: text.substring(6).trim() };
  }
  return { format: 'text', value: text };
}

// Convert an OrderItem back to the stored string format
function serializeOrderItem(item: OrderItem): string {
  switch (item.format) {
    case 'image':
      return `img::${item.value}`;
    case 'link':
      return `link::${item.linkUrl}text::${item.linkText}`;
    case 'html':
      return `html::${item.value}`;
    case 'text':
    default:
      return item.value;
  }
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
  const [intendedOrder, setIntendedOrder] = useState<OrderItem[]>(
    puzzle?.intendedOrder
      ? puzzle.intendedOrder.map(parseOrderItem)
      : [
          { format: 'text', value: 'item 1' },
          { format: 'text', value: 'item 2' },
          { format: 'text', value: 'item 3' },
          { format: 'text', value: 'item 4' },
          { format: 'text', value: 'item 5' },
          { format: 'text', value: 'item 6' },
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

  const handleFormatChange = (index: number, format: ItemFormat) => {
    const newOrder = [...intendedOrder];
    const currentItem = newOrder[index];

    // When switching to link, initialize with current value if it's text
    if (format === 'link') {
      newOrder[index] = {
        format: 'link',
        value: '',
        linkUrl: 'https://example.com',
        linkText: currentItem.format === 'text' ? currentItem.value : 'item',
      };
    } else {
      // For other formats, preserve value if possible
      newOrder[index] = {
        format,
        value: currentItem.format === 'text' ? currentItem.value : '',
      };
    }

    setIntendedOrder(newOrder);
  };

  const handleIntendedOrderChange = (
    index: number,
    value: string,
    field?: 'url' | 'text'
  ) => {
    const newOrder = [...intendedOrder];
    const item = newOrder[index];

    if (item.format === 'link' && field) {
      if (field === 'url') {
        item.linkUrl = value;
      } else if (field === 'text') {
        item.linkText = value;
      }
    } else {
      item.value = value;
    }

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

    // Validate that we have exactly 6 items with valid data
    const validItems = intendedOrder.filter(item => {
      if (item.format === 'link') {
        return item.linkUrl?.trim() && item.linkText?.trim();
      }
      return item.value.trim() !== '';
    });

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
        intendedOrder: intendedOrder.map(serializeOrderItem),
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
                {intendedOrder.map((item, index) => {
                  const getPlaceholder = (format: ItemFormat) => {
                    switch (format) {
                      case 'image':
                        return 'https://example.com/image.jpg';
                      case 'link':
                        return 'URL and Text';
                      case 'html':
                        return '<i>item</i>';
                      case 'text':
                      default:
                        return 'item';
                    }
                  };

                  return (
                    <div key={index} className={styles.orderItem}>
                      <span className={styles.orderNumber}>{index + 1}.</span>
                      <select
                        value={item.format}
                        onChange={e =>
                          handleFormatChange(
                            index,
                            e.target.value as ItemFormat
                          )
                        }
                        className={styles.formatSelect}
                        disabled={disabled}
                      >
                        <option value="text">Normal Text</option>
                        <option value="image">Image URL</option>
                        <option value="link">Hyperlink</option>
                        <option value="html">HTML (Experimental)</option>
                      </select>
                      {item.format === 'link' ? (
                        <>
                          <label className={styles.inputLabel}>URL:</label>
                          <input
                            type="text"
                            value={item.linkUrl || ''}
                            onChange={e =>
                              handleIntendedOrderChange(
                                index,
                                e.target.value,
                                'url'
                              )
                            }
                            className={styles.orderInput}
                            placeholder="https://example.com"
                            required
                            disabled={disabled}
                          />
                          <label className={styles.inputLabel}>Text:</label>
                          <input
                            type="text"
                            value={item.linkText || ''}
                            onChange={e =>
                              handleIntendedOrderChange(
                                index,
                                e.target.value,
                                'text'
                              )
                            }
                            className={styles.orderInput}
                            placeholder="Link text"
                            required
                            disabled={disabled}
                          />
                        </>
                      ) : (
                        <input
                          type="text"
                          value={item.value}
                          onChange={e =>
                            handleIntendedOrderChange(index, e.target.value)
                          }
                          className={styles.orderInput}
                          placeholder={getPlaceholder(item.format)}
                          required
                          disabled={disabled}
                        />
                      )}
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
                  );
                })}
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
