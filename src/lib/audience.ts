/**
 * "Viewing as": who the visitor says they are (recruiter, engineer, founder), which reorders the
 * home page for them. Remembered on this device. A link with ?for=recruiter (or engineer, founder)
 * opens the page already set, so a tailored link can be shared.
 */

export type Audience = 'everyone' | 'recruiter' | 'engineer' | 'founder';

export const AUDIENCES: Audience[] = ['everyone', 'recruiter', 'engineer', 'founder'];

const STORAGE_KEY = 'portfolio-audience';
const listeners = new Set<() => void>();

const isAudience = (v: unknown): v is Audience => AUDIENCES.includes(v as Audience);

function initial(): Audience {
  if (typeof window === 'undefined') return 'everyone';
  const fromLink = new URLSearchParams(window.location.search).get('for');
  if (isAudience(fromLink)) return fromLink;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isAudience(saved)) return saved;
  } catch {
    // Storage blocked: start from the default.
  }
  return 'everyone';
}

let current: Audience = initial();

export const getAudience = () => current;

export function subscribeAudience(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAudience(next: Audience) {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  listeners.forEach((l) => l());
}
