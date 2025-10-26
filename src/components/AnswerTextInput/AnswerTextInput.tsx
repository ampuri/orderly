import { XCircle, ArrowRightCircle } from 'lucide-react';
import { useState } from 'react';

import { useGameContext } from '../../context/GameContext';

import styles from './AnswerTextInput.module.css';

const LETTERS_TO_DISPLAY = 1 as const;

type AnswerTextInputProps = {
  answer: string;
  alsoAccepts?: string[];
};

export function AnswerTextInput({ answer, alsoAccepts }: AnswerTextInputProps) {
  const {
    gameState: { solvedWords, specialState },
    addSolvedWord,
  } = useGameContext();
  const isSolved = solvedWords.includes(answer);
  const displayedLetters = answer.slice(0, LETTERS_TO_DISPLAY);
  const expectedInputValue = answer.slice(LETTERS_TO_DISPLAY);
  const [inputValue, setInputValue] = useState('');
  const [answerState, setAnswerState] = useState<'incorrect' | 'pending'>(
    'pending'
  );

  const handleButtonClick = () => {
    if (answerState === 'incorrect') {
      setInputValue('');
      setAnswerState('pending');
      return;
    }
    const isMatch =
      inputValue.toLowerCase() !== expectedInputValue.toLowerCase();
    const isAlsoAccepted = alsoAccepts?.some(
      accept => inputValue.toLowerCase() === accept.toLowerCase()
    );
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
              if (e.key === 'Enter') {
                handleButtonClick();
              }
            }}
          />
          <button
            className={styles.button}
            onClick={handleButtonClick}
            disabled={specialState === 'win' || specialState === 'lose'}
          >
            {answerState === 'incorrect' ? (
              <XCircle size="1em" />
            ) : (
              <ArrowRightCircle size="1em" />
            )}
          </button>
        </>
      )}
    </div>
  );
}
