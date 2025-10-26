import type { ReactNode } from 'react';

import { useModal } from '../../context/ModalContext';

import styles from './Modal.module.css';

export function useLoseModal() {
  const { showModal } = useModal();

  return (shareableContent: string, solution: ReactNode) => {
    const shareableContentToElement = shareableContent
      .split('\n')
      .map((line, index) => <div key={index}>{line}</div>);
    showModal({
      title: 'Better luck tomorrow!',
      children: (
        <>
          {solution}
          <div>{shareableContentToElement}</div>
        </>
      ),
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
