import { useGameContext } from '../../context/GameContext';
import { SortableColumn } from '../SortableColumn/SortableColumn';

import styles from './GameColumns.module.css';

export function GameColumns() {
  const {
    gameState: { guesses, currentGuess },
  } = useGameContext();
  return (
    <div
      className={styles.container}
      style={{ width: `${(guesses.length + 1) * 13}vw` }}
    >
      {guesses.map((guess, index) => (
        <SortableColumn key={index} initialData={guess} disableAndShowHints />
      ))}
      <SortableColumn initialData={currentGuess} />
    </div>
  );
}
