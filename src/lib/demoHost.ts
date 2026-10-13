/**
 * Free demo hosts put an app to sleep when nobody has used it for a while, and the first visit
 * then waits on a "waking up" screen. Knowing the host from the link means any new project on
 * one of these gets the note automatically.
 */
const SLEEPY_HOSTS = [/\.streamlit\.app$/, /\.hf\.space$/, /^huggingface\.co$/, /\.onrender\.com$/];

export function sleepsWhenIdle(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname === 'huggingface.co') return pathname.startsWith('/spaces/');
    return SLEEPY_HOSTS.some((re) => re.test(hostname));
  } catch {
    return false;
  }
}

/**
 * How long the first visit may wait, or null for hosts that don't sleep. Hugging Face Spaces
 * restart the whole container: VoiceNote's took about six minutes on 12 Oct 2026.
 */
export function wakeTime(url: string | null | undefined): { long: string; short: string } | null {
  if (!sleepsWhenIdle(url)) return null;
  const { hostname } = new URL(url as string);
  return hostname === 'huggingface.co' || hostname.endsWith('.hf.space')
    ? { long: 'a few minutes', short: 'a few min' }
    : { long: 'about 30 seconds', short: '~30s' };
}

/** The note shown under a live-demo link on a host that sleeps. */
export function wakeNote(url: string | null | undefined): string | null {
  const t = wakeTime(url);
  return t ? `Free hosting: may take ${t.long} to wake up.` : null;
}
