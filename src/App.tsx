import { Question } from './components/Question/Question';
import { SortableColumn } from './components/SortableColumn/SortableColumn';

export function App() {
  return (
    <>
      <Question />
      <SortableColumn disabled />
    </>
  );
}
