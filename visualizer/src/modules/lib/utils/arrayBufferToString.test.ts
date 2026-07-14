import { describe, expect, it } from 'vitest';
import { arrayBufferToString } from './arrayBufferToString';

describe('arrayBufferToString', () => {
  it('should convert an ArrayBuffer to a string', () => {
    const text = 'Hello, world!';
    const encoder = new TextEncoder();
    const buffer = encoder.encode(text);

    const result = arrayBufferToString(buffer.buffer);

    expect(result).toBe(text);
  });

  it('should handle empty ArrayBuffer', () => {
    const buffer = new ArrayBuffer(0);

    const result = arrayBufferToString(buffer);

    expect(result).toBe('');
  });

  it('should handle ArrayBuffer with special characters', () => {
    const text = 'こんにちは世界';
    const encoder = new TextEncoder();
    const buffer = encoder.encode(text);

    const result = arrayBufferToString(buffer.buffer);

    expect(result).toBe(text);
  });
});
