import { ID } from '../../lib';
import { EntryType } from '../entryType';
import { MemoryError } from '../lib';
import { CreateEntryParams, IMemoryRegion } from '../region';
import { AlternativeName, IEntry } from './interface';
import { MemoryEntry } from './memoryEntry';

export class ModifiedEntry implements IEntry {
  public readonly kind = 'reference' as const;
  public readonly type: EntryType;
  public readonly id;
  public readonly parent: IEntry;
  public consumed = false;

  constructor(
    parent: IEntry,
    public region: IMemoryRegion,
    forceId?: string
  ) {
    // while (parent.kind == 'reference') {
    //   parent = (parent as ReferenceEntry).parent;
    // }

    if (!isEntry(parent) || !region) {
      throw new MemoryError('Invalid reference entry construction.');
    }

    this.id = forceId ?? ID.modifiedEntry.generate();
    this.parent = parent.clone({ keepOldId: true });
    this.type = parent.type;
  }

  get symbolType() {
    return this.parent.symbolType;
  }

  set symbolType(symbolType) {
    this.parent.symbolType = symbolType;
  }

  get name() {
    return this.parent.name;
  }

  get alternativeNames() {
    return this.parent.alternativeNames;
  }

  get version() {
    return this.parent.version;
  }

  public getSize() {
    return this.parent.getSize();
  }

  public setSize(size: number) {
    this.parent.setSize(size);
  }

  public getValue() {
    return this.parent.getValue();
  }

  public setValue(value: number) {
    this.parent.setValue(value);
  }

  public setSymbolType(symbolType: string | number) {
    this.parent.setSymbolType(symbolType);
  }

  public setType(type: string) {
    this.parent.setType(type);
  }

  public getField(
    address: number | [number, number | undefined | void],
    sliceAddress?: number
  ) {
    return this.parent.getField(address, sliceAddress);
  }

  public getFieldSafe(
    address: number | [number, number | undefined | void],
    sliceAddress?: number
  ) {
    return this.parent.getFieldSafe(address, sliceAddress);
  }

  public setField(address: number | [number, number | undefined | void], entry: IEntry) {
    this.parent.setField(address, entry);
  }

  public getFieldStore() {
    return this.parent.getFieldStore();
  }

  public setName(...params: [string | undefined] | [AlternativeName, string | undefined]) {
    this.parent.setName(...params);
  }

  public createEntry(input: CreateEntryParams) {
    return this.parent.createEntry(input);
  }

  public createModifiedEntry(parent: IEntry) {
    return this.parent.createModifiedEntry(parent);
  }

  public get hasFieldRegion() {
    return this.parent.hasFieldRegion;
  }

  public clone(opts?: { keepOldId?: boolean }) {
    return new ModifiedEntry(
      this.parent.clone(),
      this.region,
      opts?.keepOldId ? this.id : undefined
    );
  }

  public toString() {
    return `ModifiedEntry(parent: ${this.parent.toString()})`;
  }
}

export let isEntry = (entry: any): entry is IEntry => {
  return (entry instanceof MemoryEntry || entry instanceof ModifiedEntry) && 'kind' in entry;
};
