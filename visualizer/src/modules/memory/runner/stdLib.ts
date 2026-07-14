import { IEntry } from '../entry';
import { FullBytecodeItem, Memory } from '../memory';
import { CreateEntryParams } from '../region';
import { SymbolTypeParams } from '../symbol';
import { RunnerEntry } from './entry';
import { RunnerMemory } from './memory';

export let createStdLib = (internalMemory: Memory) => {
  let memory = new RunnerMemory(internalMemory);

  return {
    setSymbolTypes: (types: SymbolTypeParams[]) => memory.setSymbolTypes(types),
    initPointers: (values: Record<string, number>) => memory.initPointers(values),
    setBytecode: (bytecode: FullBytecodeItem[]) => memory.setBytecode(bytecode),
    setReferenceBytecode: (bytecode: FullBytecodeItem[]) =>
      memory.setReferenceBytecode(bytecode),
    printMemory: (region: string) => memory.getRegion(region).printMemory(),
    getPointer: (pointer: string) => memory.getPointer(pointer).getAddress(),
    setPointer: (pointer: string, address: number) => memory.setPointer(pointer, address),
    getRegion: (region: string) => memory.getRegion(region),
    createEntry: (input: CreateEntryParams) => memory.createEntry(input),
    createModifiedEntry: (entry: IEntry | RunnerEntry) => memory.createModifiedEntry(entry),
    memory
  };
};

export type StdLib = ReturnType<typeof createStdLib>;
