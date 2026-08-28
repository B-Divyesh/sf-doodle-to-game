import { describe, expect, it } from 'vitest';
import { removePaperPixels } from '../../src/image';

describe('paper background removal', () => {
  it('makes near-white paper transparent while preserving dark ink', () => {
    const data = new Uint8ClampedArray([
      250, 250, 248, 255,
      20, 30, 40, 255,
      225, 205, 180, 255,
    ]);
    const result = removePaperPixels({ data, width: 3, height: 1 }, 48);
    expect(result.data[3]).toBeLessThan(80);
    expect(result.data[7]).toBe(255);
    expect(result.data[11]).toBeGreaterThan(150);
  });

  it('does not mutate the source pixels', () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255]);
    removePaperPixels({ data, width: 1, height: 1 });
    expect([...data]).toEqual([255, 255, 255, 255]);
  });
});
