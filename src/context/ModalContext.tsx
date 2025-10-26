import { createContext, useContext, useState, type ReactNode } from 'react';

export type ModalContent = {
  id: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  onClose?: () => void;
  cta?: ReactNode;
};

type ModalContextType = {
  modals: ModalContent[];
  showModal: (modal: Omit<ModalContent, 'id'>) => string;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modals, setModals] = useState<ModalContent[]>([]);

  const showModal = (modal: Omit<ModalContent, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newModal: ModalContent = {
      ...modal,
      id,
    };

    setModals(prev => [...prev, newModal]);
    return id;
  };

  const hideModal = (id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  };

  const hideAllModals = () => {
    setModals([]);
  };

  const contextValue: ModalContextType = {
    modals,
    showModal,
    hideModal,
    hideAllModals,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
