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
      style={{ '--column-count': guesses.length + 1 } as React.CSSProperties}
    >
      {guesses.map((guess, index) => (
        <SortableColumn key={index} initialData={guess} disableAndShowHints />
      ))}
      <SortableColumn initialData={currentGuess} />
    </div>
  );
}
