import { useEffect, useRef, useState } from 'react';

export let useDebounce = <T>(value: T, delay: number) => {
  let [debouncedValue, setDebouncedValue] = useState(value);

  let maxWaitToRef = useRef<number | NodeJS.Timeout | null>(null);
  let currentTimeout = useRef<number | NodeJS.Timeout | null>(null);

  useEffect(() => {
    currentTimeout.current = setTimeout(() => {
      setDebouncedValue(value);

      if (maxWaitToRef.current) {
        clearTimeout(maxWaitToRef.current);
        maxWaitToRef.current = null;
      }
    }, delay);

    if (!maxWaitToRef.current) {
      maxWaitToRef.current = setTimeout(() => {
        maxWaitToRef.current = null;
        setDebouncedValue(value);
      }, delay * 3);
    }

    return () => {
      if (currentTimeout.current) clearTimeout(currentTimeout.current);
    };
  }, [value, delay]);

  return [
    debouncedValue,
    (value: T) => {
      if (currentTimeout.current) clearTimeout(currentTimeout.current);
      if (maxWaitToRef.current) clearTimeout(maxWaitToRef.current);
      setDebouncedValue(value);
    }
  ] as const;
};
