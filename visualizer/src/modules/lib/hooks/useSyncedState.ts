import { useLayoutEffect, useRef, useState } from 'react';

export let useSyncedState = <S>(state: S) => {
  let [value, setValue] = useState(state);
  let valueRef = useRef(value);
  valueRef.current = value;

  useLayoutEffect(() => {
    setValue(state);
    valueRef.current = state;
  }, [state]);

  return [valueRef.current, setValue, valueRef] as const;
};
