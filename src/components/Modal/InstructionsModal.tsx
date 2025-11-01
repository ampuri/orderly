import { useModal } from '../../context/ModalContext';

export function useInstructionsModal() {
  const { showModal } = useModal();

  return () => {
    showModal({
      title: 'Instructions',
      children: (
        <>
          <p>
            The six cards on screen can be <strong>ordered</strong> by a mystery
            criteria. The goal is to both <i>figure out the criteria</i> and to{' '}
            <i>order the cards correctly</i>.
            <br />
            <br />
            <i>
              {' '}
              Example criteria: <strong>LIKELINESS</strong> TO CAUSE A{' '}
              <strong>FIRE</strong> IF USED <strong>IMPROPERLY</strong>
            </i>
            <br />
            <br />
            After ordering the cards, you can click{' '}
            <strong>CHECK RANKING</strong> to see which cards are in the correct
            position. You will also get <strong>one hint</strong> (per check) on
            if a given card needs to go up ⬆️ or down ⬇️.
            <br />
            <br />
            Each word has <strong>limited guesses</strong>, and you get an
            additional guess every time you check the ranking. Once you get the
            ranking correct, this limit is removed. You need to both{' '}
            <strong>guess the criteria correctly</strong> and{' '}
            <strong>order the cards correctly</strong> to complete the puzzle!
          </p>
        </>
      ),
    });
  };
}
