import { describe, expect, it } from 'vitest';
import { showsMerchantTag } from './sharedColumns';

describe('showsMerchantTag', () => {
  it('tags every expense that has a merchant, even when the description names it', () => {
    expect(showsMerchantTag('Amazon')).toBe(true);
    expect(showsMerchantTag('Vinted')).toBe(true);
  });

  it('adds nothing without a merchant', () => {
    expect(showsMerchantTag(null)).toBe(false);
    expect(showsMerchantTag(undefined)).toBe(false);
    expect(showsMerchantTag(' ')).toBe(false);
  });
});
