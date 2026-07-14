import { getEntryGap, getEntryHeight } from '../../../const';

export class PositionManager {
  #nextOffset = 0;
  #lastAddress = 0;
  #addressOffset: number[][] = [];
  #lock = 0;

  constructor(public readonly margin: number) {
    this.#nextOffset = margin;
  }

  private getOffsetAndAddress(address: number, slice: number = -1) {
    if (address <= 0) return { offset: this.margin, address: 0 };

    for (let i = address; i >= 0; i--) {
      let addr = this.#addressOffset[i];

      if (addr?.length) {
        for (let j = slice - 1; j >= 0; j--) {
          if (typeof addr[j] == 'number') {
            return { offset: addr[j], address: i };
          }
        }
      }

      slice = this.#addressOffset[i - 1]?.length || 1;
    }

    return { offset: this.margin, address: this.#lastAddress };
  }

  getOffsetAtAddress(address: number, slice: number = -1) {
    return this.getOffsetAndAddress(address, slice).offset;
  }

  getFullOffsetAtAddress(address: number, slice: number = -1) {
    let { offset, address: addr } = this.getOffsetAndAddress(address, slice);
    let diff = Math.max(0, address - addr - 1);

    return offset + diff * (getEntryHeight() + getEntryGap());
  }

  get nextOffset() {
    return this.#nextOffset;
  }

  private getLockManager() {
    let lock = ++this.#lock;
    return { check: () => lock == this.#lock };
  }

  add({ main: address, slice }: { main: number; slice: number }) {
    let lock = this.getLockManager();

    let initialOffset = this.getOffsetAtAddress(address, slice);

    let prevLast = this.#lastAddress;
    // this.#lastAddress = Math.max(this.#lastAddress, address);
    this.#lastAddress = this.#lastAddress + 1;

    let differenceBetween = this.#lastAddress - prevLast;
    initialOffset += Math.max(0, differenceBetween - 1) * (getEntryHeight() + getEntryGap());

    let offsetBefore = 0;
    let current = 0;
    let size = 1;

    let set = (diff: number) => {
      current += diff;

      if (lock.check()) {
        this.#nextOffset = initialOffset + current;

        if (!this.#addressOffset[address]) this.#addressOffset[address] = [];
        this.#addressOffset[address][slice] = this.#nextOffset;

        for (let i = 0; i < address; i++) {
          if (!this.#addressOffset[i]) this.#addressOffset[i] = [initialOffset];
        }
      }

      return diff;
    };

    return {
      offset: initialOffset,
      addOffsetBefore: (added: number) => {
        offsetBefore += set(added);
      },
      addOffsetAfter: (added: number) => set(added),
      setSize: (size_: number) => {
        size = size_;
        set(size_);
      },
      get position() {
        return { offset: initialOffset + offsetBefore, size };
      }
    };
  }
}
