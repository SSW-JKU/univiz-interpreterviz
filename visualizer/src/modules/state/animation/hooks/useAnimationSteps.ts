import { useMemo } from 'react';
import { OperationSnapshot } from '../../../run-manager';
import { useSettings } from '../../settings';
import { getEnrichedOperationSnapshot } from '../data/normalize/operationSnapshot';
import { setPositions } from '../data/position/region';
import { getAnimatedRegionWithSymbolInfo } from '../data/symbolInfo';
import { getAnimationPlan } from '../plan/animationPlan';
import { applyAnimations } from '../plan/applyAnimation';
import { useExpanded } from './useExpanded';

export let useAnimationSteps = (os: OperationSnapshot | null) => {
  let {
    animationMultiplier,
    entrySize,
    regionWidth,
    collapseStructureSize,
    collapseStructures
  } = useSettings();

  let [expanded] = useExpanded();

  // Add full entries and pointers to regions
  let enrichedSnapshot = useMemo(() => (os ? getEnrichedOperationSnapshot(os) : null), [os]);

  return useMemo(() => {
    // Plan animations for operation snapshot diff
    let animationPlan = enrichedSnapshot ? getAnimationPlan(enrichedSnapshot) : [];
    let regions = enrichedSnapshot?.previousOperationSnapshot.regions ?? [];

    // Apply animation states to individual entries
    let animatedStates = applyAnimations(
      enrichedSnapshot,
      regions,
      animationPlan,
      animationMultiplier
    );

    // Set positions for
    let positionedStates = animatedStates.map(s => ({
      ...s,
      before: s.before.map((r, i) =>
        setPositions(
          getAnimatedRegionWithSymbolInfo(r, enrichedSnapshot!),
          enrichedSnapshot!,
          { expanded, index: i }
        )
      ),
      after: s.after.map((r, i) =>
        setPositions(
          getAnimatedRegionWithSymbolInfo(r, enrichedSnapshot!),
          enrichedSnapshot!,
          { expanded, index: i }
        )
      )
    }));

    return positionedStates;
  }, [
    enrichedSnapshot,
    entrySize,
    collapseStructureSize,
    collapseStructures,
    expanded,
    regionWidth
  ]);
};

export type AnimationSteps = ReturnType<typeof useAnimationSteps>;
export type AnimationStep = AnimationSteps[number];
