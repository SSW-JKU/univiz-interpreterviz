import { useEffect, useRef } from 'react';

export let useFullyUnmounted = (cb: () => void) => {
  let unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;

    return () => {
      unmounted.current = true;

      setTimeout(() => {
        if (unmounted.current) cb();
      }, 5);
    };
  }, []);
};
