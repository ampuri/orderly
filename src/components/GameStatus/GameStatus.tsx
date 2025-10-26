import { useState } from 'react';

import { NUM_GUESSES } from '../../constants';
import { useCanGuessMore, useGameContext } from '../../context/GameContext';

import styles from './GameStatus.module.css';

export function GameStatus() {
  const {
    addGuess,
    giveUp,
    gameState: { guesses },
  } = useGameContext();
  const numGuessesLeft = NUM_GUESSES - guesses.length;
  const [giveUpConfirmation, setGiveUpConfirmation] = useState(0);

  const canGuessMore = useCanGuessMore();
  return (
    <div className={styles.container}>
      <div className={styles.guessesLeft}>
        Checks left:{' '}
        {Array.from({ length: numGuessesLeft }).map((_, index) => (
          <div key={index} className={styles.guessDot} />
        ))}
      </div>
      <button
        className={[styles.button, !canGuessMore && styles.buttonDisabled].join(
          ' '
        )}
        onClick={addGuess}
        disabled={!canGuessMore}
      >
        Check Ranking
      </button>
      <div className={styles.giveUpContainer}>
        {giveUpConfirmation === 0 && (
          <button
            className={styles.button}
            onClick={() => setGiveUpConfirmation(1)}
          >
            Give up
          </button>
        )}
        {giveUpConfirmation === 1 && (
          <>
            Are you sure?
            <button
              className={styles.button}
              onClick={() => setGiveUpConfirmation(2)}
            >
              Give up
            </button>
          </>
        )}
        {giveUpConfirmation === 2 && (
          <>
            100% sure?
            <button className={styles.button} onClick={() => giveUp()}>
              Give up
            </button>
          </>
        )}
      </div>
    </div>
  );
}
