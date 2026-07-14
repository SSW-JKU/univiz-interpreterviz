import { unique } from '../../../lib/utils/unique';
import { EnrichedSnapshot } from '../data/normalize/operationSnapshot';
import { entrySorter } from '../data/normalize/sortEntries';
import { Animation, AnimationPlan } from './types';

/**
 * Heuristic to order animations in a way that makes sense
 */
export let orderAnimations = (
  animations: AnimationPlan,
  os: EnrichedSnapshot
): AnimationPlan => {
  // if (!animations.every(a => a.type != 'remove')) {
  //   // All animations are remove
  //   return animations.sort((a, b) => getAnimationIndex(a) - getAnimationIndex(b)).reverse();
  // }

  let ordered = unique(orderAnimationsByEntryOrder(animations));

  let animationHint = os.vizOperation?.flags.animationHint;

  if (animationHint == 'enter_operation') {
    return ordered.sort((a, b) => {
      if ((a.type == 'move' || a.type == 'add') && (b.type == 'move' || b.type == 'add')) {
        let aIndex = a.type == 'move' ? a.to.address.main : a.entry.address.main;
        let bIndex = b.type == 'move' ? b.to.address.main : b.entry.address.main;

        return aIndex - bIndex;
      }

      return 0;
    });
  }

  let fusion = ordered.filter(a => a.type == 'fusion');
  let fieldAdd = ordered.filter(a => a.type == 'add_field_entry');

  ordered = ordered.filter(a => a.type != 'fusion' && a.type != 'add_field_entry');

  let firstAdd = ordered.findIndex(a => a.type == 'add');

  if (firstAdd != -1) {
    ordered = [...ordered.slice(0, firstAdd), ...fieldAdd, ...ordered.slice(firstAdd)];
  } else {
    ordered = [...ordered, ...fieldAdd];
  }

  ordered = [...ordered, ...fusion];

  return reorderRemoveAnimations(ordered, os);
};

let getAnimationAffectedEntries = (animation: AnimationPlan[0]) => {
  if (animation.type == 'add') return [animation.entry];
  if (animation.type == 'remove') return [animation.entry];
  if (animation.type == 'modify') return [animation.before, animation.after];
  if (animation.type == 'move' || animation.type == 'copy')
    return [animation.from, animation.to];
  if (animation.type == 'fusion') return [...animation.inputs, animation.new];
  if (animation.type == 'add_field_entry') return [animation.entry];
  return [];
};

let sortAnimationByEntry = (animations: AnimationPlan) => {
  return animations.sort((a, b) => {
    let [a1] = getAnimationAffectedEntries(a);
    let [b1] = getAnimationAffectedEntries(b);

    if (!a1 || !b1) return 0;

    return entrySorter(a1, b1);
  });
};

let orderAnimationsByEntryOrder = (
  animations: AnimationPlan,
  animation?: AnimationPlan[0],
  depth = 0
): AnimationPlan => {
  if (depth > 25) return animations;

  if (!animation) {
    animations = sortAnimationByEntry(animations);
    animation = animations[0];

    if (!animation) return animations;
  }

  let affected = getAnimationAffectedEntries(animation);

  let before = affected.sort(entrySorter).flatMap(aff =>
    animations.filter(anim => {
      let affected = getAnimationAffectedEntries(anim);

      if (
        anim == animation ||
        (anim.type == 'remove' && !affected.some(e => e.address.main == aff.address.main))
      )
        return false;

      return affected.some(
        e =>
          e.address.main < aff.address.main ||
          (e.address.main == aff.address.main && e.id < aff.id)
      );
    })
  );

  let other = animations.filter(anim => !before.includes(anim) && anim != animation);

  return [
    ...before.flatMap(a => orderAnimationsByEntryOrder(other, a)),
    animation,
    ...other.flatMap(a => orderAnimationsByEntryOrder(other, a))
  ];
};

let reorderRemoveAnimations = (animations: AnimationPlan, os: EnrichedSnapshot) => {
  if (animations.every(a => a.type == 'remove' || a.type == 'move')) {
    return sortAnimationByEntry(animations).reverse();
  }

  let plan: AnimationPlan = [];
  let animationHint = os.vizOperation?.flags.animationHint;

  for (let i = 0; i < animations.length; i++) {
    let animation = animations[i];

    if (animation.type != 'remove') {
      plan.push(animation);
    } else {
      let removes: Animation[] = [animation];

      for (let j = i + 1; j < animations.length; j++) {
        if (animations[j].type != 'remove') break;
        removes.push(animations[j]);
      }

      // plan.push(...removes.sort((a, b) => getAnimationIndex(b) - getAnimationIndex(a)));

      if (animationHint == 'load_operation') {
        plan.unshift(...sortAnimationByEntry(removes).reverse());
      } else {
        plan.push(...sortAnimationByEntry(removes).reverse());
      }

      i += removes.length - 1;
    }
  }

  return plan;
};
