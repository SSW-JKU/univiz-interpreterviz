import { ID } from '../../lib';
import { EntryType } from '../entryType';
import { MemoryError } from '../lib/error';
import { AddressableRegion, CreateEntryParams, IMemoryRegion } from '../region';
import { SymbolType } from '../symbol';
import { AlternativeName, IEntry } from './interface';

export class MemoryEntry implements IEntry {
  public readonly kind = 'memory' as const;
  public readonly id;
  public consumed = false;
  public region: IMemoryRegion;
  public functionId?: string;
  public symbolType?: SymbolType;

  #version = 1;
  #size: number;
  #value: number;
  #fieldStore?: AddressableRegion;
  #names?: { [k in AlternativeName]?: string | undefined };

  constructor(
    public type: EntryType,
    opts: {
      size: number;
      value: number;
      forceId?: string;
      names: string | undefined | { [k in AlternativeName]?: string | undefined };
      symbolType?: SymbolType;
      region: IMemoryRegion;
      arrayLength?: number;
      arrayStartOffset?: number;
      arraySymbolType?: number | string;
    }
  ) {
    if (typeof opts.size !== 'number' || typeof opts.value !== 'number') {
      throw new MemoryError('Invalid memory entry construction.');
    }

    this.id = opts.forceId ?? ID.memoryEntry.generate();
    this.symbolType = opts.symbolType;
    this.region = opts.region;

    this.#size = opts.size;
    this.#value = opts.value;
    this.#names = typeof opts.names == 'object' ? opts.names : { original: opts.names };

    if (type.hasFields) {
      this.#fieldStore = new AddressableRegion(
        `${type.identifier}-fields`,
        [],
        type.fieldSize,
        this.region.memory
      );
      this.#fieldStore.isFieldRegion = true;

      if (opts.symbolType) {
        if (opts.symbolType.kind == 'struct') {
          this.#fieldStore.setGlobals(
            opts.symbolType.variables.map(v => ({
              // name: `${opts.name ?? 'Object'}.${v.name}`,
              name: v.name,
              initialValue: 0,
              address: v.address,
              type: 'constant',
              symbolType: v.symbolTypeId,
              size: 4
            })),
            { autoInit: false }
          );
        }
      }
    }
  }

  public get hasFieldRegion() {
    return !!this.#fieldStore;
  }

  public get version() {
    return this.#version;
  }

  public get name() {
    return this.#names?.original;
  }

  public get alternativeNames() {
    return this.#names ?? {};
  }

  public setName(...params: [string | undefined] | [AlternativeName, string | undefined]) {
    this.#version++;

    if (params.length <= 1) {
      this.#names = {
        ...this.#names,
        original: params[0]
      };
    } else if (params.length == 2) {
      let [type, name] = params as [AlternativeName, string | undefined];
      this.#names = {
        ...this.#names,
        [type]: name
      };

      if (!this.#names.original) this.#names.original = name;
    } else {
      throw new MemoryError('Invalid parameters for setName.');
    }
  }

  public getSize() {
    return this.#size;
  }

  public setSize(size: number) {
    this.#version++;
    this.#size = size;
  }

  public getValue() {
    return this.#value;
  }

  public setValue(value: number) {
    this.#version++;
    this.#value = value;
  }

  public setField(address: number | [number, number | undefined | void], entry: IEntry) {
    if (!this.#fieldStore) {
      throw new MemoryError('Cannot set field on memory entry without fields.');
    }

    this.#fieldStore.set(address, entry);
  }

  public getField(
    address: number | [number, number | undefined | void],
    sliceAddress?: number
  ) {
    if (!this.#fieldStore) {
      throw new MemoryError('Cannot get field on memory entry without fields.');
    }

    return this.#fieldStore.get(address, sliceAddress);
  }

  public getFieldSafe(
    address: number | [number, number | undefined | void],
    sliceAddress?: number
  ) {
    if (!this.#fieldStore) {
      return null;
    }

    return this.#fieldStore.getSafe(address, sliceAddress);
  }

  public getFieldStore() {
    return this.#fieldStore;
  }

  public setSymbolType(symbolTypeId: string | number) {
    this.symbolType = this.region.memory.getSymbolType(symbolTypeId);
  }

  public setType(type: string) {
    this.type = this.region.memory.getEntryType(type);
  }

  public createEntry(input: CreateEntryParams) {
    if (!this.#fieldStore) {
      throw new MemoryError('Cannot create field on memory entry without fields.');
    }

    return this.#fieldStore.createEntry(input);
  }

  public createModifiedEntry(parent: IEntry) {
    if (!this.#fieldStore) {
      throw new MemoryError('Cannot create field on memory entry without fields.');
    }

    return this.#fieldStore.createModifiedEntry(parent);
  }

  public clone(opts: { keepOldId?: boolean } = {}) {
    let clone = new MemoryEntry(this.type, {
      size: this.getSize(),
      value: this.getValue(),
      forceId: opts.keepOldId ? this.id : undefined,
      names: this.#names,
      symbolType: this.symbolType,
      region: this.region
    });
    clone.functionId = this.functionId;
    clone.#fieldStore = this.#fieldStore?.clone();
    clone.#version = this.#version + 1;

    if (this.#fieldStore) {
      clone.#fieldStore = this.#fieldStore.clone();
    }

    return clone;
  }

  public toString() {
    let str = `MemoryEntry(size: ${this.getSize()}, value: ${this.getValue()}, type: ${
      this.type.identifier
    })`;

    if (this.#fieldStore) {
      let fieldsStore = this.#fieldStore.toString();

      if (!fieldsStore) {
        str += `\n  -> No fields`;
      } else {
        str += `\n${fieldsStore
          .toString()
          .split('\n')
          .map(line => `  -> ${line}`)
          .join('\n')}`;
      }
    }

    return str;
  }
}
