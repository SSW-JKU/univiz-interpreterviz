import { OperationState } from '../operation';
import { useAnimationPlayState } from './hooks/useAnimationPlayState';
import { useAnimationSnapshot } from './hooks/useAnimationSnapshot';
import { useAnimationSteps } from './hooks/useAnimationSteps';

export let useAnimationState = (operationState: OperationState) => {
  let currentSnapshot = operationState.currentOperation;

  let snap = useAnimationSnapshot(currentSnapshot);
  let animationSteps = useAnimationSteps(snap.os);

  let result = useAnimationPlayState(operationState, animationSteps, snap);

  return result;
};

export type AnimationState = ReturnType<typeof useAnimationState>;
