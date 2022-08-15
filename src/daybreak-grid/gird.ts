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


export const createInfiniteGrid = ({ renderCell, templates, baseElm }: InfiniteGridConfig) => {

  const scrollPosition = state(0);
  const viewportHeight = state(window.innerHeight);
  const allPages = state([] as GridPage[]);
  // const mainPage = createPage(selectedTemplate, renderCell, baseElm);

  createStateRenderer(() => {
    const attemptCreateNewPage = () => {
      const PADDING = window.innerHeight;
      const totalHeight = allPages.value.reduce((prev, curr) => prev + curr.height.value, 0);

      const shouldInsertNewPageAfter = totalHeight < viewportHeight.value + scrollPosition.value + PADDING;
      const shouldInsertNewPageBefore = totalHeight < viewportHeight.value + scrollPosition.value + PADDING;

      if (shouldInsertNewPageAfter) {
        const selectedTemplate = getRandomArrayItem(templates);
        const newPage = createPage(selectedTemplate, renderCell, baseElm);

        allPages.set([
          ...allPages.value,
          newPage
        ])
        attemptCreateNewPage();
        return;
      }
    }
    attemptCreateNewPage();
  }, [scrollPosition, viewportHeight])


  const handlePageResize = () => {
    viewportHeight.set(window.innerHeight);
  }
  const handlePageScroll = () => {
    scrollPosition.set(window.scrollY);
  }
  window.addEventListener("resize", handlePageResize);
  window.addEventListener("scroll", handlePageScroll);

  const cleanupInfiniteGrid = () => {
    window.removeEventListener("resize", handlePageResize);
    window.removeEventListener("scroll", handlePageScroll);
  }

  return cleanupInfiniteGrid;
}