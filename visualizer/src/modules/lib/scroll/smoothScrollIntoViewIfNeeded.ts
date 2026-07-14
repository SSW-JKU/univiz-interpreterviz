import { findScrollParent } from '../dom/findScrollParent';
import { isElementMountedToDom } from '../dom/isElementMountedToDom';
import { delay } from '../utils';
import { smoothScrollToPosition } from './smoothScrollToPosition';

const SHOULD_SCROLL_THRESHOLD = 75; // px

export let smoothScrollIntoViewIfNeeded = async (
  el: Element,
  opts?: {
    duration?: number;
    offset?: {
      top?: number;
      left?: number;
    };
    withParent?: boolean;
  }
) => {
  if (!el || !isElementMountedToDom(el)) return;

  let duration = Math.round(opts?.duration ?? 300);
  let paddingTop = opts?.offset?.top ?? 0;
  let paddingLeft = opts?.offset?.left ?? 0;

  let scrollParent = findScrollParent(el);

  if (scrollParent === window) {
    let rect = el.getBoundingClientRect();
    let viewportHeight = window.innerHeight;
    let viewportWidth = window.innerWidth;

    if (
      // rect.top < paddingTop ||
      // rect.bottom > viewportHeight - paddingTop ||

      rect.left < paddingLeft ||
      rect.right > viewportWidth - paddingLeft
    ) {
      let targetX = rect.left + window.scrollX - paddingLeft;
      let currentX = window.scrollX;

      if (Math.abs(targetX - currentX) < SHOULD_SCROLL_THRESHOLD) return;

      await smoothScrollToPosition(
        window,
        targetX,
        0, // targetY,
        duration
      );
    }
  } else {
    let parent = scrollParent as Element;
    let parentRect = parent.getBoundingClientRect();
    let elRect = el.getBoundingClientRect();

    let mustScrollParentIntoView = true;
    // parentRect.top < 0 ||
    // parentRect.bottom > window.innerHeight ||
    // parentRect.left < 0 || parentRect.right > window.innerWidth;
    // parentRect.left < paddingLeft || parentRect.right > window.innerWidth - paddingLeft;

    // Scroll to parent if it's not in view
    if (mustScrollParentIntoView && opts?.withParent !== false) {
      await smoothScrollToPosition(
        window,
        parentRect.left + window.scrollX - paddingLeft,
        parentRect.top + window.scrollY - paddingTop,
        Math.round(duration / 2)
      );
      await delay(50);
    }

    let isOutsideVertical =
      elRect.top < parentRect.top + paddingTop ||
      elRect.bottom > parentRect.bottom - paddingTop;
    let isOutsideHorizontal =
      elRect.left < parentRect.left + paddingLeft ||
      elRect.right > parentRect.right - paddingLeft;

    if (isOutsideVertical || isOutsideHorizontal) {
      let scrollY = parent.scrollTop + (elRect.top - parentRect.top) - paddingTop;
      let scrollX = parent.scrollLeft + (elRect.left - parentRect.left) - paddingLeft;

      await smoothScrollToPosition(parent, scrollX, scrollY, duration);
    }
  }
};
