import { delay, smoothScrollIntoViewIfNeeded } from '../../../lib';
import { getCodeBarWidth } from '../../settings';
import { AnimatedEntry } from '../plan/animationStateManager';

export let scrollToEntry = ({
  entry,
  multiplier,
  forceInitial = false,
  withParent = true
}: {
  entry: AnimatedEntry;
  multiplier: number;
  forceInitial?: boolean;
  withParent?: boolean;
}): {
  needsToWaitForElement: boolean;
  performStart: () => Promise<void>;
  performEnd: () => Promise<void>;
} => {
  let focusElement: HTMLElement = document.querySelector(
    `[data-entry-id="${entry.id}"]`
  ) as HTMLElement;

  let performed = false;

  if (!focusElement && !forceInitial) {
    return {
      needsToWaitForElement: true,
      performEnd: async () => {
        await scrollToEntry({
          entry,
          multiplier
        }).performStart();

        // Delay after final element scroll since it looks better
        await delay(200 * multiplier);
      },
      performStart: async () => {
        focusElement = document.querySelector(
          `[data-region-id="${entry.regionId}"]`
        ) as HTMLElement;

        if (focusElement) {
          await smoothScrollIntoViewIfNeeded(focusElement, {
            withParent: false,
            duration: 200 * multiplier,
            offset: { left: getCodeBarWidth() + 50, top: 50 }
          });
        }
      }
    };
  }

  let performFull = async () => {
    if (performed) return;
    performed = true;

    if (!forceInitial) {
      for (let i = 0; !focusElement && i < 10; i++) {
        focusElement = document.querySelector(`[data-entry-id="${entry.id}"]`) as HTMLElement;
        await delay(50 * multiplier);
      }
    }

    if (!focusElement) {
      focusElement = document.querySelector(
        `[data-region-id="${entry.regionId}"]`
      ) as HTMLElement;
    }

    if (focusElement) {
      await smoothScrollIntoViewIfNeeded(focusElement, {
        withParent,
        duration: 300 * multiplier,
        offset: { left: getCodeBarWidth() + 50, top: 50 }
      });
    }
  };

  return {
    performStart: forceInitial ? async () => {} : performFull,
    performEnd: forceInitial ? performFull : async () => {},
    needsToWaitForElement: !focusElement
  };
};
