import { useModal } from '../../context/ModalContext';

export function useSolvedRankingModal() {
  const { showModal } = useModal();

  return () => {
    showModal({
      title: 'Ranking complete!',
      description: 'Fill in the blanks in the prompt to complete the puzzle.',
    });
  };
}
