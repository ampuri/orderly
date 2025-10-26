import { ArrowDownCircle, ArrowUpCircle, CheckCircle2 } from 'lucide-react';

import styles from './SortableCardPresentational.module.css';

export type SortableCardPresentationalProps = {
  text: string;
  disabled?: boolean;
  hint?: 'correct' | 'up' | 'down';

  ref?: (node: HTMLElement | null) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const HINT_DATA_MAP = {
  up: {
    icon: <ArrowUpCircle size="1.5em" />,
    color: '#84becf',
  },
  down: {
    icon: <ArrowDownCircle size="1.5em" />,
    color: '#84becf',
  },
  correct: {
    icon: <CheckCircle2 size="1.5em" />,
    color: '#88f78e',
  },
};

export function SortableCardPresentational({
  text,
  disabled,
  hint,
  ref,
  ...props
}: SortableCardPresentationalProps) {
  return (
    <div ref={ref} {...props}>
      <div style={{ position: 'relative' }}>
        <div
          className={[styles.card, disabled && styles.cardDisabled].join(' ')}
          style={
            hint ? { backgroundColor: HINT_DATA_MAP[hint]?.color } : undefined
          }
        >
          {text}
        </div>
        {hint && (
          <div
            className={styles.hint}
            style={{ backgroundColor: HINT_DATA_MAP[hint]?.color }}
          >
            {HINT_DATA_MAP[hint].icon}
          </div>
        )}
      </div>
    </div>
  );
}
