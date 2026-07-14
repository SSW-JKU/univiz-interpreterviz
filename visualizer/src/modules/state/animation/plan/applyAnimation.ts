import { joinStringWithAnd } from '../../../lib';
import { EnrichedRegion, EnrichedSnapshot } from '../data/normalize/operationSnapshot';
import {
  AnimatedEntry,
  AnimatedRegion,
  animationStateManager,
  RegionAnimation
} from './animationStateManager';
import { Animation, AnimationPlan } from './types';

/**
 * Apply animations for an animation plan to the affected entries.
 * @param state current state
 * @param animation animation to apply
 * @returns individual animation steps
 */
let applyAnimation = (state: EnrichedRegion[], animation: Animation) => {
  let manager = animationStateManager(state, animation);

  if (animation.type == 'add') {
    manager.animateAddingEntry(700, {
      ...animation.entry,
      animation: {
        type: 'add',
        label: `Add entry at ${getAddressLabel(animation.entry)} with value ${animation.entry.value}`
      }
    });
  } else if (animation.type == 'remove') {
    manager.animateUpdatingEntry(1000, {
      ...animation.entry,
      animation: {
        type: 'removing',
        label: `Pop entry at ${getAddressLabel(animation.entry)} `
      }
    });

    manager.animateUpdatingEntry(400, {
      ...animation.entry,
      animation: {
        type: 'remove',
        label: `Pop entry at ${getAddressLabel(animation.entry)} `
      }
    });

    manager.animateRemovingEntry(0, animation.entry);
  } else if (animation.type == 'copy' || animation.type == 'move') {
    let type = animation.type;

    let from = animation.from;
    let to = animation.to;

    manager.animateUpdatingEntry(type == 'move' ? 1200 : 1000, {
      ...from,
      animation: {
        type: `${type}-from` as const,
        label: `${type == 'move' ? 'Pop' : 'Select'} entry from ${getAddressLabel(from)}`
      }
    });

    manager.animateAddingEntry(1500, {
      ...to,
      animation: {
        type: `${type}-to` as const,
        fromEntryId: from.id,
        label: `${type == 'move' ? 'Move' : 'Copy'} entry from ${getAddressLabel(from)} to ${getAddressLabel(
          to
        )}`
      }
    });

    if (type == 'move') manager.animateRemovingEntry(0, from);
  } else if (animation.type == 'fusion') {
    let inputEntryIds = animation.inputs.map(e => e.id);

    manager.animateAddingEntry(
      2000,
      {
        ...animation.new,
        animation: {
          type: 'fusion',
          animationIndex: 0,
          inputEntryIds,
          label: `Apply ${animation.operation.operation?.name} to ${joinStringWithAnd(
            animation.inputs.map(i => i.value)
          )}`
        }
      },
      { focussedEntry: animation.new }
    );

    for (let input of animation.inputs) {
      manager.animateUpdatingEntry(
        0,
        {
          ...input,
          animation: { type: 'hidden', label: '.' }
        },
        { focussedEntry: animation.new }
      );
    }

    manager.animateUpdatingEntry(
      2000,
      {
        ...animation.new,
        animation: {
          type: 'fusion',
          animationIndex: 1,
          inputEntryIds,
          label: `Result of ${animation.operation.operation?.name} is ${animation.new.value}`
        }
      },
      { focussedEntry: animation.new }
    );

    manager.animateUpdatingEntry(
      1500,
      {
        ...animation.new,
        animation: {
          type: 'fusion',
          animationIndex: 2,
          inputEntryIds,
          label: `Store result ${animation.new.value}`
        }
      },
      { focussedEntry: animation.new }
    );
  } else if (animation.type == 'modify') {
    let before = animation.before;
    let after = animation.after;

    let label1 = `Read entry at ${getAddressLabel(before)} with value ${before.value}`;
    let label2 = `Modify entry at ${getAddressLabel(before)} from ${before.value} to ${after.value}`;

    manager.animateUpdatingEntry(
      1000,
      {
        ...before,
        animation: { type: 'modify', label: label1, animationIndex: 0 }
      },
      { focussedEntry: before }
    );

    manager.animateUpdatingEntry(
      0,
      {
        ...before,
        animation: { type: 'modify', label: label1, animationIndex: 1 }
      },
      { focussedEntry: before }
    );

    manager.animateAddingEntry(
      1000,
      {
        ...after,
        animation: { type: 'modify', label: label2, animationIndex: 2 }
      },
      { focussedEntry: after }
    );

    // manager.animateRemovingEntry(0, before);
  } else if (animation.type == 'add_field_entry') {
    let heapField = animation.entry;
    let children = animation.children;

    let label = `Add structure ${heapField.name} at ${getAddressLabel(heapField)}`;

    let group = manager.animateInGroup();

    let individualDelay = children.length < 5 ? 100 : 50;
    let duration = children.length * individualDelay + 1200;

    group.animateAddingEntry(
      duration,
      {
        ...heapField,
        childEntries: children as any[],
        fieldKind: 'field_region',
        animation: { type: 'add', label }
      },
      { focussedEntry: heapField }
    );

    for (let i = 0; i < children.length; i++) {
      let child = children[i];

      group.animateAddingEntry(
        duration,
        {
          ...child,
          fieldKind: 'field_entry',
          fieldRegionEntryId: heapField.id,
          regionId: heapField.regionId,
          originalFieldRegionId: child.regionId,
          address: child.address,
          animation: { type: 'add', label, delay: i * individualDelay + 500 }
        } as AnimatedEntry,
        { focussedEntry: child }
      );
    }
  } else if (animation.type == 'noop') {
    // Wait for a bit
    manager.wait(500);
  }

  return manager.finalize();
};

/**
 * Apply an entire animation plan to the state
 * @param state current state
 * @param animations animations to apply
 * @returns individual animation steps
 */
export let applyAnimations = (
  os: EnrichedSnapshot | undefined | null,
  state: EnrichedRegion[],
  animations: AnimationPlan,
  animationMultiplier: number
) => {
  let currentState = state;

  let updatedPointers = (
    os?.diff?.pointers.filter(([t]) => t == 'update').map(([_, p]) => p) ?? []
  )
    .map(p => ({
      ...p,
      region: os?.snapshot.regions.find(r => r.pointers.some(rp => rp.id == p.id))!
    }))
    .filter(p => p.region)
    .sort((a, b) => {
      // Sort by region id first
      if (a.region.id != b.region.id) return a.region.id.localeCompare(b.region.id);

      // Then by address
      return a.address - b.address;
    });

  let lastPointerState: Record<string, number> = {};

  let resultAnimations = [
    {
      animation: undefined,
      duration: 500,
      before: currentState,
      after: currentState
    },

    // Individual entry animations
    ...animations.flatMap(animation => {
      let res = applyAnimation(currentState, animation);
      currentState = res[res.length - 1].after;

      return res as any;
    }),

    // ...(updatedPointers
    //   ? [
    //       {
    //         duration: 500,
    //         after: currentState,
    //         before: currentState,
    //         animation: {
    //           type: 'update-pointers',
    //           label: `Update pointers ${updatedPointers.map(p => p.name).join(', ')}`,
    //           pointerStateIndex: 0
    //         }
    //       }
    //     ]
    //   : [])

    //     // Update pointers
    // ...(os?.diff?.pointers.some(([t]) => t == 'update')
    //   ? [
    //       {
    //         duration: 500,
    //         after: currentState,
    //         before: currentState,
    //         animation: {
    //           type: 'update-pointers',
    //           label: `Adjust ${os.diff.pointers.map(p => p[1].name).join(', ')}`
    //         }
    //       }
    //     ]
    //   : [])

    ...updatedPointers.map((pointer, i) => {
      lastPointerState[pointer.region.id] = (lastPointerState[pointer.region.id] ?? -1) + 1;

      return {
        duration: 500,
        after: currentState,
        before: currentState,
        animation: {
          type: 'update-pointers',
          label: `Update pointer`,

          pointerState: { ...lastPointerState }
        }
      };
    })
  ] as {
    duration: number;
    after: AnimatedRegion[];
    before: AnimatedRegion[];
    animation: RegionAnimation | undefined;
    focussedEntry: AnimatedEntry | undefined;
  }[];

  if (animationMultiplier == 1) return resultAnimations;

  return resultAnimations.map(a => ({
    ...a,
    duration: a.duration * animationMultiplier
  }));
};

let getAddressLabel = (entry: AnimatedEntry) => {
  let inner = entry.address.main.toString();
  if (entry.address.multiSlice) inner = `${entry.address.main}.${entry.address.slice}`;

  return `${entry.region.name}[${inner}]`;
};
