import { useCallback, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useSyncedState } from '../../../lib';
import { useSettings } from '../../../state';

let ResizeBarItem = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  width: 6px;
  background: #1e90ff;
  opacity: 0;
  z-index: 300;
  cursor: col-resize;
  transition: opacity 0.3s ease;

  &:hover,
  &:active,
  &:focus {
    opacity: 0.7;
  }
`;

let DraggingGlobal = createGlobalStyle`
  body, * {
    user-select: none;
    cursor: col-resize !important;
  }
`;

export let CodeResizeBar = () => {
  let { codeBarWidth, setCodeBarWidth } = useSettings();
  let [current, setCurrent, currentRef] = useSyncedState(codeBarWidth);
  let [dragging, setDragging] = useState(false);

  let onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);

    let startX = e.clientX;
    let startWidth = currentRef.current;

    let onMouseMove = (e: MouseEvent) => {
      let diff = e.clientX - startX;
      let newWidth = Math.max(250, Math.min(600, startWidth + diff));

      setCurrent(newWidth);
    };

    let onMouseUp = () => {
      setCodeBarWidth(currentRef.current);
      setDragging(false);

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <>
      {dragging && <DraggingGlobal />}
      <ResizeBarItem style={{ left: current }} onMouseDown={onMouseDown} />
    </>
  );
};
