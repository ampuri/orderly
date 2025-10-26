import { useGameOptions } from '../../context/GameContext';
import { SortableColumn } from '../SortableColumn/SortableColumn';

export function GameColumns() {
  const { startingOrder } = useGameOptions();
  return (
    <div>
      <SortableColumn data={startingOrder} />
    </div>
  );
}
