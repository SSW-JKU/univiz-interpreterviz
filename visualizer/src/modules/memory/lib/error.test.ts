import { describe, expect, test } from 'vitest';
import { MemoryError } from './error';

describe('MemoryError', () => {
  test('should create an instance with the correct properties', () => {
    let errorMessage = 'Test error message';
    let memoryError = new MemoryError(errorMessage);

    expect(memoryError).toBeInstanceOf(Error);
    expect(memoryError).toBeInstanceOf(MemoryError);
    expect(memoryError.message).toBe(errorMessage);
    expect(memoryError.name).toBe('MemoryError');
  });
});
