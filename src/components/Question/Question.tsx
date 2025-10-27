import { useGameQuestion } from '../../context/GameContext';
import { AnswerTextInput } from '../AnswerTextInput/AnswerTextInput';

import styles from './Question.module.css';

export function Question() {
  const question = useGameQuestion();
  return (
    <div className={styles.container} data-tour="question">
      {question.map(segment => (
        <span key={segment.text}>
          {segment.isKeyword ? (
            <AnswerTextInput
              answer={segment.text}
              alsoAccepts={segment.alsoAccepts}
            />
          ) : (
            segment.text
          )}
        </span>
      ))}
    </div>
  );
}
