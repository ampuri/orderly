import { createContext, useContext, useState, type ReactNode } from 'react';

import { NUM_GUESSES } from '../constants';

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
  solvedWords: string[];
};

type GameContextType = {
  seedData: DailyRiddleData;
  gameState: GameState;
  addGuess: () => void;
  setCurrentGuess: React.Dispatch<React.SetStateAction<ColumnData>>;
  addSolvedWord: (word: string) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  dailyRiddleData: DailyRiddleData;
  children: ReactNode;
}

function guessIsAllCorrect(guess: ColumnData): boolean {
  return guess.every(item => item.hint === 'correct');
}

export function GameProvider({ dailyRiddleData, children }: GameProviderProps) {
  const numKeywords = dailyRiddleData.question
    .split(/(\$\$[^$]+\$\$)/)
    .filter(part => part.startsWith('$$') && part.endsWith('$$')).length;
  const [guesses, setGuesses] = useState<ColumnData[]>([]);
  const [currentGuess, setCurrentGuess] = useState<ColumnData>(
    dailyRiddleData.startingOrder
  );
  const [solvedWords, setSolvedWords] = useState<string[]>([]);

  const addSolvedWord = (word: string) => {
    setSolvedWords(solvedWords => [...solvedWords, word]);

    const solvedAllWords = solvedWords.length + 1 === numKeywords;
    const hasCorrectGuess =
      guesses.length > 0 && guessIsAllCorrect(guesses[guesses.length - 1]);
    if (solvedAllWords && hasCorrectGuess) {
      console.log('Game solved');
    } else if (solvedAllWords) {
      console.log('Solved all words');
    }
  };

  const addGuess = () => {
    const guessWithHints = addHintsToGuess(
      currentGuess,
      dailyRiddleData.intendedOrder
    );
    setGuesses(guesses => [...guesses, guessWithHints]);

    const solvedAllWords = solvedWords.length + 1 === numKeywords;
    const hasCorrectGuess = guessIsAllCorrect(guessWithHints);
    if (solvedAllWords && hasCorrectGuess) {
      console.log('Game solved');
    } else if (hasCorrectGuess) {
      console.log('Solved all rankings');
    }
  };

  const contextValue: GameContextType = {
    seedData: dailyRiddleData,
    gameState: {
      guesses,
      currentGuess,
      solvedWords,
    },
    addGuess,
    setCurrentGuess,
    addSolvedWord,
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

export function useCanGuessMore(): boolean {
  const context = useGameContext();
  if (context.gameState.guesses.length === 0) {
    return true;
  }
  if (context.gameState.guesses.length === NUM_GUESSES) {
    return false;
  }
  return !guessIsAllCorrect(
    context.gameState.guesses[context.gameState.guesses.length - 1]
  );
}
