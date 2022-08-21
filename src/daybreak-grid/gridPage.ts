import { GridTemplate } from "./gridTemplate";
import { state, State, stylesheet } from "./utils";

type GridCellCleanup = () => void;
export type GridCellRenderer = (cellInfo: CellInfo) => GridCellCleanup | void;

export type GridState = {
  cellData: Array<Object>;
  cellStates: Array<Object>;
};

interface LinkedPages {
  nextPage: GridPage | undefined;
  prevPage: GridPage | undefined;
}

interface CellInfo {
  col: number;
  row: number;
  isFirstCol: boolean;
  isLastCol: boolean;
  type: string;
  elm: HTMLDivElement;
  getNearbyCell: (colDist: number, rowDist: number) => CellInfo;
}

const createGridCells = (template: GridTemplate, baseElm: HTMLDivElement) => {
  const cellElmsList: HTMLDivElement[] = [];
  const totalCellCount = template.cols * template.rows;

  for (let i = 0; i < totalCellCount; i++) {
    const elm = document.createElement("div");
    baseElm.appendChild(elm);
    cellElmsList.push(elm);
  }
  return cellElmsList;
};

const getCellInfo = (
  template: GridTemplate,
  cellElmsList: HTMLDivElement[],
  col: number,
  row: number,
  page: GridPage
): CellInfo => {
  console.log(row);
  console.log(template.content);

  const cellType = template.content[row][col];
  const currCellElmIndex = col + row * template.cols;
  const currCellElm = cellElmsList[currCellElmIndex];

  const getNearbyCell = (colDist: number, rowDist: number) => {
    let rowInTargetPage: number = rowDist;
    let targetPage: GridPage = page;
    while (rowInTargetPage > targetPage.template.rows) {
      rowInTargetPage -= targetPage.template.rows;
      if (!targetPage.linkedPage.nextPage) {
        throw "Cell does not exist";
      }
      targetPage = targetPage.linkedPage.nextPage;
    }

    return getCellInfo(
      template,
      cellElmsList,
      col + colDist,
      rowInTargetPage,
      targetPage
    );
  };

  return {
    type: cellType,
    elm: currCellElm,
    col: col,
    row: row,
    getNearbyCell: getNearbyCell,
    isFirstCol: col === 0,
    isLastCol: col === template.cols,
  };
};

const createGridContainer = (colCount: number) => {
  const gridContainer = document.createElement("div");
  stylesheet(gridContainer, {
    // position: "absolute",
    // top: positionY + "px",
    display: "grid",
    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
    gap: "24px",
    rowGap: "24px",
    width: "100%",
    marginBottom: "24px",
  });

  return gridContainer;
};

export interface GridPage {
  pageElm: HTMLDivElement;
  height: State<number>;
  cleanupPage: Function;
  isInsertBefore: boolean;
  linkNextPage: (page: GridPage | undefined) => void;
  linkPrevPage: (page: GridPage | undefined) => void;
  linkedPage: LinkedPages;
  template: GridTemplate;
}

interface GridPageConfig {
  template: GridTemplate;
  renderFunction: GridCellRenderer;
  baseElm: HTMLElement;
  insertBefore: boolean;
  useTouchInput: State<boolean>;
  // positionY: number;
}

export const createPage = ({
  template,
  renderFunction,
  insertBefore,
  baseElm,
  useTouchInput,
}: GridPageConfig): GridPage => {
  const gridContainer = createGridContainer(template.cols);
  const cellElmsList = createGridCells(template, gridContainer);
  const cellCleanups: GridCellCleanup[] = [];

  const linkedPage: LinkedPages = { nextPage: undefined, prevPage: undefined };

  // disable artifical scroll when using touch
  const handleTouchInputChange = (useTouch: boolean) => {
    if (!useTouch) return;
    gridContainer.style.overflowY = "scroll";
  };
  useTouchInput.onChange(handleTouchInputChange);

  // measure height every time it changes
  const pageHeight = state(gridContainer.getBoundingClientRect().height);
  const handlePageResize = () => {
    pageHeight.set(gridContainer.getBoundingClientRect().height);
  };
  window.addEventListener("resize", handlePageResize);

  const page: GridPage = {
    pageElm: gridContainer,
    height: pageHeight,
    linkedPage: linkedPage,
    template: template,
    isInsertBefore: insertBefore,
    cleanupPage: () => {
      useTouchInput.unobserveChange(handleTouchInputChange);
      cellCleanups.forEach((cleanup) => cleanup());
      // cellElmsList.forEach((node) => gridContainer.removeChild(node));
      gridContainer.remove();
      window.removeEventListener("resize", handlePageResize);

      // remove the page itself from the linkage
      if (linkedPage.prevPage)
        linkedPage.prevPage.linkNextPage(linkedPage.nextPage);
      if (linkedPage.nextPage)
        linkedPage.nextPage.linkPrevPage(linkedPage.prevPage);
    },
    linkNextPage: (page: GridPage | undefined) => {
      linkedPage.nextPage = page;
    },
    linkPrevPage: (page: GridPage | undefined) => {
      linkedPage.prevPage = page;
    },
  };

  // create cells
  for (let row = 0; row < template.rows; row++) {
    for (let col = 0; col < template.cols; col++) {
      const cellInfo = getCellInfo(template, cellElmsList, col, row, page);
      const cleanupFunction = renderFunction(cellInfo);

      // cleanup and remove elms
      cellCleanups.push(() => {
        cleanupFunction && cleanupFunction();
      });
    }
  }

  baseElm.append(gridContainer);
  return page;
};
