import { describe, expect, it } from 'vitest';
import { defaultProject, projectFromJson, projectToJson, validateProject } from '../../src/state';

describe('project files', () => {
  it('round trips a local project export', () => {
    const source = defaultProject();
    source.template = 'maze';
    source.assets.hero = 'data:image/webp;base64,AAAA';
    const restored = projectFromJson(projectToJson(source));
    expect(restored.template).toBe('maze');
    expect(restored.assets.hero).toBe(source.assets.hero);
  });

  it('rejects unknown templates and remote assets', () => {
    expect(() => validateProject({ template: 'puzzle' })).toThrow(/unknown game/);
    expect(() => validateProject({ template: 'collect', assets: { hero: 'https://example.com/a.png' } })).toThrow(/unreadable drawing/);
  });

  it('uses an actionable message for incomplete JSON', () => {
    expect(() => projectFromJson('{')).toThrow(/incomplete.*Export it again/i);
  });
});
