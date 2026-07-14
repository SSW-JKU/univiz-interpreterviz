import { AnimatePresence, motion } from 'framer-motion';
import { Fragment, useEffect, useState } from 'react';
import { ArrowRight } from 'react-feather';
import styled from 'styled-components';
import {
  POINTER_HEIGHT,
  RegionEntryState,
  useSettings,
  useVisualizationState
} from '../../../../state';
import { AnchorAtPosition } from '../../../components/anchor';
import { useRegionState } from './state';

let Pointer = styled(motion.div)`
  position: absolute;
  display: flex;
  gap: 0px;
  z-index: 200;
  transform: translateX(-100%);
`;

let PointerItem = styled(motion.div)`
  padding: 0px 6px;
  font-weight: 600;
  border-radius: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  height: ${POINTER_HEIGHT}px;
  width: 100px;
`;

export let RegionPointers = ({
  region,
  expandedKey
}: {
  region: RegionEntryState;
  expandedKey: string;
}) => {
  {
    let { currentRegion, setCurrentRegion, blanketOpen, animationMultiplier } =
      useRegionState();

    let {
      animationState: { currentStep, finished }
    } = useVisualizationState();

    let { hidePointers } = useSettings();

    let isCurrentRegion = currentRegion == region.id;
    let hasChanged = region.flags.pointersChanged;
    let showPointers = !blanketOpen && (isCurrentRegion || hasChanged);

    let pointerDelay = 2;

    let [pointersReady, setPointersReady] = useState(false);
    useEffect(() => {
      setTimeout(() => setPointersReady(true), 2000);
    }, []);

    let pointers = region.pointers.before;
    // currentStep.animation?.type == 'update-pointers'
    //   ? region.pointers.after
    //   : region.pointers.before;

    let animation = currentStep.animation;
    if (animation?.type == 'update-pointers') {
      let pointerStateIndex = animation.pointerState[region.id];

      if (pointerStateIndex !== undefined) {
        let newPointers = region.pointers.pointersAfterSnapshots?.[pointerStateIndex];
        if (newPointers) pointers = newPointers;
      }
    }

    let seenKeys = new Set<string>();

    return (
      <AnimatePresence>
        {pointersReady &&
          (showPointers || hidePointers) &&
          pointers.map(pointer => {
            if (seenKeys.has(pointer.id)) return null;
            seenKeys.add(pointer.id);

            return (
              <Fragment key={pointer.id}>
                {showPointers &&
                  pointer.pointers.map(pointer => {
                    let direction =
                      pointer.position.top == pointer.position.before
                        ? 0
                        : pointer.position.top < pointer.position.before
                          ? -1
                          : 1;

                    return (
                      <AnchorAtPosition
                        key={`anc-${pointer.id}-${pointer.version}`}
                        position={{
                          y: pointer.position.top,
                          x: -30
                        }}
                        reference={[expandedKey]}
                      >
                        <PointerItem
                          key={`${pointer.id}-${pointer.version}`}
                          initial={{
                            opacity: 0,
                            y: direction == 0 ? '-50%' : direction == -1 ? 30 : -30,
                            scale: 0.5,
                            x: '-50%'
                          }}
                          animate={{
                            opacity: 1,
                            y: '-50%',
                            scale: 1,
                            x: '-50%'
                          }}
                          exit={{
                            opacity: 0,
                            y: '-50%',
                            scale: 1.2,
                            x: '-50%',
                            transition: { delay: 0, ease: 'easeOut' }
                          }}
                          transition={{
                            duration: 0.2 * (hasChanged ? animationMultiplier : 1),
                            delay:
                              (blanketOpen ||
                              (currentStep.animation?.type == 'update-pointers' && !finished)
                                ? 0
                                : pointerDelay++ * 0.1) *
                              (hasChanged ? animationMultiplier : 1)
                          }}
                          style={
                            pointer.changed
                              ? {
                                  outline: '2px solid #f201ff',
                                  background: '#fcc9ff',
                                  color: '#000'
                                }
                              : {
                                  outline: '1px solid #444',
                                  background: '#222',
                                  color: '#fff'
                                }
                          }
                        >
                          {pointer.name} [{pointer.address}]
                        </PointerItem>
                      </AnchorAtPosition>
                    );
                  })}

                <AnchorAtPosition
                  // key={`anc-${pointer.id}`}
                  position={{
                    y: pointer.position.top,
                    x: -25
                  }}
                  reference={[expandedKey]}
                >
                  <Pointer
                    key={pointer.id}
                    initial={{
                      opacity: 0,
                      y: '-50%',
                      x: -20
                    }}
                    animate={{
                      opacity: 1,
                      y: '-50%',
                      x: 0,
                      transition: { delay: blanketOpen ? 0 : pointerDelay++ * 0.1 }
                    }}
                    exit={{
                      opacity: 0,
                      y: '-50%',
                      x: 10,
                      transition: { ease: 'easeOut' }
                    }}
                    onMouseEnter={() => {
                      setCurrentRegion(region.id);
                    }}
                    onMouseLeave={() => {
                      setCurrentRegion(undefined);
                    }}
                  >
                    <ArrowRight size={24} />
                  </Pointer>
                </AnchorAtPosition>
              </Fragment>
            );
          })}
      </AnimatePresence>
    );
  }
};
