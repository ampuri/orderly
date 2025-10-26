import { createContext, useContext, useState, type ReactNode } from 'react';

export type ColumnData = {
  text: string;
  hint: 'correct' | 'up' | 'down' | undefined;
}[];

type DailyRiddleData = {
  question: string;
  startingOrder: ColumnData;
  intendedOrder: ColumnData;
  highestText?: string;
  lowestText?: string;
};

type GameState = {
  currentGuess: ColumnData;
  guesses: ColumnData[];
};

type GameContextType = {
  seedData: DailyRiddleData;
  gameState: GameState;
  addGuess: () => void;
  setCurrentGuess: React.Dispatch<React.SetStateAction<ColumnData>>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  dailyRiddleData: DailyRiddleData;
  children: ReactNode;
}

export function GameProvider({ dailyRiddleData, children }: GameProviderProps) {
  const [guesses, setGuesses] = useState<ColumnData[]>([]);
  const [currentGuess, setCurrentGuess] = useState<ColumnData>(
    dailyRiddleData.startingOrder
  );

  const addGuess = () => {
    setGuesses(guesses => [
      ...guesses,
      addHintsToGuess(currentGuess, dailyRiddleData.intendedOrder),
    ]);
  };

  const contextValue: GameContextType = {
    seedData: dailyRiddleData,
    gameState: {
      guesses,
      currentGuess,
    },
    addGuess,
    setCurrentGuess,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}

function addHintsToGuess(
  guess: ColumnData,
  intendedOrder: ColumnData
): ColumnData {
  const guessWithAllHints = guess.map((item, index) => {
    const intendedItemIndex = intendedOrder.findIndex(
      i => i.text === item.text
    );
    if (intendedItemIndex === index) {
      return { ...item, hint: 'correct' as const };
    }

    if (intendedItemIndex < index) {
      return { ...item, hint: 'up' as const };
    }
    return { ...item, hint: 'down' as const };
  });
  const incorrectGuesses = guessWithAllHints.filter(
    item => item.hint !== 'correct'
  );
  if (incorrectGuesses.length === 0) {
    return guessWithAllHints;
  }
  const randomIncorrectGuess =
    incorrectGuesses[Math.floor(Math.random() * incorrectGuesses.length)];
  return guessWithAllHints.map(item => {
    if (item.hint === 'correct') {
      return item;
    }
    if (item.text === randomIncorrectGuess.text) {
      return item;
    }
    return { ...item, hint: undefined };
  });
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}

export function useGameOptions() {
  const context = useGameContext();

  return {
    highestText: context.seedData.highestText,
    lowestText: context.seedData.lowestText,
    startingOrder: context.seedData.startingOrder,
    intendedOrder: context.seedData.intendedOrder,
  };
}

type QuestionSegment = {
  text: string;
  isKeyword: boolean;
};

export function useGameQuestion(): QuestionSegment[] {
  const context = useGameContext();

  const question = context.seedData.question;
  const parts = question.split(/(\$\$[^$]+\$\$)/);

  return parts
    .filter(part => part.length > 0)
    .map(part => {
      const isKeyword = part.startsWith('$$') && part.endsWith('$$');

      return {
        text: isKeyword ? part.slice(2, -2) : part,
        isKeyword,
      };
    });
}
