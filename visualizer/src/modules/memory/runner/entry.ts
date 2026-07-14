import { AlternativeName, IEntry } from '../entry';

export class RunnerEntry {
  constructor(private entry: IEntry) {}

  get kind() {
    return this.entry.kind;
  }

  get id() {
    return this.entry.id;
  }

  get type() {
    return this.entry.type;
  }

  getName(type?: AlternativeName) {
    if (type) return this.entry.alternativeNames[type] ?? this.entry.name;
    return this.entry.name;
  }

  setName(...p: [string | undefined] | [AlternativeName, string | undefined]) {
    this.entry.setName(...p);
  }

  getSize() {
    return this.entry.getSize();
  }

  setSize(size: number) {
    this.entry.setSize(size);
  }

  getValue() {
    return this.entry.getValue();
  }

  setValue(value: number) {
    this.entry.setValue(value);
  }

  getField(address: number | [number, number | undefined | void], sliceAddress?: number) {
    return this.entry.getField(address, sliceAddress);
  }

  setField(
    address: number | [number, number | undefined | void],
    entry: IEntry | RunnerEntry
  ) {
    this.entry.setField(address, RunnerEntry.toEntry(entry));
  }

  setSymbolType(symbolType: string | number) {
    this.entry.setSymbolType(symbolType);
  }

  setType(type: string) {
    this.entry.setType(type);
  }

  clone(opts?: { keepOldId?: boolean }) {
    return new RunnerEntry(this.entry.clone(opts));
  }

  static toEntry(entry: RunnerEntry | IEntry): IEntry {
    if (entry instanceof RunnerEntry) return entry.entry;
    return entry;
  }
}
