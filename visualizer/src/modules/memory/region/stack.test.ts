import { describe, expect, test } from 'vitest';
import { testMemory } from './_test';

describe('StackRegion', () => {
  test('should push and pop entry correctly', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    regions.test.push(regions.test.createEntry({ type: 'test', size: 10, value: 20 }));

    expect(regions.test.pop()).toBeTruthy();
  });

  test('should throw an error when popping from empty stack', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    expect(() => regions.test.pop()).toThrowError('Cannot pop from empty stack.');
  });

  test('should peek entry correctly', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    regions.test.push(regions.test.createEntry({ type: 'test', size: 10, value: 20 }));

    expect(regions.test.peek()).toBeTruthy();
  });

  test('should throw an error when peeking from empty stack', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    expect(() => regions.test.peek()).toThrowError('Cannot peek from empty stack.');
  });

  test('should set and get entry correctly', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let entry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });

    regions.test.set(0, entry);

    expect(regions.test.get(0)).toBe(entry);
  });

  test('should throw an error when getting entry at invalid address', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    expect(() => regions.test.get(0)).toThrowError('No entry at address 0.');
  });

  test('should clone correctly', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let entry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });

    regions.test.push(entry);

    let clone = regions.test.clone();

    expect(clone).not.toBe(regions.test);
    expect(clone.get(0).kind).toBe(entry.kind);
    expect(clone.get(0).type).toBe(entry.type);
    expect(clone.get(0).getSize()).toBe(entry.getSize());
    expect(clone.get(0).getValue()).toBe(entry.getValue());
  });
});
