import { describe, expect, it } from 'vitest';
import { checkoutUrl } from '../../src/license';

describe('release billing endpoint', () => {
  it('defaults checkout to the production Sociobot API', () => {
    expect(checkoutUrl).toBe('https://api.sociobot.in/api/v1/products/doodle-to-game/checkout');
  });
});
