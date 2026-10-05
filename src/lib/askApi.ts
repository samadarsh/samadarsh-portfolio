import { contact } from '../data/content';

// The one client for /api/ask, shared by the Ask Adarsh chat and the terminal.

export type AskTurn = { role: 'user' | 'assistant'; content: string };

export const ASK_ERRORS: Record<string, string> = {
  rate_limited: 'Lots of questions right now. Please try again in a minute.',
  not_configured: `The assistant is offline right now. You can email Adarsh at ${contact.email}.`,
  default: `Something went wrong. Please try again, or email Adarsh at ${contact.email}.`,
};

/** Asks the assistant; throws an Error whose message is a key of ASK_ERRORS. */
export async function askAssistant(question: string, history: AskTurn[]): Promise<string> {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: question.trim().slice(0, 500), history }),
  });
  const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
  if (!res.ok || !data.answer) throw new Error(data.error || 'default');
  return data.answer;
}

export const askErrorMessage = (error: unknown) =>
  ASK_ERRORS[error instanceof Error ? error.message : 'default'] ?? ASK_ERRORS.default;
