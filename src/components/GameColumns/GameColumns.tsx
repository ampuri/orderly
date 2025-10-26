import { useGameContext } from '../../context/GameContext';
import { SortableColumn } from '../SortableColumn/SortableColumn';

import styles from './GameColumns.module.css';

export function GameColumns() {
  const {
    gameState: { guesses, currentGuess },
  } = useGameContext();
  return (
    <div>
      <div className={styles.container}>
        {guesses.map((guess, index) => (
          <SortableColumn key={index} initialData={guess} disableAndShowHints />
        ))}
        <SortableColumn initialData={currentGuess} />
      </div>
    </div>
  );
}
