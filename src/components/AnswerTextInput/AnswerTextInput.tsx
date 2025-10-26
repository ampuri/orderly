import { XCircle, ArrowRightCircle } from 'lucide-react';
import { useState } from 'react';

import styles from './AnswerTextInput.module.css';

const LETTERS_TO_DISPLAY = 1 as const;

type AnswerTextInputProps = {
  answer: string;
};

export function AnswerTextInput({ answer }: AnswerTextInputProps) {
  const displayedLetters = answer.slice(0, LETTERS_TO_DISPLAY);
  const expectedInputValue = answer.slice(LETTERS_TO_DISPLAY);
  const [inputValue, setInputValue] = useState('');
  const [answerState, setAnswerState] = useState<
    'correct' | 'incorrect' | 'pending'
  >('pending');

  const handleButtonClick = () => {
    if (answerState === 'incorrect') {
      setInputValue('');
      setAnswerState('pending');
      return;
    }
    if (inputValue.toLowerCase() !== expectedInputValue.toLowerCase()) {
      setAnswerState('incorrect');
      return;
    }
    setAnswerState('correct');
  };

  return (
    <div className={styles.container}>
      {answerState === 'correct' ? (
        answer
      ) : (
        <>
          {displayedLetters}
          <input
            className={styles.input}
            type="text"
            value={inputValue}
            onChange={e => {
              setAnswerState('pending');
              setInputValue(e.target.value);
            }}
            style={{
              width: `${(answer.length - LETTERS_TO_DISPLAY) * 1.1}em`,
              borderColor: answerState === 'incorrect' ? '#eb3434' : undefined,
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleButtonClick();
              }
            }}
          />
          <button className={styles.button} onClick={handleButtonClick}>
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
