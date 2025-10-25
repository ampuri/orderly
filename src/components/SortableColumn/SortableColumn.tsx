import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';

import { SortableCard } from '../SortableCard/SortableCard';
import { SortableCardPresentational } from '../SortableCard/SortableCardPresentational';

export function SortableColumn() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map(id => (
          <SortableCard key={id} id={id} />
        ))}
      </SortableContext>
      <DragOverlay>
        {activeId ? <SortableCardPresentational /> : null}
      </DragOverlay>
    </DndContext>
  );
}
