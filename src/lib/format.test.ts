import { describe, expect, test } from 'bun:test';
import {
  clampMultiplier,
  formatCompact,
  formatDate,
  formatMonth,
  formatMultiplier,
  formatNumber,
  formatPercent,
} from '~/lib/format';

describe('formatMultiplier', () => {
  test('rounds to one decimal with x suffix', () => {
    expect(formatMultiplier(1.234)).toBe('1.2x');
    expect(formatMultiplier(2.95)).toBe('3.0x');
  });

  test('returns em-dash for zero, negative or non-finite values', () => {
    expect(formatMultiplier(0)).toBe('—');
    expect(formatMultiplier(-1)).toBe('—');
    expect(formatMultiplier(Number.NaN)).toBe('—');
    expect(formatMultiplier(Number.POSITIVE_INFINITY)).toBe('—');
  });
});

describe('clampMultiplier', () => {
  test('rounds to one decimal place', () => {
    expect(clampMultiplier(2.34)).toBe(2.3);
    expect(clampMultiplier(2.36)).toBe(2.4);
  });

  test('returns 0 for invalid inputs', () => {
    expect(clampMultiplier(0)).toBe(0);
    expect(clampMultiplier(-2)).toBe(0);
    expect(clampMultiplier(Number.NaN)).toBe(0);
  });
});

describe('formatPercent', () => {
  test('formats as integer percent by default', () => {
    expect(formatPercent(0.42)).toBe('42%');
  });

  test('respects fractionDigits', () => {
    expect(formatPercent(0.4234, 1)).toBe('42.3%');
  });
});

describe('formatNumber and formatCompact', () => {
  test('formatNumber inserts thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  test('formatCompact returns compact notation', () => {
    expect(formatCompact(1500)).toBe('1.5K');
    expect(formatCompact(1_200_000)).toBe('1.2M');
  });
});

describe('formatMonth', () => {
  test('formats yyyy-mm into a short label', () => {
    expect(formatMonth('2025-03')).toMatch(/Mar.*25/);
    expect(formatMonth('2024-12')).toMatch(/Dec.*24/);
  });
});

describe('formatDate', () => {
  test('returns a non-empty string for an ISO date', () => {
    const out = formatDate('2025-03-12T10:14:00Z');
    expect(out.length).toBeGreaterThan(0);
  });
});
