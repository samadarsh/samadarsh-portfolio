export type AchievementId =
  | 'arrived'
  | 'explorer'
  | 'power'
  | 'ask'
  | 'testdriver'
  | 'casestudy'
  | 'reader'
  | 'background'
  | 'resume'
  | 'contact'
  | 'chart'
  | 'streak'
  | 'konami'
  | 'hire'
  | 'terminal';

export type Achievement = { id: AchievementId; icon: string; name: string; description: string };

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'arrived', icon: '👋', name: 'Arrived', description: 'Landed on the site' },
  {
    id: 'explorer',
    icon: '🧭',
    name: 'Explorer',
    description: 'Visited Home, Work, About and Haugtun',
  },
  { id: 'power', icon: '⌘', name: 'Power user', description: 'Opened search' },
  { id: 'ask', icon: '💬', name: 'Curious', description: 'Asked Adarsh a question' },
  { id: 'testdriver', icon: '🚀', name: 'Test driver', description: 'Opened a live project' },
  { id: 'casestudy', icon: '📐', name: 'Deep diver', description: 'Read a case study' },
  { id: 'reader', icon: '📖', name: 'Reader', description: 'Opened a Haugtun post' },
  {
    id: 'background',
    icon: '🗂',
    name: 'Background check',
    description: 'Read through the experience',
  },
  { id: 'resume', icon: '📄', name: 'Paper trail', description: 'Downloaded the resume' },
  { id: 'contact', icon: '✉️', name: 'Let’s talk', description: 'Copied or opened the email' },
  { id: 'chart', icon: '📈', name: 'Market watcher', description: 'Played Read the chart' },
  { id: 'streak', icon: '🔥', name: 'Hot hand', description: 'Three correct calls in a row' },
  { id: 'konami', icon: '🕹️', name: 'Old school', description: 'Entered the Konami code' },
  { id: 'hire', icon: '🤝', name: 'Good taste', description: 'Typed “hire”' },
  { id: 'terminal', icon: '>_', name: 'Root access', description: 'Opened the terminal' },
];

const STORAGE_KEY = 'portfolio-achievements';
const PAGES_KEY = 'portfolio-pages-visited';
export const EXPLORER_PAGES = ['/', '/work', '/about', '/journal'];

const readSet = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set<string>();
  }
};

const writeSet = (key: string, set: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // Storage blocked: progress lasts for this visit only.
  }
};

let unlocked = typeof window !== 'undefined' ? readSet(STORAGE_KEY) : new Set<string>();
let snapshot: ReadonlySet<string> = new Set(unlocked);
const changeListeners = new Set<() => void>();
const unlockListeners = new Set<(a: Achievement) => void>();

const emitChange = () => {
  snapshot = new Set(unlocked);
  changeListeners.forEach((l) => l());
};

export const getUnlocked = () => snapshot;

export function subscribeAchievements(listener: () => void) {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

/** Called once per newly unlocked achievement (used to show the toast). */
export function onAchievementUnlocked(listener: (a: Achievement) => void) {
  unlockListeners.add(listener);
  return () => {
    unlockListeners.delete(listener);
  };
}

export function unlock(id: AchievementId) {
  if (unlocked.has(id)) return;
  const achievement = ACHIEVEMENTS.find((a) => a.id === id);
  if (!achievement) return;
  unlocked.add(id);
  writeSet(STORAGE_KEY, unlocked);
  emitChange();
  unlockListeners.forEach((l) => l(achievement));
}

/** Records a page visit and unlocks Explorer once every main page has been seen. */
export function recordPageVisit(pathname: string) {
  if (!EXPLORER_PAGES.includes(pathname)) return;
  const pages = readSet(PAGES_KEY);
  pages.add(pathname);
  writeSet(PAGES_KEY, pages);
  if (EXPLORER_PAGES.every((p) => pages.has(p))) unlock('explorer');
}

export function resetAchievements() {
  unlocked = new Set();
  writeSet(STORAGE_KEY, unlocked);
  writeSet(PAGES_KEY, new Set());
  emitChange();
}
