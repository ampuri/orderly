import { useState, useEffect } from 'react';
import Joyride, { STATUS, type CallBackProps, type Step } from 'react-joyride';

import styles from './App.module.css';
import { GameColumns } from './components/GameColumns/GameColumns';
import { GameStatus } from './components/GameStatus/GameStatus';
import { Header } from './components/Header/Header';
import { ModalRenderer } from './components/Modal/ModalRenderer';
import { Question } from './components/Question/Question';
import { GameProvider, type RawDailyRiddleData } from './context/GameContext';
import { ModalProvider } from './context/ModalContext';
import puzzles from './homework/puzzles.json';
import { clearAllLocalStorage } from './utils/localStorage';
import { getCurrentPuzzleDay } from './utils/puzzleDay';

const TUTORIAL_STORAGE_KEY = 'orderly-tutorial-completed';

const tutorialSteps: Step[] = [
  {
    target: '[data-tour="overall"]',
    content: (
      <div>
        Every <strong>Orderly</strong> puzzle has a list of items ranked by a
        ranking criteria. Your goal is to:
        <ul style={{ paddingLeft: '2rem', textAlign: 'left' }}>
          <li>
            <strong>Fill in the blanks</strong> in the ranking criteria
          </li>
          <li>
            <strong>Order the cards</strong> correctly according to that
            criteria
          </li>
        </ul>
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '[data-tour="game-columns"]',
    content: (
      <div>
        Drag and drop the cards to arrange them in order from{' '}
        <strong>"most"</strong> of the criteria to <strong>"least"</strong> of
        the criteria.
        <br />
        <br />
        For example, if you think the criteria is "<strong>
          LIKELINESS
        </strong>{' '}
        TO CAUSE A <strong>FIRE</strong>", you could order them by most to least
        flammable.
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '[data-tour="game-status"]',
    content: (
      <div>
        You can click "<strong>CHECK RANKING</strong>" to check which cards are
        in the right place. Each time you check, you'll also get a{' '}
        <strong>hint for one card</strong> on whether it needs to move ⬆️ or ⬇️.
        <br />
        <br />
        You have a limited number of checks, so use them wisely!
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '[data-tour="question"]',
    content: (
      <div>
        Each word has <strong>limited guesses</strong>, and you get an
        additional guess every time you check the ranking. Once you get the
        ranking correct, the limit is removed.
        <br />
        <br />
        After you check the <strong>ranking</strong> twice, the first letter of
        each word in the criteria will be revealed.
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '[data-tour="header-buttons"]',
    content: (
      <div>
        You can press:
        <ul style={{ paddingLeft: '2rem', textAlign: 'left' }}>
          <li>
            <strong>Instructions</strong> to show a condensed version of the
            instructions
          </li>
          <li>
            <strong>Tour</strong> to replay this tutorial
          </li>
          <li>
            <strong>Give up</strong> forfeit and see the solution
          </li>
        </ul>
        <br />
        Good luck!
      </div>
    ),
  },
];

export function App() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('reset')) {
    clearAllLocalStorage();
  }

  const [runTutorial, setRunTutorial] = useState(false);

  // Check if user has seen the tutorial
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!tutorialCompleted) {
      // Delay the tutorial start slightly so the page renders first
      const timer = setTimeout(() => setRunTutorial(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTutorial(false);
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    }
  };

  const restartTutorial = () => {
    setRunTutorial(true);
  };

  const currentDay = getCurrentPuzzleDay();
  const dailyRiddleData = puzzles.find(puzzle => puzzle.day === currentDay) as
    | RawDailyRiddleData
    | undefined;

  // If no puzzle found for current day, show a message
  if (!dailyRiddleData) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <h1>No puzzle available yet!</h1>
          <p>Check back tomorrow for the next puzzle.</p>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Current day: {currentDay}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ModalProvider>
      <GameProvider dailyRiddleData={dailyRiddleData}>
        <Joyride
          steps={tutorialSteps}
          run={runTutorial}
          continuous
          showProgress
          showSkipButton
          callback={handleJoyrideCallback}
          locale={{
            last: 'Done',
          }}
          styles={{
            options: {
              primaryColor: '#4a90e2',
              zIndex: 10000,
            },
          }}
        />
        <Header onStartTour={restartTutorial} />
        <div className={styles.container} data-tour="overall">
          <Question />
          <GameColumns />
          <GameStatus />
        </div>
        <ModalRenderer />
      </GameProvider>
    </ModalProvider>
  );
}
