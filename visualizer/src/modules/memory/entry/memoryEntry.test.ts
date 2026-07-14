import { describe, expect, test } from 'vitest';
import { testMemory } from '../region/_test';

describe('MemoryEntry', () => {
  test('should create an instance with the correct properties', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });

    expect(memoryEntry.kind).toBe('memory');
    expect(memoryEntry.type).toBe(entryTypes.test);
    expect(memoryEntry.id).toBeDefined();
    expect(memoryEntry.getSize()).toBe(10);
    expect(memoryEntry.getValue()).toBe(20);
  });

  test('should set size correctly', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });

    memoryEntry.setSize(15);
  });

  test('should set value correctly', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });

    memoryEntry.setValue(30);

    expect(memoryEntry.getValue()).toBe(30);
  });

  test('should throw an error when setting field without fields', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });

    expect(() => memoryEntry.setField(0, memoryEntry)).toThrowError(
      'Cannot set field on memory entry without fields.'
    );
  });

  test('should throw an error when getting field without fields', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });

    expect(() => memoryEntry.getField(0)).toThrowError(
      'Cannot get field on memory entry without fields.'
    );
  });

  test('should clone correctly', () => {
    let { memory, regions, entryTypes } = testMemory({
      entryTypes: { test: {} },
      regions: { test: { type: 'stack' } }
    });

    let memoryEntry = regions.test.createEntry({ type: 'test', size: 10, value: 20 });

    let clone = memoryEntry.clone();

    expect(clone).not.toBe(memoryEntry);
    expect(clone.type).toBe(memoryEntry.type);
    expect(clone.getSize()).toBe(memoryEntry.getSize());
    expect(clone.getValue()).toBe(memoryEntry.getValue());
  });
});
