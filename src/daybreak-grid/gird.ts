import { createPage, GridCellRenderer, GridPage } from "./gridPage";
import { GridTemplate } from "./gridTemplate"
import { createStateRenderer, State, state, stylesheet } from "./utils";

const getRandomArrayItem = <T>(arr: Array<T>) => {
  if (arr.length == 0) throw "cannot select empty arry";
  const rand = Math.random();
  return arr[Math.round(rand) * (arr.length - 1)];
}

interface InfiniteGridConfig {
  cols: number;
  templates: GridTemplate[];
  renderCell: GridCellRenderer;
  baseElm: HTMLElement;
}


const isTouchDevice: any = (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement);

export const createInfiniteGrid = ({ renderCell, templates, baseElm }: InfiniteGridConfig) => {

  const scrollPosition = state(0);
  const viewportHeight = state(window.innerHeight);
  const allPages = state([] as GridPage[]);
  const canScroll = state(true);
  const useTouchInput = state(isTouchDevice);

  const disableScroll = () => {
    canScroll.set(false);
  }

  const enableScroll = () => {
    canScroll.set(true);
  }
  // const mainPage = createPage(selectedTemplate, renderCell, baseElm);


  const gridScrollContent = document.createElement("div");
  stylesheet(gridScrollContent, {
    position: "relative"
  })
  const negativeScrollContainer = document.createElement("div");
  const positiveScrollContainer = document.createElement("div");

  stylesheet(negativeScrollContainer, {
    position: "absolute",
    bottom: "100%",
    left: "0px",
    right: "0px",
    display: "flex",
    flexDirection: "col-reverse",
    flexWrap: "wrap"
  })


  gridScrollContent.appendChild(negativeScrollContainer);
  gridScrollContent.appendChild(positiveScrollContainer);
  baseElm.appendChild(gridScrollContent);

  const scrollMotion = createSmoothMotion({ initial: 0, smoothFactor: 0.05 });

  createStateRenderer(() => {
    const handleScrollValueUpdate = (scroll: number) => {

      // use y position scroll when not using touch mode
      !useTouchInput.value && stylesheet(gridScrollContent, {
        y: -scroll
      })

      const attemptCreateNewPage = () => {
        const APPEND_THRESHOLD = window.innerHeight / 2;

        // count height
        const { positiveHeight, negativeHeight } = allPages.value.reduce((prev, curr) => {
          if (curr.isInsertBefore) {
            prev.negativeHeight += curr.height.value
            return prev;
          }
          prev.positiveHeight += curr.height.value;
          return prev;
        }, { positiveHeight: 0, negativeHeight: 0 });

        const shouldInsertNewPageAfter = positiveHeight < viewportHeight.value + scroll + APPEND_THRESHOLD;
        const shouldInsertNewPageBefore = scroll + negativeHeight < 0;

        const selectedTemplate = getRandomArrayItem(templates);


        if (shouldInsertNewPageBefore) {
          const newPage = createPage({
            template: selectedTemplate,
            renderFunction: renderCell,
            insertBefore: true,
            baseElm: negativeScrollContainer,
            useTouchInput: useTouchInput
          });

          allPages.set([
            ...allPages.value,
            newPage
          ])
          return;
        }

        if (shouldInsertNewPageAfter) {
          const newPage = createPage({
            template: selectedTemplate,
            renderFunction: renderCell,
            insertBefore: false,
            baseElm: positiveScrollContainer,
            useTouchInput: useTouchInput
          });

          allPages.set([
            ...allPages.value,
            newPage
          ])
          attemptCreateNewPage();
          return;
        }
      }
      attemptCreateNewPage();
    };


    // switch between touch scroll mode vs wheel scroll mode
    if (!useTouchInput.value) {
      scrollMotion.setValue(scrollPosition.value, handleScrollValueUpdate);
      return;
    }
    handleScrollValueUpdate(scrollPosition.value)

  }, [scrollPosition, viewportHeight]);


  const handlePageResize = () => {
    viewportHeight.set(window.innerHeight);

    stylesheet(baseElm, {
      overflow: "hidden",
      height: "100vh"
    })
  }
  handlePageResize();

  // TODO: working on touch scroll
  const toggleTouchScroll = (useTouchScroll: boolean) => {
    if (!useTouchScroll) return;
    disableScroll();
    scrollMotion.jumpTo(0);
    baseElm.style.overflow = "scroll";

    const handleScroll = (e: Event) => {
      scrollPosition.set(baseElm.scrollTop);
    }
    baseElm.addEventListener("scroll", handleScroll);
  }
  // set initial touch scroll state
  useTouchInput.onChange(toggleTouchScroll);
  toggleTouchScroll(isTouchDevice);


  const handlePageScroll = (e: WheelEvent) => {
    if (!canScroll.value) return;
    scrollPosition.set(scrollPosition.value + e.deltaY);
  }
  window.addEventListener("resize", handlePageResize);
  window.addEventListener("wheel", handlePageScroll);

  const cleanupInfiniteGrid = () => {
    window.removeEventListener("resize", handlePageResize);
    window.removeEventListener("wheel", handlePageScroll);
  }

  const observePageCreation = (handlePageCreate) => {
    allPages.onChange(handlePageCreate)
  }

  const unobservePageCreation = (handlePageCreate) => {
    allPages.unobserveChange(handlePageCreate)
  }

  const isInViewport = (elm: HTMLElement) => {
    const bounds = elm.getBoundingClientRect();
    return (
      bounds.bottom >= 0 &&
      bounds.top <= (viewportHeight.value)
    );
  }

  return { cleanupInfiniteGrid, observePageCreation, unobservePageCreation, isInViewport, enableScroll, disableScroll };
}




function createSmoothMotion({ initial = 0, smoothFactor = 0.05 }) {
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