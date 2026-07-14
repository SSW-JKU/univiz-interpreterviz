import React, { useCallback, useEffect, useState } from 'react';

export let useIsScrollable = (ref: React.RefObject<HTMLElement | null | undefined>) => {
  let [isScrollable, setIsScrollable] = useState(false);

  let checkIfScrollable = useCallback(() => {
    if (ref.current) {
      let { scrollHeight, clientHeight } = ref.current;
      setIsScrollable(scrollHeight > clientHeight);
    }
  }, [ref]);

  useEffect(() => {
    if (!ref.current) return;

    checkIfScrollable();

    let resizeObserver = new ResizeObserver(checkIfScrollable);
    resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, [ref, checkIfScrollable]);

  return isScrollable;
};
