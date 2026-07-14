import { EnrichedEntry } from '../data/normalize/memory';
import { EnrichedRegion } from '../data/normalize/operationSnapshot';
import { Animation } from './types';

export type RegionAnimation = (
  | { type: 'add'; delay?: number }
  | { type: 'removing' | 'remove' | 'hidden' }
  | { type: 'move-from' | 'copy-from' }
  | { type: 'move-to' | 'copy-to'; fromEntryId: string }
  | { type: 'fusion'; animationIndex: 0 | 1 | 2; inputEntryIds: string[] }
  | { type: 'update-pointers'; pointerState: Record<string, number> }
  | { type: 'modify'; animationIndex: 0 | 1 | 2 }
) & {
  label?: string;
};

export type AnimatedEntry = EnrichedEntry & {
  animation?: RegionAnimation;
};
export type AnimatedRegion = Omit<EnrichedRegion, 'entries'> & { entries: AnimatedEntry[] };

/**
 * Utility to create animation steps
 */
export let animationStateManager = (state: EnrichedRegion[], animation: Animation) => {
  let steps = [
    {
      duration: 0,
      state,
      animation: undefined as RegionAnimation | undefined,
      focussedEntry: undefined as AnimatedEntry | undefined
    }
  ];

  let animateInGroup = () => {
    let step: (typeof steps)[number] | undefined;

    let ensureStep = () => {
      if (!step) {
        step = Object.assign({}, steps[steps.length - 1]);
        steps.push(step);
      }

      return {
        value: step,
        set: (s: Partial<typeof step>) => Object.assign(step!, s)
      };
    };

    let animate = (
      duration: number,
      cb: (state: EnrichedRegion[]) => {
        state: EnrichedRegion[];
        animation?: RegionAnimation;
        focussedEntry?: AnimatedEntry;
      }
    ) => {
      let step = ensureStep();

      let result = cb(step.value.state);
      step.set({
        duration,
        state: result.state,
        animation: result.animation,
        focussedEntry: result.focussedEntry
      });
    };

    let animateUpdatingEntry = (
      duration: number,
      entry: AnimatedEntry,
      { focussedEntry }: { focussedEntry?: AnimatedEntry } = {}
    ) =>
      animate(duration, s => ({
        state: s.map(region => {
          if (region.id != entry.regionId) return region;

          return {
            ...region,
            entries: region.entries.map(e => (e.id == entry.id ? entry : e))
          };
        }),
        animation: entry.animation,
        focussedEntry: duration > 50 ? (focussedEntry ?? entry) : undefined
      }));

    let animateAddingEntry = (
      duration: number,
      entry: AnimatedEntry,
      { focussedEntry }: { focussedEntry?: AnimatedEntry } = {}
    ) =>
      animate(duration, s => ({
        state: s.map(region => {
          if (region.id != entry.regionId) return region;

          return {
            ...region,
            entries: [...region.entries, entry]
          };
        }),
        animation: entry.animation,
        focussedEntry: duration > 50 ? (focussedEntry ?? entry) : undefined
      }));

    let animateRemovingEntry = (
      duration: number,
      entry: AnimatedEntry,
      { focussedEntry }: { focussedEntry?: AnimatedEntry } = {}
    ) =>
      animate(duration, s => ({
        state: s.map(region => {
          if (region.id != entry.regionId) return region;

          return {
            ...region,
            entries: region.entries.filter(e => e.id != entry.id)
          };
        }),
        animation: entry.animation,
        focussedEntry: duration > 50 ? (focussedEntry ?? entry) : undefined
      }));

    return {
      animate,
      animateUpdatingEntry,
      animateAddingEntry,
      animateRemovingEntry
    };
  };

  let animate = (
    duration: number,
    cb: (state: EnrichedRegion[]) => {
      state: EnrichedRegion[];
      animation?: RegionAnimation;
      focussedEntry?: AnimatedEntry;
    }
  ) => animateInGroup().animate(duration, cb);

  let animateUpdatingEntry = (
    duration: number,
    entry: AnimatedEntry,
    { focussedEntry }: { focussedEntry?: AnimatedEntry } = {}
  ) => animateInGroup().animateUpdatingEntry(duration, entry, { focussedEntry });

  let animateAddingEntry = (
    duration: number,
    entry: AnimatedEntry,
    { focussedEntry }: { focussedEntry?: AnimatedEntry } = {}
  ) => animateInGroup().animateAddingEntry(duration, entry, { focussedEntry });

  let animateRemovingEntry = (
    duration: number,
    entry: AnimatedEntry,
    { focussedEntry }: { focussedEntry?: AnimatedEntry } = {}
  ) => animateInGroup().animateRemovingEntry(duration, entry, { focussedEntry });

  return {
    animate,
    animateUpdatingEntry,
    animateAddingEntry,
    animateRemovingEntry,
    animateInGroup,
    wait: (duration: number) => animate(duration, s => ({ state: s })),
    finalize: () => {
      if (steps.length == 1) return [{ before: state, after: state, animation, duration: 0 }];

      let results: {
        duration: number;
        after: AnimatedRegion[];
        before: AnimatedRegion[];
        animation: RegionAnimation | undefined;
        focussedEntry: AnimatedEntry | undefined;
      }[] = [];

      for (let i = 0; i < steps.length - 1; i++) {
        let before = steps[i];
        let after = steps[i + 1];

        results.push({
          after: after.state,
          before: before.state,
          duration: after.duration,
          animation: after.animation,
          focussedEntry: after.focussedEntry
        });
      }

      return results;
    }
  };
};
