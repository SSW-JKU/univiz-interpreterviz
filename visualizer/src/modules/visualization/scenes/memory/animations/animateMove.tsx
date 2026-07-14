import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  delay,
  listenToPosition,
  listenToRect,
  Position,
  useFullyUnmounted,
  useRefState
} from '../../../../lib';
import { Element } from '../../../components/element';
import { Overlay } from '../../../components/overlay';
import { IsGlobalProvider } from '../entry/wrapper';

type State = 'idle' | 'hide_source' | 'move' | 'show_destination' | 'end';
let getStateIndex = (state: State) => {
  switch (state) {
    case 'idle':
      return 0;
    case 'hide_source':
      return 1;
    case 'move':
      return 2;
    case 'show_destination':
      return 3;
    case 'end':
      return 4;
  }
};

export let AnimateMove = ({
  children,
  sourceElementSelector,
  durationMultiplier,
  mode = 'move'
}: {
  children: React.ReactNode;
  sourceElementSelector: string;
  durationMultiplier: number;
  mode?: 'move' | 'copy';
}) => {
  let [destinationElement, setDestinationElement] = useState<HTMLElement | null>(null);
  let [sourceElement, setSourceElement, sourceElementRef] = useRefState<HTMLElement | null>(
    null
  );

  let [destinationElementPosition, setDestinationElementPosition] = useState<Position | null>(
    null
  );
  let [sourceElementPosition, setSourceElementPosition] = useState<Position | null>(null);
  let [sourceElementRect, setSourceElementRect] = useState<DOMRectReadOnly | null>(null);

  let [state, setState, stateRef] = useRefState<State>('idle');

  useEffect(
    () => listenToPosition(destinationElement!, setDestinationElementPosition).disconnect,
    [destinationElement]
  );
  useEffect(
    () =>
      listenToPosition(sourceElement!, p => {
        if (getStateIndex(stateRef.current) <= 2) setSourceElementPosition(p);
      }).disconnect,
    [sourceElement]
  );
  useEffect(
    () =>
      listenToRect(sourceElement!, p => {
        if (getStateIndex(stateRef.current) <= 2) setSourceElementRect(p);
      }).disconnect,
    [sourceElement]
  );

  useEffect(() => {
    let el = document.querySelector(sourceElementSelector);
    if (el) setSourceElement(el as HTMLElement);
  }, [sourceElementSelector]);

  useEffect(() => {
    if (!sourceElementPosition || !destinationElementPosition) return;

    (async () => {
      if (mode == 'copy') {
        await delay(100 * durationMultiplier);
      } else {
        setState('hide_source');
        setTimeout(() => {
          sourceElement!.style.transition = `opacity ${0.2 * durationMultiplier}s ease`;
          sourceElement!.style.opacity = '0';
        }, 50);
        await delay(200 * durationMultiplier);
      }

      setState('move');
      await delay(400 * durationMultiplier);

      setState('show_destination');

      await delay(200 * durationMultiplier);
      setState('end');
    })().catch(console.error);
  }, [sourceElementPosition, destinationElementPosition]);

  useFullyUnmounted(() => {
    if (sourceElementRef.current) {
      sourceElementRef.current.style.opacity = '1';
    }
  });

  let duration = 0.35 * durationMultiplier;

  return (
    <>
      <div
        ref={el => setDestinationElement(el)}
        style={{ opacity: state == 'show_destination' || state == 'end' ? 1 : 0 }}
      >
        {children}
      </div>

      {destinationElementPosition &&
        sourceElementPosition &&
        sourceElementRect &&
        state != 'idle' &&
        state != 'end' && (
          <Overlay>
            <IsGlobalProvider>
              <motion.div
                style={{
                  width: sourceElementRect.width,
                  height: sourceElementRect.height,
                  position: 'absolute'
                }}
                initial={{ top: sourceElementPosition.y, left: sourceElementPosition.x }}
                animate={
                  state == 'show_destination'
                    ? {
                        opacity: 1,
                        top: destinationElementPosition.y,
                        left: destinationElementPosition.x
                      }
                    : state == 'hide_source'
                      ? { top: sourceElementPosition.y, left: sourceElementPosition.x }
                      : {
                          top: destinationElementPosition.y,
                          left: destinationElementPosition.x
                        }
                }
                transition={{ duration }}
              >
                <div style={{ position: 'relative' }}>
                  <motion.div
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: duration - 0.2, delay: 0.2, ease: 'linear' }}
                  >
                    <Element element={sourceElement} />
                  </motion.div>
                  <motion.div
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: duration - 0.2 - 0.1, delay: 0.2, ease: 'linear' }}
                  >
                    {children}
                  </motion.div>
                </div>
              </motion.div>
            </IsGlobalProvider>
          </Overlay>
        )}
    </>
  );
};

export let AnimateCopy = (props: Omit<Parameters<typeof AnimateMove>[0], 'mode'>) => (
  <AnimateMove {...props} mode="copy" />
);
