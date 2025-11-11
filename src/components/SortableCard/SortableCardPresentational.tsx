import DOMPurify from 'dompurify';
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

function renderCardContent(text: string): React.ReactNode {
  // Handle image variant
  if (text.startsWith('img::')) {
    const src = text.substring(5).trim();
    return (
      <img
        src={src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    );
  }

  // Handle link variant
  if (text.startsWith('link::')) {
    const match = text.match(/link::(.+?)(?:\s+)?text::(.+)/);

    if (match) {
      const href = match[1].trim();
      const linkText = match[2].trim();
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
        >
          {linkText}
        </a>
      );
    }
  }

  // Handle HTML variant (sanitized)
  if (text.startsWith('html::')) {
    const htmlContent = text.substring(6).trim();
    const cleanHtml = DOMPurify.sanitize(htmlContent);
    return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
  }

  // Default case: render text as-is
  return text;
}

export function SortableCardPresentational({
  text,
  disabled,
  hint,
  ref,
  ...props
}: SortableCardPresentationalProps) {
  const isImage = text.startsWith('img::');

  return (
    <div ref={ref} {...props}>
      <div className={styles.relativeContainer}>
        <div
          className={[
            styles.card,
            disabled && styles.cardDisabled,
            hint &&
              styles[`cardHint${hint.charAt(0).toUpperCase() + hint.slice(1)}`],
            props.className,
          ].join(' ')}
          style={isImage ? { padding: 0, overflow: 'hidden' } : undefined}
        >
          {renderCardContent(text)}
        </div>
        {hint && (
          <div
            className={[
              styles.hint,
              styles[`hint${hint.charAt(0).toUpperCase() + hint.slice(1)}`],
            ].join(' ')}
          >
            {HINT_DATA_MAP[hint].icon}
          </div>
        )}
      </div>
    </div>
  );
}
