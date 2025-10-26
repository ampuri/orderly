import { useModal } from '../../context/ModalContext';

import styles from './Modal.module.css';

export function useWinModal() {
  const { showModal } = useModal();
  return (shareableContent: string) => {
    const shareableContentToElement = shareableContent
      .split('\n')
      .map((line, index) => <div key={index}>{line}</div>);
    showModal({
      title: 'Orderly complete!',
      children: <div>{shareableContentToElement}</div>,
      cta: (
        <button
          className={styles.ctaButton}
          onClick={() => {
            navigator.clipboard.writeText(shareableContent);
          }}
        >
          Copy
        </button>
      ),
    });
  };
}
