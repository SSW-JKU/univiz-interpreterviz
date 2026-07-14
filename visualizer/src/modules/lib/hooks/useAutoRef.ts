import { useRef } from 'react';

export let useAutoRef = <S>(v: S) => {
  let ref = useRef(v);
  ref.current = v;

  return ref;
};
