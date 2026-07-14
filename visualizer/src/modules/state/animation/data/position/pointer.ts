import { getEntryGap, getEntryHeight, POINTER_GAP, POINTER_HEIGHT } from '../../../const';
import { AnimatedRegion } from '../../plan/animationStateManager';
import { EnrichedSnapshot } from '../normalize/operationSnapshot';
import { PositionManager } from './positionManager';

/**
 * Calculate positions for pointers of a region
 */
export let setPointerPositions = ({
  region,
  operation,
  marginTop,
  positionManager,
  maxAddress
}: {
  marginTop: number;
  region: PointerRegion;
  operation: EnrichedSnapshot;
  positionManager: PositionManager;
  maxAddress: number;
}) =>
  region.pointers
    .reduce(
      (acc, pointer) => {
        let arr = acc[pointer.address] ?? [];
        arr.push(pointer);
        acc[pointer.address] = arr;

        return acc;
      },
      [] as (typeof region.pointers)[]
    )
    .map(pointers => {
      let address = Math.min(pointers[0].address, maxAddress + 1);
      let arrowTop = positionManager.getFullOffsetAtAddress(address);

      return {
        id: String(arrowTop),
        position: { top: arrowTop },
        pointers: pointers
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((pointer, i) => {
            let diff = operation.diff?.pointers.find(([_, p]) => p.id == pointer.id);

            let pointerTop = arrowTop + i * (POINTER_HEIGHT + POINTER_GAP);
            let before = 'before' in pointer ? pointer.before : undefined;
            let beforeTop = before
              ? before.address * (getEntryHeight() + getEntryGap()) + marginTop
              : pointerTop;

            return {
              id: pointer.id,
              name: pointer.name,
              address: pointer.address,
              changed: !!diff,
              version: pointer.version,
              position: {
                top: pointerTop,
                before: beforeTop
              }
            };
          })
      };
    });

export let applyPointerDiffs = (
  region: AnimatedRegion,
  operation: EnrichedSnapshot,
  only?: string[]
) => ({
  ...region,
  pointers: region.pointers.map(pointer => {
    let diff = operation.diff?.pointers.find(
      ([_, p]) => p.id == pointer.id && (!only || only.includes(p.id))
    );

    return diff
      ? {
          ...diff[1],
          before: pointer
        }
      : pointer;
  })
});

export type PointerRegion = ReturnType<typeof applyPointerDiffs>;
