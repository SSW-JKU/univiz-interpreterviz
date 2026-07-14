import { EntryType } from '../entryType/entryType';
import { AddressableRegion, CreateEntryParams, IMemoryRegion } from '../region';
import { SymbolType } from '../symbol/symbolType';

export type AlternativeName = 'symbolic' | 'numeric' | 'original';

export interface IEntry {
  kind: 'memory' | 'reference';
  type: EntryType;
  id: string;
  version: number;
  consumed: boolean;
  region: IMemoryRegion;

  functionId?: string;

  readonly hasFieldRegion: boolean;

  parent?: IEntry;
  name?: string;
  setName: (...p: [string | undefined] | [AlternativeName, string | undefined]) => void;
  symbolType?: SymbolType;
  alternativeNames: { [k in AlternativeName]?: string | undefined };

  getSize: () => number;
  setSize: (size: number) => void;
  getValue: () => number;
  setValue: (value: number) => void;

  getField: (
    address: number | [number, number | undefined | void],
    sliceAddress?: number
  ) => IEntry;
  getFieldSafe: (
    address: number | [number, number | undefined | void],
    sliceAddress?: number
  ) => IEntry | null;
  setField: (address: number | [number, number | undefined | void], entry: IEntry) => void;
  getFieldStore: () => AddressableRegion | undefined;

  createEntry: (input: CreateEntryParams) => IEntry;
  createModifiedEntry: (parent: IEntry) => IEntry;

  setSymbolType: (symbolType: string | number) => void;
  setType: (type: string) => void;

  clone: (opts?: { keepOldId?: boolean }) => IEntry;
}
