import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { SortableCardPresentational } from './SortableCardPresentational';

type SortableCardProps = {
  id: string;
};

export function SortableCard({ id }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableCardPresentational
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
}
