import { customAlphabet } from 'nanoid';

let nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 15);

let counter = 0;
let orderedId = (prefix: string) => `${prefix}_${(counter++).toString(36).padStart(10, '0')}`;

let idMap = new Map<string, string>();

export let idFactory = <Prefixes extends { [key: string]: string }>(prefixes: Prefixes) =>
  Object.fromEntries(
    Object.entries(prefixes).map(([key, prefix]) => [
      key,
      {
        generate: () => orderedId(prefix),
        generateFrom: (id: string | number) => {
          let hash = `${prefix}_${id}`;
          if (idMap.has(hash)) return idMap.get(hash)!;

          let newId = orderedId(prefix);
          idMap.set(hash, newId);

          return newId;
        },
        generateRandom: () => `${prefix}_${nanoid()}`
      }
    ])
  ) as {
    [K in keyof Prefixes]: {
      generate: () => string;
      generateFrom: (id: string | number) => string;
      generateRandom: () => string;
    };
  };
