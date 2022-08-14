import { GridTemplate } from "./gridTemplate";
import { State } from "./utils";

type GridCellCleanup = () => void;
export type GridCellRenderer = (cellInfo: CellInfo) => GridCellCleanup;

export type GridState = {
  cellData: Array<Object>,
  cellStates: Array<Object>
}

interface CellInfo {
  col: number,
  row: number,
  isFirstCol: boolean,
  isLastCol: boolean,
  type: string,
  elm: HTMLDivElement,
  getNearbyCell: (colDist: number, rowDist: number) => CellInfo,
  onUpdate: Function
}

const initCells = (template: GridTemplate, baseElm: HTMLDivElement) => {
  const cellElmsList: HTMLDivElement[] = [];
  const totalCellCount = template.cols * template.rows;

  for (let i = 0; i < totalCellCount; i++) {
    const elm = document.createElement("div");
    baseElm.appendChild(elm);
    cellElmsList.push(elm);
  }
  return { cellElmsList };
};



interface CellSetupInfo {
  template: GridTemplate;
  renderFunction: GridCellRenderer;
  baseElm: HTMLDivElement;
}

export function setupAllCells({ template, renderFunction, baseElm }: CellSetupInfo) {

  const cellCleanups: GridCellCleanup[] = [];
  const { cellElmsList } = initCells(template, baseElm);

  const gridStateHandlers: Function[] = [];


  const getCellInfo = (template: GridTemplate, cellElmsList: HTMLDivElement[], col: number, row: number): CellInfo => {
    const cellType = template.content[row][col];
    const currCellElmIndex = col + (row * template.cols);
    const currCellElm = cellElmsList[currCellElmIndex];

    const getNearbyCell = (colDist: number, rowDist: number) => {
      return getCellInfo(template, cellElmsList, col + colDist, row + rowDist)
    }

    return {
      type: cellType,
      elm: currCellElm,
      col: col,
      row: row,
      getNearbyCell: getNearbyCell,
      isFirstCol: col === 0,
      isLastCol: col === template.cols,
      onUpdate: (handler: Function) => gridStateHandlers.push(handler),
    }
  }

  // create cells
  for (let row = 0; row < template.rows; row++) {
    for (let col = 0; col < template.cols; col++) {
      const cellInfo = getCellInfo(template, cellElmsList, col, row);
      cellCleanups.push(renderFunction(cellInfo));
    }
  }

  return () => {
    cellCleanups.forEach((cleanup) => cleanup());
  }
}