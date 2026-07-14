import { useLayoutEffect, useState } from 'react';
import { createEmitter } from './emitter';
import { IndexedDBManager } from './idbManager';

export type Atom<T> = {
  set: (value: T) => void;
  get: () => T;
  subscribe: (fn: (value: T) => void) => () => void;
  use: () => readonly [T, (value: T) => void];
};

export type ReadOnlyAtom<T> = {
  get: () => T;
  subscribe: (fn: (value: T) => void) => () => void;
  use: () => readonly [T];
};

export let atom = <T>(initialValue: T): Atom<T> => {
  let currentValue = initialValue;
  let listener = createEmitter<T>();

  let set = (value: T) => {
    currentValue = value;

    setTimeout(() => listener.publish(currentValue));
  };

  return {
    set,
    get: () => currentValue,
    subscribe: listener.subscribe,
    use: () => {
      let [value, setValue] = useState(() => currentValue);

      useLayoutEffect(() => {
        return listener.subscribe(setValue);
      }, []);

      return [value, set] as const;
    }
  };
};

let readOnlyAtom = <T>(source: Atom<T>): ReadOnlyAtom<T> => {
  return {
    get: source.get,
    subscribe: source.subscribe,
    use: () => {
      let [value] = source.use();
      return [value] as const;
    }
  };
};

export let computed = <T>(source: Atom<T>, fn: (value: T) => T): ReadOnlyAtom<T> => {
  let value = atom(fn(source.get()));

  source.subscribe(() => value.set(fn(source.get())));

  return readOnlyAtom(value);
};

let kv = new IndexedDBManager('atoms', 'atoms');

export let persistent = <T>(key: string, initialValue: T): Atom<T> => {
  let a = atom<T>(initialValue as T);

  kv.read(key).then(v => {
    if (v !== null) a.set(JSON.parse(v));
  });

  a.subscribe(v => kv.write(key, JSON.stringify(v)));

  return a;
};
