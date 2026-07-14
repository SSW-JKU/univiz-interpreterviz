import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Position } from '../dom/getGlobalPositionOfElement';
import { listenToPosition } from '../dom/listenToSize';
import { combineUnsubscribes } from '../utils/combineUnsubscribes';

export let useMeasureElements = (elementInput: HTMLElement[] | HTMLElement | null) => {
  let elements = useMemo(
    () =>
      elementInput == null
        ? null
        : Array.isArray(elementInput)
          ? elementInput
          : [elementInput],
    [elementInput]
  );

  let measurementsRef = useRef<(Position & { rect: DOMRectReadOnly })[] | null>(null);
  let [measurements, setMeasurements] = useState<
    (Position & { rect: DOMRectReadOnly })[] | null
  >(null);

  useLayoutEffect(() => {
    if (!elements) return;

    let res = elements.map((el, i) =>
      listenToPosition(el, p => {
        if (p.x <= 0 || p.y <= 0) return;

        if (!measurementsRef.current) measurementsRef.current = [];
        measurementsRef.current[i] = p;

        setMeasurements(sp => {
          let newSp = sp ? [...sp] : [];
          newSp[i] = p;
          return newSp;
        });
      })
    );

    return combineUnsubscribes(res.map(u => u.disconnect));
  }, [elements]);

  return {
    position: measurements,
    rects: useMemo(() => measurements?.map(m => m.rect), [measurements])
  };
};
