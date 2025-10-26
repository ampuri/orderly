import styles from './SortableCardPresentational.module.css';

type SortableCardPresentationalProps = {
  text: string;

  ref?: (node: HTMLElement | null) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export function SortableCardPresentational({
  text,
  ref,
  ...props
}: SortableCardPresentationalProps) {
  return (
    <div className={styles.card} ref={ref} {...props}>
      {text.toUpperCase()}
    </div>
  );
}
