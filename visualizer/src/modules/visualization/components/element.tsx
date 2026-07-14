import { useEffect, useRef } from 'react';
import styled from 'styled-components';

let Wrapper = styled.div`
  *:not(.tag):not(.popover) {
    position: unset !important;
  }
`;

export let Element = ({
  element,
  style
}: {
  element?: HTMLElement | null;
  style?: React.CSSProperties;
}) => {
  let ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!element || !ref.current) return;

    let clone = element.cloneNode(true) as HTMLElement;
    if (!clone) return;

    clone.dataset.clone = 'true';
    clone.dataset.entryId = '';
    clone.dataset.regionId = '';

    ref.current.appendChild(clone);
    return () => {
      ref.current?.removeChild(clone);
    };
  }, [element]);

  return <Wrapper ref={ref} style={style} />;
};
