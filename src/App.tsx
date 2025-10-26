import { GameColumns } from './components/GameColumns/GameColumns';
import { Question } from './components/Question/Question';
import { GameProvider } from './context/GameContext';

export function App() {
  // Mock one for now
  const dailyRiddleData = {
    question: '$$distance$$ from the $$center$$ of the $$earth$$',
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
    lowestText: 'less',
  };

  return (
    <GameProvider dailyRiddleData={dailyRiddleData}>
      <Question />
      <GameColumns />
    </GameProvider>
  );
}
