import { useRefMemo } from '../../../lib';
import { AnimationSteps } from './useAnimationSteps';

// State for animation navigation bar
export let useAnimationBar = (animationSteps: AnimationSteps, index: number) =>
  useRefMemo(() => {
    let totalDuration = animationSteps
      .filter((_, i) => i > 0)
      .reduce((a, b) => a + b.duration, 0);

    return animationSteps
      .map((as, i) => ({
        percent: as.duration / totalDuration,
        duration: as.duration,
        index: i,
        label: as.animation?.label,
        status:
          i < index
            ? ('done' as const)
            : i == index
              ? ('active' as const)
              : ('upcoming' as const)
      }))
      .filter((as, i) => i > 0 && as.duration >= 50);
  }, [index, animationSteps]);

export type AnimationBarState = ReturnType<typeof useAnimationBar>[0];
