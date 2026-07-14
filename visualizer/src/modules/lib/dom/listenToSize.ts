import { getGlobalPositionOfElement } from './getGlobalPositionOfElement';

export let listenToRect = (element: Element, cb: (rect: DOMRectReadOnly) => void) => {
  if (!element)
    return {
      initialRect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => {}
      } satisfies DOMRectReadOnly,
      disconnect: () => {}
    };

  let observer = new ResizeObserver(entries => {
    cb(entries[0].contentRect);
  });

  observer.observe(element);

  let initialRect = element.getBoundingClientRect();

  cb(initialRect);

  return {
    initialRect,
    disconnect: () => observer.disconnect()
  };
};

export let listenToPosition = (
  element: Element,
  cb: (position: { x: number; y: number; rect: DOMRectReadOnly }) => void
) => {
  let res = listenToRect(element, rect =>
    cb({
      ...getGlobalPositionOfElement(element),
      rect
    })
  );

  return {
    ...res,
    initialPosition: {
      ...getGlobalPositionOfElement(element),
      rect: res.initialRect
    }
  };
};
