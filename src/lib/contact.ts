import { contact } from '../data/content';

export const resumeHref = `${import.meta.env.BASE_URL}${contact.resumeFile}`;

/** Copies text to the clipboard. Resolves false when the browser refuses. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Starts the resume download, same as clicking the Resume button. */
export function downloadResume() {
  const a = document.createElement('a');
  a.href = resumeHref;
  a.download = contact.resumeFile;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
