import { useEffect, useRef, useState } from 'react';
import { contact } from '../data/content';
import { copyText } from '../lib/contact';
import { unlock } from '../lib/achievements';

const CopyIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polyline points="5 12 10 17 19 7" />
  </svg>
);

type CopyState = 'idle' | 'copied' | 'selected';

/** Shows the email address with a one-click copy. Falls back to selecting the text if the clipboard is unavailable. */
export function CopyEmailButton({ className = '' }: { className?: string }) {
  const [state, setState] = useState<CopyState>('idle');
  const textRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = async () => {
    unlock('contact');
    if (await copyText(contact.email)) {
      setState('copied');
    } else {
      const node = textRef.current;
      const selection = window.getSelection();
      if (node && selection) {
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setState('selected');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 font-mono sm:py-2 text-xs text-muted transition hover:border-accent/40 hover:text-text-primary ${className}`}
    >
      <span ref={textRef}>{contact.email}</span>
      <span
        className={`inline-flex items-center gap-1 ${state === 'copied' ? 'text-[rgb(var(--up))]' : 'text-muted group-hover:text-accent'}`}
        aria-live="polite"
      >
        {state === 'copied' ? <CheckIcon /> : <CopyIcon />}
        {state === 'copied' ? 'Copied' : state === 'selected' ? 'Selected' : 'Copy'}
      </span>
    </button>
  );
}
