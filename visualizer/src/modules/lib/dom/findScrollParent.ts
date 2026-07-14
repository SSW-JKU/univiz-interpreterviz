import { isScrollable } from './isScrollable';

export let findScrollParent = (el: Element): Element | Window => {
  let parent: Element | null = el;

  while (parent) {
    if (isScrollable(parent)) return parent;

    parent = parent.parentElement;
  }

  return window;
};
