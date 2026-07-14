import { useEffect, useState } from 'react';
import { useRefState } from '../../../lib';
import { OperationSnapshot } from '../../../run-manager';

export let useAnimationSnapshot = (_os: OperationSnapshot | null) => {
  let [os, setOS] = useState(() => _os);
  let [index, setIndex, indexRef] = useRefState(0);

  useEffect(() => {
    // Reset index when operation snapshot changes
    setIndex(0);
    setOS(_os);
  }, [_os]);

  return { os, index, setIndex, indexRef };
};

export type AnimationSnapshotState = ReturnType<typeof useAnimationSnapshot>;
