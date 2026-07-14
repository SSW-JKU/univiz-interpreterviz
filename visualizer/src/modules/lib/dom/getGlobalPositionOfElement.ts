export let getGlobalPositionOfElement = (element: Element): { x: number; y: number } => {
  if (!element) return { x: 0, y: 0 };

  let rect = element.getBoundingClientRect();
  // let scrollParent = findScrollParent(element);

  // if (scrollParent == window) {
  return {
    x: rect.left,
    y: rect.top
  };
  // } else {
  //   let parent = scrollParent as Element;
  //   let parentRect = parent.getBoundingClientRect();

  //   return {
  //     x: rect.left + parent.scrollLeft - parentRect.left,
  //     y: rect.top + parent.scrollTop - parentRect.top
  //   };
  // }
};

export interface Position {
  x: number;
  y: number;
}
