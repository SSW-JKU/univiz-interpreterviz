import { useState } from 'react';
import { useAutoRef } from './useAutoRef';

export let useRefState = <S>(p: S | (() => S)) => {
  let [state, setState] = useState(p);
  let ref = useAutoRef(state);

  return [state, setState, ref] as const;
};
