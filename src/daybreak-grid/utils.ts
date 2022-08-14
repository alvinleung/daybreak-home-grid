export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export interface State<T> {
  value: T;
  prevValue: T;
  set: (newState: T) => void;
  onChange: (callback: StateChangeCallback<T>) => void;
  unobserveChange: (callback: StateChangeCallback<T>) => void;
}

type StateChangeCallback<T> = (newValue: T, prevState: T) => void;
export function state<T>(initial: T): State<T> {
  let allCallbacks: Array<StateChangeCallback<T>> = [];
  let state = {
    value: initial,
    prevValue: initial,
    set: (newValue: T) => {
      const prevState = state.value;

      // abort state change when they are the same
      if (prevState === newValue) return;

      state.value = newValue;
      state.prevValue = prevState;

      allCallbacks.forEach((callback) => callback(state.value, prevState));
    },
    onChange: (callback: StateChangeCallback<T>) => {
      allCallbacks.push(callback);
    },
    unobserveChange: (callback: StateChangeCallback<T>) => {
      const removeIndex = allCallbacks.indexOf(callback);
      removeIndex !== -1 && allCallbacks.splice(removeIndex, 1);
    },
  };

  return state;
}

/**
 * Render states in the next animation frame
 * @param states
 * @param renderFunction
 */
export function createStateRenderer(
  renderFunction: Function,
  states: State<any>[] = []
) {
  let hasUnrenderedState = false;
  function attemptRender() {
    // if (!hasUnrenderedState) return;
    renderFunction();
    hasUnrenderedState = false;
  }
  states.forEach((state) => state.onChange(() => triggerRender()));
  function triggerRender() {
    // Only render if there's new state
    if (hasUnrenderedState) return;
    hasUnrenderedState = true;
    requestAnimationFrame(attemptRender);
  }
}

export function createObserver(): [
  (callback: Function) => void,
  (callback: Function) => void,
  () => void
] {
  const callbacks: Function[] = [];
  const observe = (callback: Function) => {
    callbacks.push(callback);
  };
  const unobserve = (callback: Function) => {
    const removeIndex = callbacks.indexOf(callback);

    removeIndex !== -1 && callbacks.splice(removeIndex, 1);
  };
  function fire() {
    callbacks.forEach((callback) => callback());
  }
  return [observe, unobserve, fire];
}

type TransformationConfig = {
  x: number | string;
  y: number | string;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
};

type CSSStyleConfig = Partial<CSSStyleDeclaration> &
  Partial<TransformationConfig>;

function emptyWhenUndefined(
  strings: TemplateStringsArray,
  value: string | number | undefined
) {
  if (value === undefined) return "";
  return strings[0] + value + strings[1];
}

export function stylesheet(elm: HTMLElement, stylesheet: CSSStyleConfig) {
  // process all x, y, scaleX, scaleY
  const {
    x,
    y,
    scaleX,
    scaleY,
    rotateX,
    rotateY,
    rotateZ,
    skewX,
    skewY,
    ...pureCSSStyle
  } = stylesheet;

  const transformStr = [
    emptyWhenUndefined`translateX(${typeof x === "number" ? x + "px" : x})`,
    emptyWhenUndefined`translateY(${typeof y === "number" ? y + "px" : y})`,
    emptyWhenUndefined`scaleX(${scaleX})`,
    emptyWhenUndefined`scaleY(${scaleY})`,
    emptyWhenUndefined`skewX(${skewX}deg)`,
    emptyWhenUndefined`skewY(${skewY}deg)`,
    emptyWhenUndefined`rotateX(${rotateX})`,
    emptyWhenUndefined`rotateY(${rotateY})`,
    emptyWhenUndefined`rotateZ(${rotateZ})`,
  ].join(" ");

  // compose the transform string
  elm.style.transform = transformStr;

  Object.keys(pureCSSStyle).forEach((styleKey) => {
    elm.style[styleKey] = pureCSSStyle[styleKey];
  });
}

export function createTimer() {
  let initial = Date.now();
  let lastUpdate = Date.now();
  return {
    getDelta: () => {
      const newTime = Date.now();
      const delta = newTime - lastUpdate;
      lastUpdate = newTime;
      return delta;
    },
    getCurrentTime: () => {
      return Date.now() - initial;
    },
  };
}

export function debounce(callback: Function, millisec: number) {
  let timeoutId: number;
  function triggerDebounce() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, millisec);
  }

  return triggerDebounce;
}
