import { useEffect, useMemo, useRef, useState } from 'react';
import { usePopper } from 'react-popper';

export let Anchored = ({
  children,
  reference
}: {
  children: React.ReactNode;
  reference?: any[];
}) => {
  let [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  let [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  let { styles, attributes, forceUpdate } = usePopper(referenceElement, popperElement, {
    strategy: 'fixed'
  });

  let nonEmptyReference = useMemo(() => reference ?? [], [reference]);
  let [initialReference] = useState(nonEmptyReference);
  let lastReferenceRef = useRef(initialReference);

  useEffect(() => {
    if (
      nonEmptyReference.length === lastReferenceRef.current.length &&
      nonEmptyReference.every((item, index) => item === lastReferenceRef.current[index])
    )
      return;

    lastReferenceRef.current = nonEmptyReference;

    forceUpdate?.();
  }, [...nonEmptyReference, forceUpdate]);

  return (
    <>
      <div ref={setReferenceElement} style={{ width: 0, height: 0 }} />

      <div
        ref={setPopperElement}
        style={{
          ...styles.popper,
          zIndex: 100
        }}
        {...attributes.popper}
      >
        {children}
      </div>
    </>
  );
};

export let AnchorAtPosition = ({
  children,
  position,
  reference
}: {
  children: React.ReactNode;
  position: { x?: number; y?: number };
  reference?: any[];
}) => {
  return (
    <div style={{ position: 'absolute', left: position.x, top: position.y }}>
      <Anchored reference={reference}>{children}</Anchored>
    </div>
  );
};
