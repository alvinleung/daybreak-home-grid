import { createPage, GridCellRenderer, GridPage } from "./gridPage";
import { GridTemplate } from "./gridTemplate"
import { createSmoothMotion } from "./smoothMotion";
import { createStateRenderer, State, state, stylesheet } from "./utils";

const getRandomArrayItem = <T>(arr: Array<T>) => {
  if (arr.length == 0) throw "cannot select empty arry";
  const rand = Math.random();
  return arr[Math.round(rand) * (arr.length - 1)];
}

interface InfiniteGridConfig {
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
  const activeTemplates = state<GridTemplate[]>(templates);
  const useTouchInput = state(isTouchDevice);

  activeTemplates.onChange(() => {
    // reset the template
    allPages.value.forEach(page => {
      page.cleanupPage()
    });
    allPages.value = [];
  });


  const disableScroll = () => {
    canScroll.set(false);
  }

  const enableScroll = () => {
    canScroll.set(true);
  }

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

        const selectedTemplate = getRandomArrayItem(activeTemplates.value);


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
      requestAnimationFrame(attemptCreateNewPage)
    };


    // switch between touch scroll mode vs wheel scroll mode
    if (!useTouchInput.value) {
      scrollMotion.setValue(scrollPosition.value, handleScrollValueUpdate);
      return;
    }
    handleScrollValueUpdate(scrollPosition.value)

  }, [scrollPosition, viewportHeight, activeTemplates]);


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
    baseElm.style.overflowY = "scroll";

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

  return {
    cleanupInfiniteGrid,
    observePageCreation,
    unobservePageCreation,
    isInViewport,
    enableScroll,
    disableScroll,
    setGridTemplates: activeTemplates.set
  };
}