import { IEntry } from '../entry';
import { FullBytecodeItem, Memory } from '../memory';
import { CreateEntryParams } from '../region';
import { SymbolTypeParams } from '../symbol';
import { RunnerEntry } from './entry';
import { RunnerPointer } from './pointer';
import { RunnerRegion } from './region';

export class RunnerMemory {
  constructor(private memory: Memory) {}

  createEntry(input: CreateEntryParams) {
    return new RunnerEntry(this.memory.createEntry(input));
  }

  createModifiedEntry(parent: IEntry | RunnerEntry) {
    return new RunnerEntry(this.memory.createModifiedEntry(RunnerEntry.toEntry(parent)));
  }

  getPointer(name: string) {
    return new RunnerPointer(this.memory.getPointer(name));
  }

  setPointer(name: string, address: number) {
    this.memory.setPointer(name, address);
  }

  setBytecode(bytecode: FullBytecodeItem[]) {
    this.memory.setBytecode(bytecode);
  }

  setReferenceBytecode(bytecode: FullBytecodeItem[]) {
    this.memory.setReferenceBytecode(bytecode);
  }

  initPointers(values: Record<string, number>) {
    this.memory.initPointers(values);
  }

  getSymbolType(name: string | number) {
    return this.memory.getSymbolType(name);
  }

  getSymbolTypeById(id: number | string) {
    return this.memory.getSymbolTypeById(id);
  }

  setSymbolTypes(types: SymbolTypeParams[]) {
    this.memory.setSymbolTypes(types);
  }

  listPointers() {
    return this.memory.listPointers().map(pointer => new RunnerPointer(pointer));
  }

  getRegion(identifier: string) {
    return new RunnerRegion(this.memory.getRegion(identifier));
  }

  hasRegion(identifier: string) {
    return this.memory.hasRegion(identifier);
  }

  listRegions() {
    return this.memory.listRegions().map(region => new RunnerRegion(region));
  }

  getEntryType(identifier: string) {
    return this.memory.getEntryType(identifier);
  }

  hasEntryType(identifier: string) {
    return this.memory.hasEntryType(identifier);
  }
}
