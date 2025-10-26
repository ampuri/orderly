import { AnswerTextInput } from '../AnswerTextInput/AnswerTextInput';

import styles from './Question.module.css';

export function Question() {
  return (
    <div className={styles.container}>
      Hello <AnswerTextInput answer="world" /> the quick brown{' '}
      <AnswerTextInput answer="fox" /> jumps over the lazy{' '}
      <AnswerTextInput answer="dog" /> here is a long word{' '}
      <AnswerTextInput answer="pterodactyl" />
    </div>
  );
}
