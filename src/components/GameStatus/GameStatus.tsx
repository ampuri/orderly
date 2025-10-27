import { NUM_GUESSES } from '../../constants';
import { useCanGuessMore, useGameContext } from '../../context/GameContext';

import styles from './GameStatus.module.css';

export function GameStatus() {
  const {
    addGuess,
    gameState: { guesses },
  } = useGameContext();
  const numGuessesLeft = NUM_GUESSES - guesses.length;

  const canGuessMore = useCanGuessMore();
  return (
    <div className={styles.container} data-tour="game-status">
      <div className={styles.guessesLeft}>
        Checks left:{' '}
        {Array.from({ length: numGuessesLeft }).map((_, index) => (
          <div key={index} className={styles.guessDot} />
        ))}
      </div>
      <div className={styles.buttonsContainer}>
        <button
          className={[
            styles.button,
            !canGuessMore && styles.buttonDisabled,
          ].join(' ')}
          onClick={addGuess}
          disabled={!canGuessMore}
        >
          Check Ranking
        </button>
      </div>
    </div>
  );
}
