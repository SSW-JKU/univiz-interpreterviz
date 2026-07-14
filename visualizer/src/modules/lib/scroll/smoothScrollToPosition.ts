let easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export let smoothScrollToPosition = (
  element: Element | Window,
  targetX: number,
  targetY: number,
  duration: number = 300
) =>
  new Promise<void>(resolve => {
    let startX = element instanceof Window ? window.scrollX : (element as Element).scrollLeft;
    let startY = element instanceof Window ? window.scrollY : (element as Element).scrollTop;
    let distanceX = targetX - startX;
    let distanceY = targetY - startY;
    let startTime = performance.now();

    let animateScroll = () => {
      let now = performance.now();
      let elapsed = (now - startTime) / duration; // Calculate elapsed time
      let progress = Math.min(elapsed, 1); // Ensure progress is capped at 1 (100%)
      let easedProgress = easeInOut(progress);

      let scrollPosX = startX + distanceX * easedProgress;
      let scrollPosY = startY + distanceY * easedProgress;

      if (element instanceof Window) {
        window.scrollTo(scrollPosX, scrollPosY);
      } else {
        (element as Element).scrollLeft = scrollPosX;
        (element as Element).scrollTop = scrollPosY;
      }

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animateScroll);
  });
