import { IEntry, MemoryEntry, ModifiedEntry } from '../entry';
import { Memory } from '../memory';
import { Pointer } from '../pointer';
import { Function, OpenFunctionParams, Variable } from '../symbol';
import { CreateEntryParams, CreateGlobalParams } from './base';

export interface IMemoryRegion {
  readonly id: string;
  readonly kind: 'addressable' | 'stack' | 'code';
  readonly name: string;
  version: number;
  get: (
    address: number | [number, number | undefined | void],
    sliceAddress?: number
  ) => IEntry;
  getSafe: (
    address: number | [number, number | undefined | void],
    sliceAddress?: number
  ) => IEntry | null;
  set: (address: number | [number, number | undefined | void], entry: IEntry) => void;
  push: (entry: IEntry) => void;
  pop: () => IEntry;
  peek: () => IEntry;
  clone: () => IMemoryRegion;
  printMemory: () => void;
  toString: () => string;
  hasPointer: (name: string) => boolean;
  getPointer: (name: string) => Pointer;
  listPointers: () => Pointer[];
  listEntries: () => {
    address: { main: number; slice: number; multiSlice: boolean; global: number };
    entry: IEntry;
  }[];
  listFunctions: () => Function[];
  openFunction: (opts: OpenFunctionParams) => Function;
  closeFunction: () => Function | undefined;
  getCurrentFunction: () => Function | null;
  createEntry: (params: CreateEntryParams) => MemoryEntry;
  createModifiedEntry: (entry: IEntry) => ModifiedEntry;
  listGlobals: () => Variable[];
  setGlobal: (opts: CreateGlobalParams) => void;
  setGlobals: (opts: CreateGlobalParams[]) => void;
  getNextAddress: () => number;
  readonly memory: Memory;
  isFieldRegion?: boolean;
}
