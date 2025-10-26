import { useModal } from '../../context/ModalContext';

export function useSolvedWordsModal() {
  const { showModal } = useModal();

  return () => {
    showModal({
      title: 'Prompt complete!',
      description: 'Find the correct ranking to complete the puzzle.',
    });
  };
}
