import { GridTemplate } from "./gridTemplate";
import { state, State, stylesheet } from "./utils";

type GridCellCleanup = () => void;
export type GridCellRenderer = (cellInfo: CellInfo) => GridCellCleanup | void;

export type GridState = {
  cellData: Array<Object>;
  cellStates: Array<Object>;
};

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
  row: number
): CellInfo => {
  const cellType = template.content[row][col];
  const currCellElmIndex = col + row * template.cols;
  const currCellElm = cellElmsList[currCellElmIndex];

  const getNearbyCell = (colDist: number, rowDist: number) => {
    return getCellInfo(template, cellElmsList, col + colDist, row + rowDist);
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

const createGridContainer = (colCount: number, gridGap: number) => {
  const gridContainer = document.createElement("div");
  stylesheet(gridContainer, {
    // position: "absolute",
    // top: positionY + "px",
    display: "grid",
    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
    gap: gridGap + "px",
    rowGap: gridGap + "24px",
    width: "100%",
    marginBottom: "24px",
  });

  const setGridGap = (newGap: number) => {
    stylesheet(gridContainer, {
      gap: newGap + "px",
      rowGap: newGap + "24px",
    });
  };

  return { gridContainer, setGridGap };
};

export interface GridPage {
  pageElm: HTMLDivElement;
  height: State<number>;
  cleanupPage: Function;
  isInsertBefore: boolean;
  setGridGap: (value: number) => void;
}

interface GridPageConfig {
  template: GridTemplate;
  gridGap: number;
  renderFunction: GridCellRenderer;
  baseElm: HTMLElement;
  insertBefore: boolean;
  useTouchInput: State<boolean>;
}

export const createPage = ({
  template,
  renderFunction,
  insertBefore,
  baseElm,
  useTouchInput,
  gridGap,
}: GridPageConfig): GridPage => {
  const { gridContainer, setGridGap } = createGridContainer(
    template.cols,
    gridGap
  );
  const cellElmsList = createGridCells(template, gridContainer);
  const cellCleanups: GridCellCleanup[] = [];

  // create cells
  for (let row = 0; row < template.rows; row++) {
    for (let col = 0; col < template.cols; col++) {
      const cellInfo = getCellInfo(template, cellElmsList, col, row);
      const cleanupFunction = renderFunction(cellInfo);

      // cleanup and remove elms
      cellCleanups.push(() => {
        cleanupFunction && cleanupFunction();
      });
    }
  }

  baseElm.append(gridContainer);

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

  return {
    pageElm: gridContainer,
    height: pageHeight,
    isInsertBefore: insertBefore,
    cleanupPage: () => {
      useTouchInput.unobserveChange(handleTouchInputChange);
      cellCleanups.forEach((cleanup) => cleanup());
      // cellElmsList.forEach((node) => gridContainer.removeChild(node));
      gridContainer.remove();
      window.removeEventListener("resize", handlePageResize);
    },
    setGridGap: setGridGap,
  };
};
