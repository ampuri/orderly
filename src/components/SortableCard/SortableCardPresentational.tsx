type SortableCardPresentationalProps = {
  // TODO props
  ref?: (node: HTMLElement | null) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export function SortableCardPresentational({
  ref,
  ...props
}: SortableCardPresentationalProps) {
  return (
    <div ref={ref} {...props}>
      SortableCardPresentational
    </div>
  );
}
