import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { findScrollParent } from '../../../lib';
import { useSettings, useVisualizationState } from '../../../state';
import { positionArrows } from '../../lib/arrowPosition';

const ARROW_OFFSET = 60;
const ARROW_SPACING = 25;
const ARROW_INSET = 15;

let Wrapper = styled.div`
  position: relative;
`;

let Arrow = styled.div`
  position: absolute;

  width: 4px;
  background: var(--color);

  &.top-arrow {
    &::before {
      content: '';
      position: absolute;
      top: -3px;
      left: -8px;
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-bottom: 10px solid var(--color);
    }
  }

  &.bottom-arrow {
    &::before {
      content: '';
      position: absolute;
      bottom: -3px;
      left: -8px;
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid var(--color);
    }
  }
`;

export let JumpArrows = () => {
  let {
    operationState: { jumpInfo }
  } = useVisualizationState();
  let settings = useSettings();

  let arrowsWithoutPositions = useMemo(
    () =>
      jumpInfo.jumpOperations.flatMap(j =>
        j.jumpDestinations.map(d => ({
          source: j.pc,
          destination: d
        }))
      ),
    [jumpInfo]
  );
  let arrows = useMemo(() => positionArrows(arrowsWithoutPositions), [arrowsWithoutPositions]);

  let [arrowsWithElementPositions, setArrowsWithElementPositions] = useState<
    {
      top: number;
      right: number;
      color: string;
      height: number;
      direction: 1 | -1;
      xPosition: number;
      scrollOffset: number;
    }[]
  >([]);

  let refreshPositions = useCallback(() => {
    setArrowsWithElementPositions(
      arrows
        .map(a => {
          let sourceElement = document.querySelector(`[data-pc="${a.source}"]`);
          let destinationElement = document.querySelector(`[data-pc="${a.destination}"]`);
          if (!sourceElement || !destinationElement) return undefined!;

          let scrollParent = findScrollParent(sourceElement!) as Element;
          let scrollOffset = scrollParent.scrollTop ?? 0;

          let direction: 1 | -1 = a.source < a.destination ? 1 : -1;

          let sourcePosition = sourceElement?.getBoundingClientRect();
          let destinationPosition = destinationElement?.getBoundingClientRect();

          let right = ARROW_OFFSET + ARROW_SPACING * a.xPosition;

          let top = 0;
          let height = 0;

          if (direction === 1) {
            top = scrollOffset + (sourcePosition?.top ?? 0) + (sourcePosition?.height ?? 0);
            height =
              (destinationPosition?.top ?? 0) -
              (sourcePosition?.top ?? 0) -
              (sourcePosition?.height ?? 0);
          } else {
            top =
              scrollOffset +
              (destinationPosition?.top ?? 0) +
              (destinationPosition?.height ?? 0);
            height =
              (sourcePosition?.top ?? 0) -
              (destinationPosition?.top ?? 0) -
              (destinationPosition?.height ?? 0);
          }

          top -= ARROW_INSET;
          height += ARROW_INSET * 2;

          return {
            top,
            right,
            height,

            direction,
            scrollOffset,
            color: a.color,
            xPosition: a.xPosition
          };
        })
        .filter(a => a !== undefined)
    );
  }, [arrows]);

  useEffect(() => {
    refreshPositions();
    setTimeout(refreshPositions, 100);
    setTimeout(refreshPositions, 300 * settings.animationMultiplier);
    setTimeout(refreshPositions, 600 * settings.animationMultiplier);
  }, [refreshPositions, settings.animationMultiplier, settings.codeBarWidth]);

  return (
    <Wrapper>
      {arrowsWithElementPositions.map((a, i) => (
        <Arrow
          key={i}
          style={{
            height: a.height,
            right: a.right,
            top: a.top,
            zIndex: 250,

            // @ts-ignore
            '--color': a.color
          }}
          className={clsx({
            'top-arrow': a.direction === -1,
            'bottom-arrow': a.direction === 1
          })}
        />
      ))}
    </Wrapper>
  );
};
