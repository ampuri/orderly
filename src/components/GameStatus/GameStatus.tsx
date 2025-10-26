import { useGameContext } from '../../context/GameContext';

import styles from './GameStatus.module.css';

export function GameStatus() {
  const { addGuess } = useGameContext();
  return (
    <div>
      <button className={styles.button} onClick={addGuess}>
        CHECK RANKING
      </button>
    </div>
  );
}
