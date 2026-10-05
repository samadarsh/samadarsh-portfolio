// Shared between api/github.ts and the About page heatmap. Relative imports from api/ carry `.js`.

/** Last year of contributions: weeks (Sunday first) of [date, count, level 0–4]. */
export type GitHubActivity = {
  login: string;
  total: number;
  weeks: [string, number, number][][];
};

export type ActivityStats = { longest: number; current: number; activeDays: number };

/** Longest run of active days, the run ending today (or yesterday), and days with activity. */
export function activityStats(activity: GitHubActivity): ActivityStats {
  const days = activity.weeks.flat();
  let longest = 0;
  let run = 0;
  let activeDays = 0;
  for (const [, count] of days) {
    if (count > 0) {
      run += 1;
      activeDays += 1;
      longest = Math.max(longest, run);
    } else run = 0;
  }
  // Today may have no activity yet, so the current streak can end yesterday.
  let i = days.length - 1;
  if (i >= 0 && days[i][1] === 0) i -= 1;
  let current = 0;
  for (; i >= 0 && days[i][1] > 0; i -= 1) current += 1;
  return { longest, current, activeDays };
}
