import { describe, expect, test } from 'vitest';
import { EntryType } from './entryType';

describe('EntryType', () => {
  test('should create an instance with the correct properties', () => {
    let entryType = new EntryType({
      identifier: '1',
      name: 'Type 1',
      hasFields: true,
      fieldSize: 4,
      kind: 'array'
    });

    expect(entryType.identifier).toBe('1');
    expect(entryType.name).toBe('Type 1');
    expect(entryType.hasFields).toBe(true);
  });

  test('should create an instance with default hasFields value', () => {
    let entryType = new EntryType({
      identifier: '2',
      name: 'Type 2',
      kind: 'memory'
    });

    expect(entryType.identifier).toBe('2');
    expect(entryType.name).toBe('Type 2');
    expect(entryType.hasFields).toBe(false);
  });
});
