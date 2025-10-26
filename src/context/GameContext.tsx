import { createContext, useContext, useState, type ReactNode } from 'react';

import { useLoseModal } from '../components/Modal/LoseModal';
import { useSolvedRankingModal } from '../components/Modal/SolvedRankingModal';
import { useSolvedWordsModal } from '../components/Modal/SolvedWordsModal';
import { useWinModal } from '../components/Modal/WinModal';
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
  specialState: 'win' | 'lose' | undefined;
};

type GameContextType = {
  seedData: DailyRiddleData;
  gameState: GameState;
  addGuess: () => void;
  setCurrentGuess: React.Dispatch<React.SetStateAction<ColumnData>>;
  addSolvedWord: (word: string) => void;
  giveUp: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  dailyRiddleData: DailyRiddleData;
  children: ReactNode;
}

function guessIsAllCorrect(guess: ColumnData): boolean {
  return guess.every(item => item.hint === 'correct');
}

function getNumKeywords(question: string): number {
  return question
    .split(/(\$\$[^$]+\$\$)/)
    .filter(part => part.startsWith('$$') && part.endsWith('$$')).length;
}

export function GameProvider({ dailyRiddleData, children }: GameProviderProps) {
  const showSolvedWordsModal = useSolvedWordsModal();
  const showSolvedRankingModal = useSolvedRankingModal();
  const [specialState, setSpecialState] =
    useState<GameState['specialState']>(undefined);

  const numKeywords = getNumKeywords(dailyRiddleData.question);
  const [guesses, setGuesses] = useState<ColumnData[]>([]);
  const [currentGuess, setCurrentGuess] = useState<ColumnData>(
    dailyRiddleData.startingOrder
  );
  const [solvedWords, setSolvedWords] = useState<string[]>([]);

  const showWinModal = useWinModal();
  const showLoseModal = useLoseModal();

  const addSolvedWord = (word: string) => {
    const newSolvedWords = [...solvedWords, word];
    setSolvedWords(newSolvedWords);

    const solvedAllWords = newSolvedWords.length === numKeywords;
    const hasCorrectGuess =
      guesses.length > 0 && guessIsAllCorrect(guesses[guesses.length - 1]);
    if (solvedAllWords && hasCorrectGuess) {
      showWinModal(
        generateShareableContent(
          dailyRiddleData.question,
          newSolvedWords,
          guesses
        )
      );
      setSpecialState('win');
    } else if (solvedAllWords) {
      showSolvedWordsModal();
    }
  };

  const addGuess = () => {
    const guessWithHints = addHintsToGuess(
      currentGuess,
      dailyRiddleData.intendedOrder
    );
    const newGuesses = [...guesses, guessWithHints];
    setGuesses(newGuesses);

    const hasMoreGuesses = newGuesses.length < NUM_GUESSES;
    const solvedAllWords = solvedWords.length === numKeywords;
    const hasCorrectGuess = guessIsAllCorrect(
      newGuesses[newGuesses.length - 1]
    );
    if (solvedAllWords && hasCorrectGuess) {
      showWinModal(
        generateShareableContent(
          dailyRiddleData.question,
          solvedWords,
          newGuesses
        )
      );
      setSpecialState('win');
    } else if (hasCorrectGuess) {
      showSolvedRankingModal();
    } else if (!hasMoreGuesses) {
      showLoseModal(
        generateShareableContent(
          dailyRiddleData.question,
          solvedWords,
          newGuesses
        ),
        generateSolution(
          dailyRiddleData.question,
          dailyRiddleData.intendedOrder
        )
      );
      setSpecialState('lose');
    }
  };

  const giveUp = () => {
    showLoseModal(
      generateShareableContent(dailyRiddleData.question, solvedWords, guesses),
      generateSolution(dailyRiddleData.question, dailyRiddleData.intendedOrder)
    );
    setSpecialState('lose');
  };

  const contextValue: GameContextType = {
    seedData: dailyRiddleData,
    gameState: {
      guesses,
      currentGuess,
      solvedWords,
      specialState,
    },
    addGuess,
    setCurrentGuess,
    addSolvedWord,
    giveUp,
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
  if (
    context.gameState.specialState === 'win' ||
    context.gameState.specialState === 'lose'
  ) {
    return false;
  }
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

function generateSolution(
  question: string,
  intendedOrder: ColumnData
): ReactNode {
  const questionWithKeywords = question.split(/(\$\$[^$]+\$\$)/).map(part => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return <strong>{part.replaceAll('$$', '')}</strong>;
    }
    return part;
  });
  return (
    <>
      <h3>Solution</h3>
      <div
        style={{
          textTransform: 'uppercase',
          marginBottom: '1rem',
          textAlign: 'center',
        }}
      >
        {questionWithKeywords}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textTransform: 'uppercase',
        }}
      >
        {intendedOrder.map((item, index) => (
          <>
            <div key={index}>{item.text}</div>
            {index < intendedOrder.length - 1 && (
              <div style={{ textTransform: 'lowercase' }}>v</div>
            )}
          </>
        ))}
      </div>
      <h3>Your progress</h3>
    </>
  );
}

function generateShareableContent(
  question: string,
  solvedWords: string[],
  guesses: ColumnData[]
): string {
  let content = '';

  // Current puzzle
  content += `Orderly #1\n`;
  // Prompt progress
  const numKeywords = getNumKeywords(question);
  if (solvedWords.length === numKeywords) {
    content += `Prompt complete ⭐\n`;
  } else {
    content += `Prompt progress: ${solvedWords.length} / ${numKeywords}\n`;
  }
  if (guesses.length > 0) {
    for (let row = 0; row < guesses[0].length; row++) {
      for (let col = 0; col < guesses.length; col++) {
        const guess = guesses[col][row];
        if (guess.hint === 'correct') {
          content += '✅';
        } else if (guess.hint === 'up') {
          content += '🔼';
        } else if (guess.hint === 'down') {
          content += '🔽';
        } else {
          content += '⬜';
        }
      }
      if (row < guesses[0].length - 1) {
        content += '\n';
      }
    }
  }
  return content;
}
