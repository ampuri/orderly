import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { SortableCardPresentational } from './SortableCardPresentational';

type SortableCardProps = {
  id: string;
  hidden?: boolean;
};

export function SortableCard({ id, hidden }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: hidden ? 0 : 1,
  };

  return (
    <SortableCardPresentational
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      text={id}
    />
  );
}
