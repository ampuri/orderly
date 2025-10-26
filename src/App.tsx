import styles from './App.module.css';
import { GameColumns } from './components/GameColumns/GameColumns';
import { GameStatus } from './components/GameStatus/GameStatus';
import { Header } from './components/Header/Header';
import { ModalRenderer } from './components/Modal/ModalRenderer';
import { Question } from './components/Question/Question';
import { GameProvider } from './context/GameContext';
import { ModalProvider } from './context/ModalContext';

export function App() {
  // Mock one for now
  const dailyRiddleData = {
    day: 1,
    question: '$$distance$$ from the $$center$$ of the $$earth$$',
    alsoAccepts: {
      distance: [
        'distance',
        'distance from',
        'distance to',
        'distance from the',
        'distance to the',
      ],
      center: ['center', 'center of', 'center of the', 'center of the earth'],
    },
    startingOrder: [
      'the sun',
      'the international space station',
      'the louvre',
      'the mariana trench',
      'the andromeda galaxy',
      'an airplane in flight',
    ],
    intendedOrder: [
      'the andromeda galaxy',
      'the sun',
      'the international space station',
      'an airplane in flight',
      'the louvre',
      'the mariana trench',
    ],
    highestText: 'more',
  };

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
