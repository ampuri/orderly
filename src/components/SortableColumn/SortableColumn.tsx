import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';

import { SortableCard } from '../SortableCard/SortableCard';
import { SortableCardPresentational } from '../SortableCard/SortableCardPresentational';

import styles from './SortableColumn.module.css';

type SortableColumnProps = {
  disabled?: boolean;
};
export function SortableColumn({ disabled }: SortableColumnProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState([
    'a globe',
    'the international space station',
    'ice cream',
    'the louvre heist',
    'sleeping through your alarm',
    'league of legends',
  ]);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active && active.id !== over.id) {
      setItems(items => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over.id.toString());

        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div
          className={styles.container}
          style={disabled ? { opacity: 0.7 } : undefined}
        >
          <div className={styles.boundingBox}>
            {items.map(id => (
              <SortableCard
                key={id}
                id={id}
                hidden={activeId === id}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <SortableCardPresentational
            text={activeId}
            style={{ cursor: 'grabbing' }}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
