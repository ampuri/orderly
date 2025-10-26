import { useModal } from '../../context/ModalContext';

import { Modal } from './Modal';

export function ModalRenderer() {
  const { modals, hideModal } = useModal();

  return (
    <>
      {modals.map(modal => (
        <Modal
          key={modal.id}
          open={true}
          onOpenChange={open => {
            if (!open) {
              hideModal(modal.id);
            }
          }}
          {...modal}
        >
          {modal.children}
        </Modal>
      ))}
    </>
  );
}
