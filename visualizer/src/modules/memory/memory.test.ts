import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryError } from './lib';
import { Memory } from './memory';

describe('Memory', () => {
  let memory: Memory;

  beforeEach(() => {
    memory = Memory.create()
      .region({
        identifier: 'stack',
        name: 'Stack Region',
        type: 'stack',
        entrySize: 4,
        pointers: [{ name: 'sp', type: 'stack_pointer' }]
      })
      .region({
        identifier: 'code',
        name: 'Code Region',
        type: 'code',
        pointers: [{ name: 'pc', type: 'code_pointer' }]
      })
      .entryType({
        identifier: 'int',
        name: 'Integer',
        kind: 'memory',
        fieldSize: 4
      })
      .build();
  });

  it('should initialize memory with regions and entry types', () => {
    expect(memory.hasRegion('stack')).toBe(true);
    expect(memory.hasRegion('code')).toBe(true);
    expect(memory.hasEntryType('int')).toBe(true);
  });

  it('should get and set pointers', () => {
    memory.setPointer('sp', 100);
    const pointer = memory.getPointer('sp');
    expect(pointer.getAddress()).toBe(100);
  });

  it('should throw error when setting address on root pointer', () => {
    memory = Memory.create()
      .region({
        identifier: 'root',
        name: 'Root Region',
        type: 'addressable',
        entrySize: 4,
        pointers: [{ name: 'rp', type: 'root_pointer' }]
      })
      .build();

    expect(() => memory.setPointer('rp', 100)).toThrow(MemoryError);
  });

  it('should initialize pointers with values', () => {
    memory.initPointers({ sp: 200, pc: 300 });
    expect(memory.getPointer('sp').getAddress()).toBe(200);
    expect(memory.getPointer('pc').getAddress()).toBe(300);
  });

  it('should list all pointers', () => {
    const pointers = memory.listPointers();
    expect(pointers.length).toBe(2);
  });

  it('should get region by identifier', () => {
    const region = memory.getRegion('stack');
    expect(region.name).toBe('stack');
  });

  it('should throw error when getting non-existent region', () => {
    expect(() => memory.getRegion('nonexistent')).toThrow(MemoryError);
  });

  it('should clone memory', () => {
    const clonedMemory = memory.clone();
    expect(clonedMemory).not.toBe(memory);
    expect(clonedMemory.getPointer('sp').getAddress()).toBe(
      memory.getPointer('sp').getAddress()
    );
  });
});
