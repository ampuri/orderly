import { useGameContext } from '../../context/GameContext';
import { SortableColumn } from '../SortableColumn/SortableColumn';

import styles from './GameColumns.module.css';

export function GameColumns() {
  const {
    addGuess,
    gameState: { guesses, currentGuess },
  } = useGameContext();
  return (
    <div>
      <button onClick={() => addGuess()}>Add Guess</button>
      <div className={styles.container}>
        {guesses.map((guess, index) => (
          <SortableColumn key={index} initialData={guess} disableAndShowHints />
        ))}
        <SortableColumn initialData={currentGuess} />
      </div>
    </div>
  );
}
