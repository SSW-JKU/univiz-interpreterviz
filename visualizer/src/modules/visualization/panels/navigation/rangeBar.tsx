import { Button, Slider, Tooltip } from '@radix-ui/themes';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDebounce, useRefState } from '../../../lib';
import { useVisualizationState } from '../../../state';

let Wrapper = styled(motion.nav)`
  position: fixed;
  bottom: 15px;
  left: 0;
  right: 0;
  z-index: 9997;
  display: flex;
  justify-content: center;
  isolation: isolate;
`;

let Inner = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0px;
  margin: 0 auto;
  padding: 10px;
  background: rgba(240, 240, 240, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.1);
  height: 50px;
`;

export let RangeBar = () => {
  let { operationState, animationState } = useVisualizationState();

  let debounceTime = 100;

  let max = operationState.operationCount;
  let range = operationState.operationIndex;
  let setRange = operationState.setOperationIndex;

  let [localRange, setLocalRange, localRangeRef] = useRefState(() => range);
  let [debouncedRange, setDebouncedRange] = useDebounce(localRange, debounceTime);

  let [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (range != localRangeRef.current && !isDragging) {
      setLocalRange(range);
      setDebouncedRange(range);
    }
  }, [range]);

  useEffect(() => {
    if (range != debouncedRange) setRange(debouncedRange);
  }, [debouncedRange]);

  return (
    <AnimatePresence>
      <Wrapper
        initial={{ opacity: 0, y: 50, scale: 0.7 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.7 }}
        transition={{ delay: 0.25 }}
      >
        <Inner animate={{ width: animationState.playingUntil ? 500 : 700 }}>
          <AnimatePresence>
            {!animationState.playingUntil && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
              >
                <Tooltip content="Go back one step">
                  <Button
                    onClick={async () => {
                      await animationState.waitUntilNotAnimating();

                      let val = Math.max(0, range - 1);
                      setLocalRange(val);
                      setDebouncedRange(val);
                    }}
                    disabled={range == 0}
                  >
                    Previous
                  </Button>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ flex: 1, padding: '0px 10px' }}>
            <Slider
              variant="soft"
              value={[localRange]}
              min={0}
              max={max}
              aria-readonly={animationState.playingUntil}
              onValueChange={async value => {
                if (animationState.playingUntil) return;

                await animationState.waitUntilNotAnimating();
                setLocalRange(value[0]);
              }}
              onPointerDown={() => setIsDragging(true)}
              onPointerUp={() => setIsDragging(false)}
            />
          </div>

          <AnimatePresence>
            {!animationState.playingUntil && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
              >
                <Tooltip content="Go forward one step">
                  <Button
                    onClick={async () => {
                      await animationState.waitUntilNotAnimating();

                      let val = Math.min(max, range + 1);
                      setLocalRange(val);
                      setDebouncedRange(val);
                    }}
                    disabled={range == max}
                  >
                    Next
                  </Button>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </Inner>
      </Wrapper>
    </AnimatePresence>
  );
};
