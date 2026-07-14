import { useMemo } from 'react';
import { useAutoRef } from './useAutoRef';

export let useRefMemo = <S>(cb: () => S, deps: any[]) => {
  let res = useMemo(cb, deps);
  let ref = useAutoRef(res);

  return [res, ref] as const;
};
