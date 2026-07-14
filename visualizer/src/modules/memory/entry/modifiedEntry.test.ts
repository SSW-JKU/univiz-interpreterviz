import { describe, expect, test } from 'vitest';
import { testMemory } from '../region/_test';

describe('ModifiedEntry', () => {
  test('should create an instance with the correct properties', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });
    let referenceEntry = regions.test.createModifiedEntry(memoryEntry);

    expect(referenceEntry.kind).toBe('reference');
    expect(referenceEntry.type).toBe(memoryEntry.type);
    expect(referenceEntry.id).toBeDefined();
    expect(referenceEntry.parent).toBe(memoryEntry);
    expect(referenceEntry.region).toBe(regions.test);
  });

  test('should return size from parent', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });
    let referenceEntry = regions.test.createModifiedEntry(memoryEntry);

    expect(referenceEntry.getSize()).toBe(memoryEntry.getSize());
  });

  test('should set size on parent', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });
    let referenceEntry = regions.test.createModifiedEntry(memoryEntry);

    referenceEntry.setSize(15);

    expect(memoryEntry.getSize()).toBe(15);
  });

  test('should return value from parent', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });
    let referenceEntry = regions.test.createModifiedEntry(memoryEntry);

    expect(referenceEntry.getValue()).toBe(memoryEntry.getValue());
  });

  test('should set value on parent', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });
    let referenceEntry = regions.test.createModifiedEntry(memoryEntry);

    referenceEntry.setValue(30);

    expect(memoryEntry.getValue()).toBe(30);
  });

  test('should clone correctly', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });
    let referenceEntry = regions.test.createModifiedEntry(memoryEntry);

    let clone = referenceEntry.clone();

    expect(clone).not.toBe(referenceEntry);
    expect(clone.parent).not.toBe(referenceEntry.parent);
    expect(clone.parent.type).toBe(referenceEntry.parent.type);
    expect(clone.region).toBe(referenceEntry.region);
  });
});
