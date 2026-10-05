// Vercel serverless function behind the GitHub activity heatmap on the About page.
// Returns the last year of public contributions from GitHub's GraphQL API, cached at the edge.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   GITHUB_TOKEN   required: a fine-grained token with public read-only access and no permissions
//   GITHUB_USER    optional: defaults to samadarsh

import type { GitHubActivity } from '../src/lib/github.js';

const TOKEN = process.env.GITHUB_TOKEN;
const LOGIN = process.env.GITHUB_USER || 'samadarsh';

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

const LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

type Day = { date: string; contributionCount: number; contributionLevel: string };
type GraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: { totalContributions: number; weeks: { contributionDays: Day[] }[] };
      };
    } | null;
  };
  errors?: { message: string }[];
};

const json = (body: unknown, status: number, cache: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache },
  });

const NO_CACHE = 'no-store';
// Shared cache for six hours, then served stale for a day while it refreshes in the background.
const EDGE_CACHE = 'public, max-age=0, s-maxage=21600, stale-while-revalidate=86400';

export async function GET() {
  if (!TOKEN) return json({ error: 'not_configured' }, 503, NO_CACHE);

  try {
    const upstream = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'samadarsh-portfolio',
      },
      body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) {
      console.error('GitHub error', upstream.status, (await upstream.text()).slice(0, 300));
      return json({ error: 'upstream' }, 502, NO_CACHE);
    }
    const data = (await upstream.json()) as GraphQLResponse;
    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      console.error('GitHub GraphQL', data.errors?.map((e) => e.message).join('; '));
      return json({ error: 'upstream' }, 502, NO_CACHE);
    }
    const body: GitHubActivity = {
      login: LOGIN,
      total: calendar.totalContributions,
      weeks: calendar.weeks.map((w) =>
        w.contributionDays.map((d) => [
          d.date,
          d.contributionCount,
          LEVELS[d.contributionLevel] ?? 0,
        ]),
      ),
    };
    return json(body, 200, EDGE_CACHE);
  } catch (error) {
    console.error('GitHub request failed', error);
    return json({ error: 'upstream' }, 502, NO_CACHE);
  }
}
