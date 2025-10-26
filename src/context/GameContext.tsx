import { createContext, useContext, type ReactNode } from 'react';

type DailyRiddleData = {
  question: string;
  startingOrder: string[];
  intendedOrder: string[];
  highestText?: string;
  lowestText?: string;
};

type GameContextType = {
  seedData: DailyRiddleData;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  dailyRiddleData: DailyRiddleData;
  children: ReactNode;
}

export function GameProvider({ dailyRiddleData, children }: GameProviderProps) {
  const contextValue: GameContextType = {
    seedData: dailyRiddleData,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}

function useGameContext() {
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
