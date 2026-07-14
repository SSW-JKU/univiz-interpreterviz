import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { delay, useAutoRef, useRefState } from '../../../lib';
import { OperationState } from '../../operation';
import { useSettings } from '../../settings';
import { scrollToEntry } from '../lib/scrollToEntry';
import { useAnimationBar } from './useAnimationBar';
import { AnimationSnapshotState } from './useAnimationSnapshot';
import { AnimationSteps } from './useAnimationSteps';

export let useAnimationPlayState = (
  operationState: OperationState,
  animationSteps: AnimationSteps,
  { index, setIndex, indexRef }: AnimationSnapshotState
) => {
  let [animationBarState, animationBarStateRef] = useAnimationBar(animationSteps, index);
  let settings = useSettings();

  let animationStepsRef = useAutoRef(animationSteps);

  // Animation state
  let [paused, setPaused, pausedRef] = useRefState(false);
  let [autoPlay, setAutoPlay, autoPlayRef] = useRefState(true);
  let [animating, setAnimating, animatingRef] = useRefState(false);
  let [finished, setFinished] = useState(false);

  let [playUntilOperationIndex, setPlayUntilOperationIndex, playUntilOperationIndexRef] =
    useRefState<number | null>(null);

  // Iterate through animation states
  let continueAnimation = async (index: number, until?: number) => {
    if (pausedRef.current) return;

    setAnimating(true);

    index = index % animationStepsRef.current.length;
    let animation = animationStepsRef.current[index];

    // Scroll to focussed entry
    let scrollPromise =
      animation.focussedEntry && autoPlayRef.current
        ? scrollToEntry({
            entry: animation.focussedEntry,
            multiplier: settings.animationMultiplier
          })
        : undefined;

    if (!(animation.focussedEntry as any)?.fieldRegionEntryId) {
      // If the element is already in the viewport,
      // we can wait for the scroll to finish before continuing
      await scrollPromise?.performStart(); // NOT NEEDED ANYMORE
    }

    // // Sight delay after scrolling so that measurements
    // // for elements, e.g., for move animations can update
    await delay(100 * settings.animationMultiplier);

    // Tell react to perform the animation and wait for it to finish
    setIndex(index);
    await delay(animation.duration);

    // If the element was not in the viewport before
    // we still need to wait for the scroll to finish
    await scrollPromise?.performEnd();

    setAnimating(false);

    // Continue to next animation state
    let nextIndex = index + 1;
    if (
      (autoPlayRef.current || (until && nextIndex <= until)) &&
      nextIndex < animationStepsRef.current.length
    ) {
      continueAnimation(nextIndex, until);
    }
  };

  // Reset animation state when operation snapshot changes
  useEffect(() => {
    if (animatingRef.current) return;

    setAutoPlay(true);
    setPaused(false);

    setTimeout(() => continueAnimation(0), 50);
  }, [operationState.operationIndex]);

  let [aborting, setAborting] = useState(false);
  useEffect(() => {
    if (finished) setAborting(false);
  }, [finished]);
  let waitUntilNotAnimating = useCallback(
    () =>
      new Promise<void>(r => {
        setAutoPlay(false);
        setAborting(true);

        if (!animatingRef.current) return r();

        let interval = setInterval(() => {
          if (!animatingRef.current) {
            clearInterval(interval);
            r();
          }
        }, 50);
      }),
    []
  );

  let finishedTORef = useRef<number | NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (index < animationSteps.length - 1) {
      setFinished(false);
      if (finishedTORef.current) clearTimeout(finishedTORef.current);
    } else {
      finishedTORef.current = setTimeout(
        () => setFinished(true),
        animationSteps[index]?.duration ?? 0
      );
    }

    return () => {
      if (finishedTORef.current) clearTimeout(finishedTORef.current);
    };
  }, [index, animationSteps]);

  useEffect(() => {
    if (playUntilOperationIndex == null) return;

    if (
      operationState.operationIndex >= playUntilOperationIndex ||
      playUntilOperationIndex >= operationState.operationCount
    ) {
      setTimeout(() => setPlayUntilOperationIndex(null), 20);
    }
  }, [playUntilOperationIndex, operationState.operationIndex]);

  useEffect(() => {
    if (playUntilOperationIndex == null || !finished) return;

    setTimeout(() => {
      if (playUntilOperationIndexRef.current == null) return;
      operationState.nextOperation();
    }, 1000 * settings.animationMultiplier);
  }, [finished, playUntilOperationIndex]);

  let currentOperationIndexRef = useAutoRef(operationState.operationIndex);
  let playUntil = useCallback(async (opts: { lineNumber: number; pc?: number }) => {
    let op = await operationState.getOperationAtLineAndPC(opts);
    if (!op) return;

    if (op.index <= currentOperationIndexRef.current) {
      toast.error('Cannot play until a previous operation');
      return;
    }

    setPlayUntilOperationIndex(op.index);
    setAutoPlay(true);
    setPaused(false);
  }, []);
  let abortPlayUntil = useCallback(() => setPlayUntilOperationIndex(null), []);

  let canPlayUntil = useCallback(
    async (opts: { lineNumber: number; pc?: number }) => {
      if (playUntilOperationIndex != null) return false;

      let op = await operationState.getOperationAtLineAndPC(opts);
      return !!(op && op.index > currentOperationIndexRef.current);
    },
    [playUntilOperationIndex]
  );

  let canJumpTo = useCallback(
    async (opts: { lineNumber: number; pc?: number }) => {
      if (playUntilOperationIndex != null) return false;

      let op = await operationState.getOperationAtLineAndPC(opts);
      return !!op;
    },
    [playUntilOperationIndex]
  );

  let pause = useCallback(() => setPaused(true), []);
  let resume = useCallback(() => {
    setAborting(false);
    setPaused(false);
    setTimeout(() => continueAnimation(indexRef.current + 1), 20);
  }, []);
  let restart = useCallback(async () => {
    setAborting(false);
    setPaused(false);
    setAutoPlay(true);
    setTimeout(() => continueAnimation(0), 20);
  }, []);
  let next = useCallback(() => {
    setAborting(false);
    setPaused(false);
    setAutoPlay(false);
    setTimeout(() => {
      let isFinal = indexRef.current == animationStepsRef.current.length - 1;
      let nextIndex = (indexRef.current + 1) % animationStepsRef.current.length;

      let hasBarState = animationBarStateRef.current.some(s => s.index == nextIndex);
      let hasBarStateAfter = animationBarStateRef.current.some(s => s.index > nextIndex);
      let nextBarState = animationBarStateRef.current.find(s => s.index > nextIndex);

      let until = nextIndex;

      if (!isFinal) {
        if (!hasBarStateAfter) until = animationStepsRef.current.length - 1;
        else if (!hasBarState && nextBarState) until = nextBarState.index;
      }

      continueAnimation(nextIndex, until);
    }, 20);
  }, []);

  let [playingUntil, setPlayingUntil] = useState(false);
  useEffect(() => {
    if (playUntilOperationIndex != null) setPlayingUntil(true);
    if (playUntilOperationIndex == null && playingUntil && finished) setPlayingUntil(false);
  }, [playUntilOperationIndex, finished]);

  return {
    animating,
    animationBarState,
    animationIndex: index,
    currentStep: animationSteps[index],

    paused,
    aborting,
    finished,
    setAutoPlay,
    playingUntil,
    autoPlay: aborting ? true : autoPlay,
    playUntilStopped: playUntilOperationIndex == null,

    waitUntilNotAnimating,

    next,
    pause,
    resume,
    restart,
    playUntil,
    canJumpTo,
    canPlayUntil,
    abortPlayUntil
  };
};
