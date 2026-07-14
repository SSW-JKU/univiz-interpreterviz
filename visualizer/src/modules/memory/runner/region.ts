import { IEntry } from '../entry';
import { CreateGlobalParams, IMemoryRegion } from '../region';
import { OpenFunctionParams } from '../symbol';
import { RunnerEntry } from './entry';
import { RunnerPointer } from './pointer';

export class RunnerRegion {
  constructor(private region: IMemoryRegion) {}

  get id() {
    return this.region.id;
  }

  get kind() {
    return this.region.kind;
  }

  get name() {
    return this.region.name;
  }

  get(address: number | [number, number | undefined | void], sliceAddress?: number) {
    return new RunnerEntry(this.region.get(address, sliceAddress));
  }

  set(address: number | [number, number | undefined | void], entry: RunnerEntry | IEntry) {
    this.region.set(address, RunnerEntry.toEntry(entry));
  }

  push(entry: RunnerEntry | IEntry) {
    this.region.push(RunnerEntry.toEntry(entry));
  }

  pop() {
    return new RunnerEntry(this.region.pop());
  }

  peek() {
    return new RunnerEntry(this.region.peek());
  }

  clone() {
    return new RunnerRegion(this.region.clone());
  }

  printMemory() {
    this.region.printMemory();
  }

  hasPointer(name: string) {
    return this.region.hasPointer(name);
  }

  getPointer(name: string) {
    return new RunnerPointer(this.region.getPointer(name));
  }

  listFunctions() {
    return this.region.listFunctions();
  }

  openFunction(opts: OpenFunctionParams) {
    return this.region.openFunction(opts);
  }

  closeFunction() {
    return this.region.closeFunction();
  }

  getCurrentFunction() {
    return this.region.getCurrentFunction();
  }

  listGlobals() {
    return this.region.listGlobals();
  }

  setGlobal(opts: CreateGlobalParams) {
    this.region.setGlobal(opts);
  }

  setGlobals(opts: CreateGlobalParams[]) {
    this.region.setGlobals(opts);
  }
}
