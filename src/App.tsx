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

export function App() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('reset') === 'true') {
    clearAllLocalStorage();
  }

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
        <Header />
        <div className={styles.container}>
          <Question />
          <GameColumns />
          <GameStatus />
        </div>
        <ModalRenderer />
      </GameProvider>
    </ModalProvider>
  );
}
