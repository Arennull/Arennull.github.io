import { describe, expect, it } from 'vitest';
import { partOf, projectFacts } from '../../content/project-facts';
import { projects } from '../../content/projects';
import { LANGS } from './types';

describe('project facts', () => {
  it('only talks about projects that exist', () => {
    const ids = new Set(projects.map((p) => p.id));
    for (const id of Object.keys(projectFacts)) expect(ids.has(id)).toBe(true);
  });

  it('keeps periods in order and commit counts possible', () => {
    for (const { period, commits } of Object.values(projectFacts)) {
      expect(period[0]).toMatch(/^\d{4}-\d{2}$/);
      expect(period[1]).toMatch(/^\d{4}-\d{2}$/);
      expect(period[0] <= period[1]).toBe(true);
      expect(commits.mine).toBeGreaterThan(0);
      if (commits.total !== undefined) expect(commits.mine).toBeLessThanOrEqual(commits.total);
    }
  });

  it('writes every decision in every language', () => {
    for (const { decisions } of Object.values(projectFacts)) {
      if (!decisions) continue;
      for (const lang of LANGS) expect(decisions[lang]).toHaveLength(decisions.en.length);
    }
  });

  it('never calls a handful of commits authorship', () => {
    expect(partOf({ mine: 1119, total: 1124 })).toBe('lead');
    expect(partOf({ mine: 1429, total: 2638 })).toBe('co');
    expect(partOf({ mine: 2, total: 313 })).toBe('contributor');
    expect(partOf({ mine: 19 })).toBe('contributor');
  });
});
