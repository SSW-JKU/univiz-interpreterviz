import { IEntry } from '../entry';
import { MemoryError } from '../lib';
import { Memory } from '../memory';
import { Pointer } from '../pointer';
import { BaseRegion } from './base';

export class AddressableRegion extends BaseRegion {
  protected _memory: (
    | { type: 'entry'; entries: IEntry[] }
    | { type: 'overflow'; entryIndex: number }
  )[];

  public isFieldRegion = false;

  constructor(
    name: string,
    pointers: Pointer[],
    protected readonly entrySize: number,
    memory: Memory,
    type?: 'stack'
  ) {
    if (!entrySize) throw new MemoryError('Entry size must be greater than 0.');

    super(type ?? 'addressable', name, pointers, memory);
    this._memory = [];
  }

  public toString() {
    return this._memory
      .map((mem, address) => {
        if (!mem || mem.type == 'overflow') return undefined!;
        return `Address: ${address}; Entries: ${Object.entries(mem.entries)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`;
      })
      .filter(Boolean)
      .join('\n');
  }

  protected getSafeWithAddress(address: number) {
    this.checkAddress('get', address);

    let realAddress = address;

    let mem = this._memory[address];
    if (mem?.type == 'overflow') {
      realAddress = mem.entryIndex;
      mem = this._memory[mem.entryIndex];
    }

    return mem?.type == 'entry' ? { address: realAddress, entries: mem.entries } : null;
  }

  public getSafeFull(address: number) {
    let entry = this.getSafeWithAddress(address);
    return entry?.entries ?? null;
  }

  public getSafe(
    address_: number | [number, number | undefined | void],
    sliceAddress_?: number
  ) {
    let address = Array.isArray(address_) ? address_[0] : address_;
    let sliceAddress = (Array.isArray(address_) ? address_[1] : sliceAddress_) ?? 0;

    let entries = this.getSafeFull(address);
    return entries?.[sliceAddress] ?? null;
  }

  public get(address_: number | [number, number | undefined | void], sliceAddress?: number) {
    let entry = this.getSafe(address_, sliceAddress);

    if (!entry) {
      this.printMemory();
      throw new MemoryError(`No entry at address ${address_}.`);
    }

    return entry;
  }

  protected removeEntry(address: number) {
    let entry = this.getSafeWithAddress(address);
    if (!entry) return;

    let i = entry.address;
    this._memory[i] = undefined!;
    i++;
    while (this._memory[i]?.type == 'overflow') {
      this._memory[i] = undefined!;
      i++;
    }
  }

  protected removeEntryAndAllAfter(address: number) {
    let entry = this.getSafeWithAddress(address);
    if (!entry) return;

    for (let i = entry.address; i < this._memory.length; i++) {
      this._memory[i] = undefined!;
    }
  }

  protected getChunkSize(entry: IEntry) {
    return Math.ceil(entry.getSize() / this.entrySize);
  }

  public getNextAddress(): number {
    throw new MemoryError('Cannot get next address for addressable region.');
  }

  public set(address_: number | [number, number | undefined | void], entry: IEntry) {
    let address = Array.isArray(address_) ? address_[0] : address_;
    let sliceAddress = (Array.isArray(address_) ? address_[1] : undefined) ?? 0;

    this.checkAddress('set', address);
    this.checkEntry('set', entry);

    if (entry.hasFieldRegion && this.isFieldRegion) {
      throw new MemoryError('Cannot set entry with field region in field region.');
    }

    let isNew = !entry.consumed;

    if (entry.consumed) entry = this.createModifiedEntry(entry);
    entry.consumed = true;
    entry.region = this;

    this.incrementVersion();

    let currentFunction = this.functionManager.getCurrent();
    let funVariable = this.functionManager.getVariableAtAddress(address);
    let globalVariable = this.getGlobalAtAddress(address);

    if (currentFunction) entry.functionId = currentFunction.id;

    if (funVariable && currentFunction) {
      // entry.setName(`${currentFunction.name}.${funVariable.name}`);
      entry.setName(funVariable.name);
      entry.setSymbolType(funVariable.symbolTypeId);
    } else if (globalVariable) {
      // entry.setName(`global ${globalVariable.name}`);
      entry.setName(globalVariable.name);
      entry.symbolType = this.memory.getSymbolType(globalVariable.symbolTypeId);
    } else if (this.isFieldRegion && !isNew) {
      entry.setName(undefined);
    }

    if (this._memory[address]?.type == 'overflow') this.removeEntry(address);

    let overflowChunks = this.getChunkSize(entry) - 1;

    let entries = [...(this.getSafeFull(address) ?? [])];
    entries[sliceAddress] = entry;
    this._memory[address] = { type: 'entry', entries };

    for (let i = 1; i <= overflowChunks; i++) {
      this._memory[address + i] = { type: 'overflow', entryIndex: address };
    }

    // Remove remaining overflow entries
    for (let i = 1; true; i++) {
      if (this._memory[address + overflowChunks + i]?.type == 'overflow') {
        this._memory[address + overflowChunks + i] = undefined!;
      } else break;
    }
  }

  public listEntries() {
    let offset = 0;

    return this._memory.flatMap((mem, address) => {
      if (mem?.type != 'entry') return [];

      let rv = mem.entries.map((entry, slice) => ({
        address: {
          main: address,
          slice,
          multiSlice: mem.entries.length > 1,
          global: address + offset
        },
        entry
      }));

      offset += Math.max(0, rv.length - 1);

      return rv;
    });
  }

  public clone() {
    let clone = new AddressableRegion(
      this.name,
      this.clonePointers(),
      this.entrySize,
      this.memory
    );
    clone._id = this._id;

    clone.setVersionForClone(this.version + 1);

    for (let mem of this._memory) {
      if (mem?.type == 'entry') {
        clone._memory.push({ type: 'entry', entries: mem.entries.map(e => e.clone()) });
      } else if (mem?.type == 'overflow') {
        clone._memory.push({ type: 'overflow', entryIndex: mem.entryIndex });
      } else {
        clone._memory.push(undefined!);
      }
    }

    return clone;
  }
}
