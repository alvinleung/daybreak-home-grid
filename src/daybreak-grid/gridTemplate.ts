export type GridRow = string[];
export type GridContent = GridRow[];

export interface GridTemplate {
  rows: number,
  cols: number,
  content: GridContent;
};


export interface parseGridTemplateParser {

}

export const createGridTemplate = (gridContent: GridContent): GridTemplate => {

  const rows = gridContent.length;
  const cols = gridContent[0].length;
  for (let i = 0; i < rows; i++) {
    const colCount = gridContent[i].length;
    if (colCount !== cols) {
      throw `Invalid grid format: unexpected column count on row ${i}`;
    }
  }

  // export grid templates
  return {
    rows: gridContent.length,
    cols: gridContent[0].length, // use the first row length to parse the rest of the row
    content: gridContent,
  }
}

/**
 * Functions for grid manipulation
 * @returns 
 */
export const fromTemplate = (template: GridTemplate) => {

}