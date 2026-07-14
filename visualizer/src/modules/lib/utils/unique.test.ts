import { describe, expect, it } from 'vitest';
import { unique } from './unique';

describe('unique', () => {
  it('should return unique elements from an array of numbers', () => {
    const input = [1, 2, 2, 3, 4, 4, 5];
    const output = unique(input);
    expect(output).toEqual([1, 2, 3, 4, 5]);
  });

  it('should return unique elements from an array of strings', () => {
    const input = ['a', 'b', 'b', 'c', 'a'];
    const output = unique(input);
    expect(output).toEqual(['a', 'b', 'c']);
  });

  it('should return unique elements based on custom equality function', () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 1 }];
    const eq = (a: { id: number }, b: { id: number }) => a.id === b.id;
    const output = unique(input, eq);
    expect(output).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should return an empty array when input is empty', () => {
    const input: number[] = [];
    const output = unique(input);
    expect(output).toEqual([]);
  });

  it('should return the same array when all elements are unique', () => {
    const input = [1, 2, 3, 4, 5];
    const output = unique(input);
    expect(output).toEqual([1, 2, 3, 4, 5]);
  });
});
