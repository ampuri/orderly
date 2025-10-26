import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, type ReactNode } from 'react';

import styles from './Modal.module.css';

type ModalProps = {
  id: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  onClose?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cta?: ReactNode;
};

export function Modal({
  title,
  description,
  children,
  onClose,
  open,
  onOpenChange,
  cta,
}: ModalProps) {
  useEffect(() => {
    if (!open && onClose) {
      onClose();
    }
  }, [open, onClose]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.content}
          onOpenAutoFocus={e => e.preventDefault()}
        >
          {title && (
            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          )}
          {description && (
            <Dialog.Description className={styles.description}>
              {description}
            </Dialog.Description>
          )}
          <div className={styles.body}>{children}</div>
          {cta}
          <Dialog.Close asChild>
            <button className={styles.closeButton} aria-label="Close">
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
