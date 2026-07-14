import { describe, expect, it } from 'vitest';
import { SymbolType, SymbolTypeParams } from './symbolType';

describe('SymbolType', () => {
  it('should create a SymbolType instance with valid parameters', () => {
    const params: SymbolTypeParams = {
      id: 1,
      kind: 'atomic',
      name: 'testSymbol',
      line: 10,
      arrayDepth: 0,
      variables: []
    };

    const symbolType = SymbolType.create(params);

    expect(symbolType.kind).toBe('atomic');
    expect(symbolType.name).toBe('testSymbol');
    expect(symbolType.line).toBe(10);
    expect(symbolType.arrayDepth).toBe(0);
    expect(symbolType.variables).toEqual([]);
  });

  it('should throw an error for invalid parameters', () => {
    const invalidParams = {
      id: 'invalid_id',
      kind: 'unknown_kind',
      name: 123,
      line: 'not_a_number',
      arrayDepth: 'not_a_number',
      variables: 'not_an_array'
    };

    expect(() => SymbolType.create(invalidParams as any)).toThrowError();
  });

  it('should find a SymbolType by ID', () => {
    const params1: SymbolTypeParams = {
      id: 1,
      kind: 'atomic',
      name: 'symbol1',
      line: 10,
      arrayDepth: 0,
      variables: []
    };

    const params2: SymbolTypeParams = {
      id: 2,
      kind: 'struct',
      name: 'symbol2',
      line: 20,
      arrayDepth: 1,
      variables: []
    };

    const symbolType1 = SymbolType.create(params1);
    const symbolType2 = SymbolType.create(params2);

    const symbolTypes = [symbolType1, symbolType2];

    expect(SymbolType.getById(symbolTypes, 1)).toBe(symbolType1);
    expect(SymbolType.getById(symbolTypes, 3)).toBeUndefined();
  });
});
