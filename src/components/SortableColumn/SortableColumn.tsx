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

import type { ColumnData } from '../../context/GameContext';
import { useGameContext, useGameOptions } from '../../context/GameContext';
import { SortableCard } from '../SortableCard/SortableCard';
import { SortableCardPresentational } from '../SortableCard/SortableCardPresentational';

import styles from './SortableColumn.module.css';

type SortableColumnProps = {
  initialData: ColumnData;
  disableAndShowHints?: boolean;
};
export function SortableColumn({
  initialData,
  disableAndShowHints,
}: SortableColumnProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<ColumnData>(initialData);
  const { setCurrentGuess } = useGameContext();
  const { highestText, lowestText } = useGameOptions();

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active && active.id !== over.id) {
      const newItemSetter = (items: ColumnData) => {
        const oldIndex = items.findIndex(
          item => item.text === active.id.toString()
        );
        const newIndex = items.findIndex(
          item => item.text === over.id.toString()
        );
        return arrayMove(items, oldIndex, newIndex);
      };
      setItems(newItemSetter);
      setCurrentGuess(newItemSetter);
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
      <SortableContext
        items={items.map(item => item.text)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={[
            styles.container,
            disableAndShowHints && styles.containerDisabled,
          ].join(' ')}
        >
          <div className={styles.labelText}>{highestText || 'most'}</div>
          <div className={styles.boundingBox}>
            {items.map(item => (
              <SortableCard
                key={item.text}
                id={item.text}
                hidden={activeId === item.text}
                disabled={disableAndShowHints}
                hint={disableAndShowHints ? item.hint : undefined}
              />
            ))}
          </div>
          <div className={styles.labelText}>{lowestText || 'least'}</div>
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <SortableCardPresentational
            text={activeId}
            className={styles.dragOverlay}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
