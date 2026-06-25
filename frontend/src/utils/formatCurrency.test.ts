import { describe, expect, it } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats whole numbers with two decimal places', () => {
    expect(formatCurrency(60)).toBe('$60.00');
  });

  it('formats fractional amounts', () => {
    expect(formatCurrency(10.5)).toBe('$10.50');
    expect(formatCurrency(120)).toBe('$120.00');
  });

  it('formats string amounts from API', () => {
    expect(formatCurrency('60')).toBe('$60.00');
    expect(formatCurrency('10.5')).toBe('$10.50');
  });
});
