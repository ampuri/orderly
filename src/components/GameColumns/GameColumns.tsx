import { useCanGuessMore, useGameContext } from '../../context/GameContext';
import { SortableColumn } from '../SortableColumn/SortableColumn';

import styles from './GameColumns.module.css';

export function GameColumns() {
  const {
    gameState: { guesses, currentGuess },
  } = useGameContext();
  const canGuessMore = useCanGuessMore();
  return (
    <div
      className={styles.container}
      style={
        {
          '--column-count': guesses.length + (canGuessMore ? 1 : 0),
        } as React.CSSProperties
      }
    >
      {guesses.map((guess, index) => (
        <SortableColumn key={index} initialData={guess} disableAndShowHints />
      ))}
      {canGuessMore && <SortableColumn initialData={currentGuess} />}
    </div>
  );
}
