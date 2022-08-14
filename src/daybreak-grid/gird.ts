import { GridCellRenderer, setupAllCells } from "./gridDOM";
import { GridTemplate } from "./gridTemplate"
import { State, state, stylesheet } from "./utils";




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

function setupGridContainer(baseElm: HTMLElement) {
  const gridContainer = document.createElement("div");
  stylesheet(gridContainer, {
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    width: "100%"
  })
  baseElm.append(gridContainer);

  return gridContainer;
}


export const createInfiniteGrid = <T>({ renderCell, templates, baseElm }: InfiniteGridConfig) => {
  const selectedTemplate = getRandomArrayItem(templates);
  const gridContainer = setupGridContainer(baseElm);


  const cleanupCells = setupAllCells({
    template: selectedTemplate,
    renderFunction: renderCell,
    baseElm: gridContainer
  });

  const cleanupInfiniteGrid = () => {
    cleanupCells();
  }

  return {
    cleanupInfiniteGrid
  }
}