/**
 * Programming languages, counted from my own commits: a repository counts for a
 * language when I added at least 200 lines of it there. Lockfiles, generated
 * files and dependencies are left out.
 */
export const LANGUAGE_REPOS = 14;

export const languages: { name: string; repos: number }[] = [
  { name: 'TypeScript', repos: 10 },
  { name: 'CSS', repos: 9 },
  { name: 'JavaScript', repos: 8 },
  { name: 'SQL', repos: 5 },
  { name: 'Shell', repos: 4 },
  { name: 'HTML', repos: 3 },
  { name: 'Python', repos: 1 },
  { name: 'PHP', repos: 1 },
];
