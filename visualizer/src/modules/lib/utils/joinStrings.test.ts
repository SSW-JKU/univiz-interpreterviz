import { describe, expect, it } from 'vitest';
import { joinStringWithAnd } from './joinStrings';

describe('joinStringWithAnd', () => {
  it('should join strings with commas and "and" before the last element', () => {
    expect(joinStringWithAnd(['apple', 'banana', 'cherry'])).toBe('apple, banana and cherry');
  });

  it('should handle a single element array', () => {
    expect(joinStringWithAnd(['apple'])).toBe('apple');
  });

  it('should handle an empty array', () => {
    expect(joinStringWithAnd([])).toBe('');
  });

  it('should handle an array with two elements', () => {
    expect(joinStringWithAnd(['apple', 'banana'])).toBe('apple and banana');
  });

  it('should handle an array with numbers and booleans', () => {
    expect(joinStringWithAnd([1, 'apple', true])).toBe('1, apple and true');
  });
});
