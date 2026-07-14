import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useMeasureElements, useMemoIfNotNullish } from '../../../../lib';
import { getEntryWidth } from '../../../../state';
import { Overlay } from '../../../components/overlay';
import { IsGlobalProvider } from '../entry/wrapper';

const UNDERLAY_PADDING = 15;
const SOURCE_GAP = 15;
// const OFFSET = -300;

let getOffset = () => -Math.round(getEntryWidth() * 0.8);

let CloneWrapper = styled.div`
  * {
    top: 0 !important;
    left: 0 !important;
  }

  .tag {
    display: none;
  }
`;

let LabelOverlay = styled(motion.div)`
  position: absolute;
  z-index: 700;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
`;

let Label = styled.p`
  padding: 4px 10px;
  background: #45aaf2;
  color: white;
  font-size: 18px;
  font-weight: 700;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.35);
`;

export let AnimateFusion = ({
  children,
  sourceElementSelectors: sourceSelectorsRaw,
  label,
  animationIndex,
  durationMultiplier
}: {
  children: React.ReactNode;
  sourceElementSelectors: string[];
  label: React.ReactNode;
  animationIndex: number;
  durationMultiplier: number;
}) => {
  let sourceElementSelectors = useMemo(
    () => sourceSelectorsRaw,
    [sourceSelectorsRaw.sort().join(',')]
  );

  let [destinationElement, setDestinationElement] = useState<HTMLElement | null>(null);

  let sourceElements = useMemo(
    () =>
      sourceElementSelectors.map(selector => document.querySelector(selector) as HTMLElement),
    [...sourceElementSelectors]
  );

  let { position: destinationElementPosition } = useMeasureElements(destinationElement);
  let { position: sourceElementPositions, rects: sourceElementRects } =
    useMeasureElements(sourceElements);

  let sourceElementClones = useMemo(() => {
    if (!sourceElements || !sourceElementPositions || !sourceElementRects) return;

    return (
      sourceElements
        .map((el, i) => {
          let rect = sourceElementRects[i];
          let position = sourceElementPositions[i];
          if (!el || !rect || !position) {
            return {
              position,
              rect,
              element: <div />
            };
          }

          let clone = el.cloneNode(true) as HTMLElement;

          return {
            position,
            rect,
            element: (
              <CloneWrapper
                style={{
                  width: rect.width,
                  height: rect.height
                }}
                ref={el => {
                  if (el && !el.dataset.appended) {
                    el.dataset.appended = 'true';
                    el.appendChild(clone);
                  }
                }}
              />
            )
          };
        })

        // If position it null, it means the element is not mounted yet.
        // This can happen, and when it does, the sort will throw an error.
        // This is fine and expected as it will tell react to abort the
        // current render. It will try again and it the element is back
        // it will render correctly. This also only affects this component,
        // not the nested framer motion components so the animation will
        // continue to run as expected (this actually is the reason why
        // we want it to throw instead of gracefully handling it).
        .sort((a, b) => a.position.y - b.position.y)
    );
  }, [sourceElements, sourceElementRects, sourceElementPositions]);

  let aggregatedSourceRect = useMemoIfNotNullish(() => {
    if (!sourceElementRects || !sourceElementPositions) return;

    let x = Math.min(...(sourceElementRects ?? []).map(r => r?.x ?? 0).filter(Boolean));
    let y = Math.min(...(sourceElementRects ?? []).map(r => r?.y ?? 0).filter(Boolean));
    if (!isFinite(y) || !isFinite(x)) return;

    let width = Math.max(...(sourceElementRects ?? []).map(r => r?.width ?? 0));

    let bottomY = Math.max(
      ...new Array(sourceElementRects?.length).fill(0).map((_, i) => {
        let rect = sourceElementRects[i];
        let position = sourceElementPositions[i];

        return (position?.y ?? 0) + (rect?.height ?? 0);
      })
    );
    let height = bottomY - y;

    let averageHeight =
      sourceElementRects.reduce((acc, r) => acc + (r?.height ?? 0), 0) /
      sourceElementRects.length;

    return {
      x,
      y,
      width,
      height,
      averageHeight
    };
  }, [sourceElementRects, sourceElementPositions]);

  let labelOverlay = useMemo(
    () =>
      aggregatedSourceRect
        ? {
            top: aggregatedSourceRect.y - UNDERLAY_PADDING,
            left: aggregatedSourceRect.x - UNDERLAY_PADDING + getOffset(),
            width: aggregatedSourceRect.width + UNDERLAY_PADDING * 2,
            height:
              aggregatedSourceRect.height +
              UNDERLAY_PADDING * 2 +
              Math.max(0, SOURCE_GAP * ((sourceElementClones?.length ?? 0) - 1))
          }
        : undefined,
    [aggregatedSourceRect]
  );

  let midPosition = useMemo(() => {
    if (!aggregatedSourceRect) return 100;

    return (
      aggregatedSourceRect.y +
      aggregatedSourceRect.height / 2 -
      aggregatedSourceRect.averageHeight / 2
    );
  }, [aggregatedSourceRect]);

  let [renderAnimatedDestination, setRenderAnimatedDestination] = useState(true);
  let setRenderAnimatedDestinationTO = useRef<number | NodeJS.Timeout | null>(null);
  useEffect(() => {
    clearTimeout(setRenderAnimatedDestinationTO.current!);
    if (animationIndex <= 1) {
      setRenderAnimatedDestination(true);
    } else {
      setRenderAnimatedDestinationTO.current = setTimeout(() => {
        setRenderAnimatedDestination(false);
      }, 500 * durationMultiplier);
    }

    return () => clearTimeout(setRenderAnimatedDestinationTO.current!);
  }, [animationIndex]);

  return (
    <div>
      <div
        ref={el => setDestinationElement(el)}
        style={{
          transition: `opacity ${0.2 * durationMultiplier}s ${0.2 * durationMultiplier}s`,
          opacity: animationIndex <= 1 ? 0 : 1
        }}
      >
        {children}
      </div>

      <Overlay blanket={animationIndex <= 1}>
        {sourceElementClones && (
          <>
            {labelOverlay && animationIndex <= 1 && (
              <LabelOverlay
                style={labelOverlay}
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: animationIndex == 0 ? -10 : 0,
                  y: animationIndex == 0 ? 0 : -60
                }}
                transition={{
                  duration: 0.2 * durationMultiplier,
                  delay: 0.25 * durationMultiplier,
                  y: { delay: 0 },
                  opacity: { delay: 0 }
                }}
              >
                <Label>{label}</Label>
              </LabelOverlay>
            )}

            <IsGlobalProvider>
              {animationIndex <= 1 &&
                sourceElementClones.map(({ element, position }, i) => {
                  return (
                    <motion.div
                      key={i}
                      style={{
                        position: 'absolute',
                        zIndex: 600 + i
                      }}
                      initial={{
                        top: position.y,
                        left: position.x,
                        opacity: 1
                      }}
                      animate={{
                        top: animationIndex == 0 ? position.y + i * SOURCE_GAP : midPosition,
                        left: position.x + getOffset(),
                        opacity: 1
                      }}
                      transition={{ duration: 0.2 * durationMultiplier }}
                    >
                      {element}
                    </motion.div>
                  );
                })}

              {animationIndex >= 1 && renderAnimatedDestination && (
                <motion.div
                  style={{
                    position: 'absolute',
                    zIndex: 700,
                    width: aggregatedSourceRect?.width,
                    height: aggregatedSourceRect?.height
                  }}
                  initial={{
                    top: midPosition,
                    left: (aggregatedSourceRect?.x ?? 0) + getOffset(),
                    opacity: 0
                  }}
                  animate={
                    animationIndex == 1
                      ? {
                          top: midPosition,
                          left: (aggregatedSourceRect?.x ?? 0) + getOffset(),
                          opacity: 1
                        }
                      : {
                          top: destinationElementPosition?.[0].y,
                          left: destinationElementPosition?.[0].x,
                          opacity: 1
                        }
                  }
                  transition={{
                    duration: 0.2 * durationMultiplier,
                    delay: 0.1 * durationMultiplier,
                    opacity: {
                      delay: (animationIndex == 1 ? 0 : 0.6) * durationMultiplier,
                      duration: 0.3 * durationMultiplier
                    }
                  }}
                >
                  {children}
                </motion.div>
              )}
            </IsGlobalProvider>
          </>
        )}
      </Overlay>
    </div>
  );
};
