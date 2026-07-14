import { describe, expect, test } from 'vitest';
import { testMemory } from './_test';

describe('AddressableRegion', () => {
  test('should set and get entry correctly', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'addressable', entrySize: 4 } }
    });

    let entry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });

    regions.test.set(0, entry);

    expect(regions.test.get(0)).toBe(entry);

    entry = entry.clone();

    regions.test.set(100, entry);

    expect(regions.test.get(100)).toBe(entry);
    expect(regions.test.get(101)).toBe(entry);
    expect(regions.test.get(102)).toBe(entry);
    expect(() => regions.test.get(103)).toThrowError('No entry at address 103.');
    expect(() => regions.test.get(4364)).toThrowError('No entry at address 4364.');
  });

  test('should throw an error when getting entry at invalid address', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'addressable', entrySize: 4 } }
    });

    expect(() => regions.test.get(0)).toThrowError('No entry at address 0.');
  });

  test('should clone correctly', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'addressable', entrySize: 4 } }
    });

    let entry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });

    regions.test.set(0, entry);

    let clone = regions.test.clone();

    expect(clone).not.toBe(regions.test);
    expect(clone.get(0).kind).toBe(entry.kind);
    expect(clone.get(0).type).toBe(entry.type);
    expect(clone.get(0).getSize()).toBe(entry.getSize());
    expect(clone.get(0).getValue()).toBe(entry.getValue());
  });
});
