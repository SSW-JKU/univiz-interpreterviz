import { useEffect, useState } from 'react';

export let useMemoIfNotNullish = <T>(cb: () => T | null | undefined, deps: any[]) => {
  let [value, setValue] = useState(() => cb());

  useEffect(() => {
    let newValue = cb();
    if (newValue !== null && newValue !== undefined) {
      setValue(newValue);
    }
  }, deps);

  return value;
};
