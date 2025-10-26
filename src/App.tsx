import styles from './App.module.css';
import { GameColumns } from './components/GameColumns/GameColumns';
import { GameStatus } from './components/GameStatus/GameStatus';
import { Question } from './components/Question/Question';
import { GameProvider, type ColumnData } from './context/GameContext';

function toColumnData(data: string[]): ColumnData {
  return data.map(text => ({ text, hint: undefined }));
}

export function App() {
  // Mock one for now
  const dailyRiddleData = {
    question: '$$distance$$ from the $$center$$ of the $$earth$$',
    startingOrder: toColumnData([
      'the sun',
      'the international space station',
      'the louvre',
      'the mariana trench',
      'the andromeda galaxy',
      'an airplane in flight',
    ]),
    intendedOrder: toColumnData([
      'the andromeda galaxy',
      'the sun',
      'the international space station',
      'an airplane in flight',
      'the louvre',
      'the mariana trench',
    ]),
    highestText: 'more',
    lowestText: 'less',
  };

  return (
    <GameProvider dailyRiddleData={dailyRiddleData}>
      <div className={styles.container}>
        <Question />
        <GameColumns />
        <GameStatus />
      </div>
    </GameProvider>
  );
}
