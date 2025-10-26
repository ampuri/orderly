import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  SortableCardPresentational,
  type SortableCardPresentationalProps,
} from './SortableCardPresentational';

type SortableCardProps = {
  id: string;
  hidden?: boolean;
  disabled?: boolean;
} & Partial<SortableCardPresentationalProps>;

export function SortableCard({
  id,
  hidden,
  disabled,
  ...props
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });

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
      disabled={disabled}
      {...props}
    />
  );
}
