import { describe, expect, test } from 'vitest';
import { Pointer } from './pointer';

describe('Pointer', () => {
  test('should create an instance with the correct properties', () => {
    let pointer = new Pointer({
      name: 'root',
      address: 0,
      type: 'root_pointer'
    });

    expect(pointer.type).toBe('root_pointer');
    expect(pointer.name).toBe('root');
    expect(pointer.getAddress()).toBe(0);
  });

  test('should set address correctly', () => {
    let pointer = new Pointer({
      name: 'root',
      address: 0,
      type: 'root_pointer'
    });

    pointer.setAddress(10);

    expect(pointer.getAddress()).toBe(10);
  });

  test('should clone correctly', () => {
    let pointer = new Pointer({
      name: 'root',
      address: 0,
      type: 'root_pointer'
    });

    let clone = pointer.clone();

    expect(clone).not.toBe(pointer);
    expect(clone.type).toBe(pointer.type);
    expect(clone.name).toBe(pointer.name);
    expect(clone.getAddress()).toBe(pointer.getAddress());
  });
});
