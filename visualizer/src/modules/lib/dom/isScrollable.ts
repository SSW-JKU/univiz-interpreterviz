export let isScrollable = (element: Element): boolean => {
  let style = window.getComputedStyle(element);
  let overflowY = style.overflowY;
  let overflowX = style.overflowX;
  let isScrollY = overflowY === 'auto' || overflowY === 'scroll';
  let isScrollX = overflowX === 'auto' || overflowX === 'scroll';

  return (
    (isScrollY && element.scrollHeight > element.clientHeight) ||
    (isScrollX && element.scrollWidth > element.clientWidth)
  );
};
