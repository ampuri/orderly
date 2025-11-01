import { useState } from 'react';

import { useGameContext } from '../../context/GameContext';

import styles from './AnswerTextInput.module.css';

type AnswerTextInputProps = {
  answer: string;
  alsoAccepts?: string[];
  keywordIndex: number;
};

export function AnswerTextInput({
  answer,
  alsoAccepts,
  keywordIndex,
}: AnswerTextInputProps) {
  const {
    gameState: { solvedWords, specialState, guesses, wordGuessCount },
    addSolvedWord,
    incrementGuessesForIndex,
  } = useGameContext();
  const isSolved = solvedWords.includes(answer);
  const LETTERS_TO_DISPLAY = guesses.length >= 2 ? 1 : 0;
  const displayedLetters = answer.slice(0, LETTERS_TO_DISPLAY);
  const expectedInputValue = answer.slice(LETTERS_TO_DISPLAY);
  const [inputValue, setInputValue] = useState('');
  const [answerState, setAnswerState] = useState<'incorrect' | 'pending'>(
    'pending'
  );

  // Calculate max guesses allowed
  const maxWordGuesses = guesses.length + 1;
  const currentGuessCount = wordGuessCount[keywordIndex] || 0;

  // Check if the latest guess is all correct
  const hasCorrectOrder =
    guesses.length > 0 &&
    guesses[guesses.length - 1].every(item => item.hint === 'correct');

  // Determine if button should be disabled
  const isLimitReached =
    !hasCorrectOrder && currentGuessCount >= maxWordGuesses;
  const disableChecking =
    specialState === 'win' || specialState === 'lose' || isLimitReached;

  const handleCheckButtonClick = () => {
    const isMatch =
      inputValue.toLowerCase() === expectedInputValue.toLowerCase();
    const isAlsoAccepted = alsoAccepts?.some(
      accept =>
        inputValue.toLowerCase() ===
        accept.slice(LETTERS_TO_DISPLAY).toLowerCase()
    );

    // Increment guess count
    incrementGuessesForIndex(keywordIndex);

    if (isMatch || isAlsoAccepted) {
      addSolvedWord(answer);
      return;
    }
    setAnswerState('incorrect');
  };

  return (
    <div className={styles.container}>
      {isSolved ? (
        answer
      ) : (
        <>
          {displayedLetters}
          <input
            className={[
              styles.input,
              answerState === 'incorrect' && styles.inputIncorrect,
            ].join(' ')}
            disabled={specialState === 'win' || specialState === 'lose'}
            type="text"
            value={inputValue}
            onChange={e => {
              setAnswerState('pending');
              setInputValue(e.target.value);
            }}
            style={{
              width: `${(answer.length - LETTERS_TO_DISPLAY) * 1.1}em`,
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !disableChecking) {
                handleCheckButtonClick();
              }
            }}
          />
          <button
            className={styles.button}
            onClick={handleCheckButtonClick}
            disabled={disableChecking}
          >
            {hasCorrectOrder ? (
              'CHECK'
            ) : (
              <>
                CHECK
                <br />({currentGuessCount}/{maxWordGuesses})
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
