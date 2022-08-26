import { createPage, GridCellRenderer, GridPage } from "./gridPage";
import { GridTemplate } from "./gridTemplate";
import { createSmoothMotion } from "./smoothMotion";
import { createStateRenderer, State, state, stylesheet } from "./utils";

const getRandomArrayItem = <T>(arr: Array<T>) => {
  if (arr.length == 0) throw "cannot select empty arry";
  const rand = Math.random();
  return arr[Math.round(rand) * (arr.length - 1)];
};

interface InfiniteGridConfig {
  templates: GridTemplate[];
  renderCell: GridCellRenderer;
  baseElm: HTMLElement;
}

const isTouchDevice: any =
  navigator.maxTouchPoints || "ontouchstart" in document.documentElement;

export const createInfiniteGrid = ({
  renderCell,
  templates,
  baseElm,
}: InfiniteGridConfig) => {
  const scrollPosition = state(0);
  const viewportHeight = state(window.innerHeight);

  const gridGap = state(24);
  const topPadding = state(0);
  const useNegativeContainer = state(true);

  const allPages = state([] as GridPage[]);
  const canScroll = state(true);
  const activeTemplates = state<GridTemplate[]>(templates);
  const useTouchInput = state(isTouchDevice);

  gridGap.onChange((newVal) => {
    allPages.value.forEach((page) => {
      page.setGridGap(newVal);
    });
  });

  activeTemplates.onChange(() => {
    if (allPages.value.length === 0) return;

    // reset the template
    allPages.value.forEach((page) => {
      page.cleanupPage();
    });
    allPages.set([]);
  });

  const disableScroll = () => {
    canScroll.set(false);
  };

  const enableScroll = () => {
    canScroll.set(true);
  };

  const gridScrollContent = document.createElement("div");
  stylesheet(gridScrollContent, {
    position: "relative",
  });
  const negativeScrollContainer = document.createElement("div");
  const positiveScrollContainer = document.createElement("div");

  stylesheet(negativeScrollContainer, {
    position: "absolute",
    bottom: "100%",
    left: "0px",
    right: "0px",
    display: "flex",
    flexDirection: "column-reverse",
    flexWrap: "wrap",
  });
  stylesheet(baseElm, {
    height: "100vh",
  });
  baseElm.classList.add("hide-scrollbar");

  gridScrollContent.appendChild(negativeScrollContainer);
  gridScrollContent.appendChild(positiveScrollContainer);
  baseElm.appendChild(gridScrollContent);

  const scrollMotion = createSmoothMotion({ initial: 0, smoothFactor: 0.05 });

  createStateRenderer(() => {
    if (
      topPadding.value !== 0 &&
      scrollPosition.value <= 0 &&
      scrollPosition.value < scrollPosition.prevValue
    ) {
      scrollPosition.value = 0;
      scrollPosition.prevValue = 0;
    }

    const handleScrollValueUpdate = (scroll: number) => {
      // use y position scroll when not using touch mode
      !useTouchInput.value &&
        stylesheet(gridScrollContent, {
          y: -scroll,
        });

      const attemptCreateNewPage = () => {
        const APPEND_THRESHOLD = window.innerHeight / 2;

        // count height
        const { positiveHeight, negativeHeight } = allPages.value.reduce(
          (prev, curr) => {
            if (curr.isInsertBefore) {
              prev.negativeHeight += curr.height.value;
              return prev;
            }
            prev.positiveHeight += curr.height.value;
            return prev;
          },
          { positiveHeight: 0, negativeHeight: 0 }
        );

        const shouldInsertNewPageAfter =
          positiveHeight < viewportHeight.value + scroll + APPEND_THRESHOLD;
        const shouldInsertNewPageBefore = scroll + negativeHeight < 0;
        const selectedTemplate = getRandomArrayItem(activeTemplates.value);

        if (shouldInsertNewPageBefore && useNegativeContainer.value) {
          const newPage = createPage({
            template: selectedTemplate,
            renderFunction: renderCell,
            insertBefore: true,
            baseElm: negativeScrollContainer,
            useTouchInput: useTouchInput,
            gridGap: gridGap.value,
          });

          allPages.set([...allPages.value, newPage]);
          attemptCreateNewPage();
          return;
        }

        if (shouldInsertNewPageAfter) {
          const newPage = createPage({
            template: selectedTemplate,
            renderFunction: renderCell,
            insertBefore: false,
            baseElm: positiveScrollContainer,
            useTouchInput: useTouchInput,
            gridGap: gridGap.value,
          });

          allPages.set([...allPages.value, newPage]);
          attemptCreateNewPage();
          return;
        }
      };
      requestAnimationFrame(attemptCreateNewPage);
    };

    // switch between touch scroll mode vs wheel scroll mode
    if (!useTouchInput.value) {
      scrollMotion.setValue(scrollPosition.value, handleScrollValueUpdate);
      return;
    }
    handleScrollValueUpdate(scrollPosition.value);
  }, [scrollPosition, viewportHeight, activeTemplates]);

  const handlePageResize = () => {
    viewportHeight.set(window.innerHeight);
  };
  handlePageResize();

  topPadding.onChange((newPadding) => {
    if (newPadding === 0) {
      useNegativeContainer.set(true);
      return;
    }

    useNegativeContainer.set(false);
    stylesheet(positiveScrollContainer, {
      marginTop: newPadding + "px",
    });
  });

  // TODO: working on touch scroll
  const toggleTouchScroll = (useTouchScroll: boolean) => {
    if (!useTouchScroll) {
      stylesheet(baseElm, {
        overflowX: "hidden",
        overflowY: "hidden",
      });
      return;
    }
    disableScroll();
    scrollMotion.jumpTo(0);
    stylesheet(baseElm, {
      overflowX: "hidden",
      overflowY: "scroll",
    });

    const handleScroll = (e: Event) => {
      scrollPosition.set(baseElm.scrollTop);
    };
    baseElm.addEventListener("scroll", handleScroll);
  };
  // set initial touch scroll state
  useTouchInput.onChange(toggleTouchScroll);
  toggleTouchScroll(isTouchDevice);

  const handlePageScroll = (e: WheelEvent) => {
    if (!canScroll.value) return;
    scrollPosition.set(scrollPosition.value + e.deltaY);
  };
  window.addEventListener("resize", handlePageResize);
  window.addEventListener("wheel", handlePageScroll);

  const cleanupInfiniteGrid = () => {
    window.removeEventListener("resize", handlePageResize);
    window.removeEventListener("wheel", handlePageScroll);
  };

  const observePageCreation = (handlePageCreate) => {
    allPages.onChange(handlePageCreate);
  };

  const unobservePageCreation = (handlePageCreate) => {
    allPages.unobserveChange(handlePageCreate);
  };

  const isInViewport = (elm: HTMLElement) => {
    const bounds = elm.getBoundingClientRect();
    return bounds.bottom >= 0 && bounds.top <= viewportHeight.value;
  };

  return {
    cleanupInfiniteGrid,
    observePageCreation,
    unobservePageCreation,
    isInViewport,
    enableScroll,
    disableScroll,
    setGridTemplates: activeTemplates.set,
    setGridGap: gridGap.set,
    setTopPadding: topPadding.set,
    observeScroll: scrollPosition.onChange,
    unobserveScroll: scrollPosition.unobserveChange,
    getScrollPosition: () => {
      return scrollPosition.value;
    },
  };
};
