export function createSmoothMotion({ initial = 0, smoothFactor = 0.05 }) {
  let currentAnimationFrame = 0;
  let currentScroll = initial;
  let targetScroll = initial;
  let velocity = 0;

  function jumpTo(target: number) {
    targetScroll = target + currentScroll;
    currentScroll = target;
  }

  function updateScrollMotion(
    target: number,
    updateFunction: (newValue: number) => void,
    smooth: boolean = true
  ) {
    targetScroll = target;

    if (!smooth) {
      currentScroll = targetScroll;
      updateFunction(currentScroll);
      return;
    }

    function updateFrame() {
      // interpolate here
      velocity = (targetScroll - currentScroll) * smoothFactor;
      currentScroll += velocity;

      updateFunction(currentScroll);

      const velocityAbs = Math.abs(velocity);
      const isDone = velocityAbs < 0.1;

      if (!isDone) requestAnimationFrame(updateFrame);
    }

    if (currentAnimationFrame) cancelAnimationFrame(currentAnimationFrame);
    currentAnimationFrame = requestAnimationFrame(updateFrame);
  }

  return { setValue: updateScrollMotion, jumpTo: jumpTo };
}