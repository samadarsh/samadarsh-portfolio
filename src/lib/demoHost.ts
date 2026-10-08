/**
 * Free demo hosts put an app to sleep when nobody has used it for a while, and the first visit
 * then waits on a "waking up" screen. Knowing the host from the link means any new project on
 * one of these gets the note automatically.
 */
const SLEEPY_HOSTS = [/\.streamlit\.app$/, /\.hf\.space$/, /^huggingface\.co$/, /\.onrender\.com$/];

export const WAKE_NOTE = 'Free hosting: may take about 30 seconds to wake up.';

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
