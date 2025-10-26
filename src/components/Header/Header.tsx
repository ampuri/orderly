import { useState } from 'react';

import { useGameContext } from '../../context/GameContext';
import { useInstructionsModal } from '../Modal/InstructionsModal';

import styles from './Header.module.css';

export function Header() {
  const [giveUpConfirmation, setGiveUpConfirmation] = useState(0);
  const { giveUp } = useGameContext();
  const showInstructionsModal = useInstructionsModal();
  return (
    <header className={styles.header}>
      <div className={styles.title}>Orderly</div>
      <div className={styles.buttonsContainer}>
        <button
          className={styles.button}
          onClick={() => showInstructionsModal()}
        >
          Instructions
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
              <div className={styles.giveUpConfirmationText}>Are you sure?</div>
              <button
                className={styles.button}
                onClick={() => setGiveUpConfirmation(2)}
              >
                Yes, give up
              </button>
            </>
          )}
          {giveUpConfirmation === 2 && (
            <>
              <div className={styles.giveUpConfirmationText}>100% sure?</div>
              <button className={styles.button} onClick={() => giveUp()}>
                Free me
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
