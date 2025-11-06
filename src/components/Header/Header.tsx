import { useState } from 'react';

import { useGameContext } from '../../context/GameContext';
import { useCountdown } from '../../hooks/useCountdown';
import { useInstructionsModal } from '../Modal/InstructionsModal';

import styles from './Header.module.css';

interface HeaderProps {
  onStartTour: () => void;
}

export function Header({ onStartTour }: HeaderProps) {
  const [giveUpConfirmation, setGiveUpConfirmation] = useState(0);
  const { giveUp } = useGameContext();
  const showInstructionsModal = useInstructionsModal();
  const countdown = useCountdown();

  return (
    <header className={styles.header}>
      <div className={styles.titleContainer}>
        <div className={styles.title}>Orderly</div>
        <div className={styles.countdownChip}>{countdown}</div>
      </div>
      <div className={styles.buttonsContainer} data-tour="header-buttons">
        <button
          className={styles.button}
          onClick={() => showInstructionsModal()}
        >
          Instructions
        </button>
        <button className={styles.button} onClick={onStartTour}>
          Tour
        </button>
        <a href="#/admin" className={styles.button}>
          Admin
        </a>
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
