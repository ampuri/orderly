import { NUM_GUESSES } from '../../constants';
import { useGameContext } from '../../context/GameContext';

import styles from './GameStatus.module.css';

export function GameStatus() {
  const {
    addGuess,
    gameState: { guesses },
  } = useGameContext();
  const numGuessesLeft = NUM_GUESSES - guesses.length;
  return (
    <div className={styles.container}>
      <div className={styles.guessesLeft}>
        Guesses left:{' '}
        {Array.from({ length: numGuessesLeft }).map((_, index) => (
          <div key={index} className={styles.guessDot} />
        ))}
      </div>
      <button className={styles.button} onClick={addGuess}>
        Check Ranking
      </button>
    </div>
  );
}
