import { describe, expect, it } from 'vitest';
import { isAscii, toAscii } from './ascii';

describe('isAscii', () => {
  it('should return true for ASCII values', () => {
    expect(isAscii(32)).toBe(true);
    expect(isAscii(65)).toBe(true);
    expect(isAscii(126)).toBe(true);
  });

  it('should return false for non-ASCII values', () => {
    expect(isAscii(31)).toBe(false);
    expect(isAscii(127)).toBe(false);
    expect(isAscii(200)).toBe(false);
  });
});

describe('toAscii', () => {
  it('should convert ASCII values to characters', () => {
    expect(toAscii(65)).toBe('A');
    expect(toAscii(97)).toBe('a');
    expect(toAscii(48)).toBe('0');
  });

  it('should return "." for non-ASCII values', () => {
    expect(toAscii(31)).toBe('.');
    expect(toAscii(127)).toBe('.');
    expect(toAscii(200)).toBe('.');
  });
});
