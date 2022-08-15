import { createInfiniteGrid } from "./daybreak-grid/gird";
import { createGridTemplate } from "./daybreak-grid/gridTemplate";
import { ShuffeableData, shuffleGridData } from "./daybreak-grid/shuffleGridData";


interface ProjectData {
  importance: number;
  cover: string[];
  name: string;
  description: string;
  year: string;
  expertise: string[]
}

interface ProjectCellData {
  importance: number;
  cover: string;
  name: string;
  description: string;
  year: string;
  expertise: string[]
}



const CELL_EMPTY = "empty";
const CELL_PROJECT = "project";


// alias for project and empty cells
const _ = CELL_EMPTY;
const X = CELL_PROJECT;

const gridTemplates = [
  createGridTemplate([
    [_, X, _, X, X, _, _, X],
    [X, _, X, _, _, _, X, _],
    [_, X, _, _, X, _, X, _],
    [X, _, X, _, X, X, _, X],
    [_, _, _, X, _, _, X, _],
    [X, _, X, _, X, _, _, X],
    [_, X, _, X, _, _, X, _],
    [X, _, _, _, X, _, _, X],
    [X, _, X, _, _, X, _, _],
  ]),
  createGridTemplate([
    [X, _, _, X, X, _, _, X],
    [_, _, X, _, _, _, X, _],
    [_, X, _, _, X, _, X, _],
    [X, _, X, _, X, X, _, X],
    [_, _, _, X, _, _, X, _],
    [X, _, X, _, _, _, _, X],
    [_, X, _, X, _, _, X, _],
    [X, _, _, _, X, _, _, X],
    [X, _, X, _, _, X, _, _],
  ]),
]

const allProjectsData: ProjectData[] = [
  {
    importance: 0,
    cover: [
      "https://uploads-ssl.webflow.com/62997260adfee40c8c586a19/62ab5f069babcfe42d9fd420_Frame%20481941.png",
      "https://uploads-ssl.webflow.com/62997260adfee40c8c586a19/62ab5f069babcfe42d9fd420_Frame%20481941.png"
    ],
    name: "Inspired",
    description: "Unifying brands and consumers",
    year: "2022",
    expertise: ["Brand Identity", "Strategy", "Product"]
  },
  {
    importance: 0,
    cover: ["https://uploads-ssl.webflow.com/62997260adfee40c8c586a19/62ab5f069babcfe42d9fd420_Frame%20481941.png"],
    name: "Party Round",
    description: "An automated fundraising tool.",
    year: "2022",
    expertise: ["Brand Identity", "Web Design"]
  },
  {
    importance: 0,
    cover: ["https://uploads-ssl.webflow.com/62997260adfee40c8c586a19/62ab5f069babcfe42d9fd420_Frame%20481941.png"],
    name: "Prologue",
    description: "The tech holding company of the 2020s.",
    year: "2022",
    expertise: ["Brand Identity", "Naming", "Strategy"]
  },
  {
    importance: 1,
    cover: ["https://uploads-ssl.webflow.com/62997260adfee40c8c586a19/62ab5f069babcfe42d9fd420_Frame%20481941.png"],
    name: "Wombo Dream",
    description: "High-quality artwork created in seconds.",
    year: "2022",
    expertise: ["Expertise", "Expertise"]
  },

  {
    importance: 1,
    cover: ["https://uploads-ssl.webflow.com/62997260adfee40c8c586a19/62ab5f069babcfe42d9fd420_Frame%20481941.png"],
    name: "Hyper",
    description: "Serving the next generation of founders.",
    year: "2022",
    expertise: ["Web Design"]
  },
  {
    importance: 2,
    cover: ["https://uploads-ssl.webflow.com/62997260adfee40c8c586a19/62ab5f069babcfe42d9fd420_Frame%20481941.png"],
    name: "Party Grounds",
    description: "Description for Party Grounds.",
    year: "2022",
    expertise: ["Web Design"]
  },
  {
    importance: 2,
    cover: ["https://uploads-ssl.webflow.com/62997260adfee40c8c586a19/62ab5f069babcfe42d9fd420_Frame%20481941.png"],
    name: "Notes About People",
    description: "For your mind and the people in your life.",
    year: "2020",
    expertise: ["Product Design", "Visual Identity"]
  },
  {
    importance: 2,
    cover: ["https://uploads-ssl.webflow.com/62997260adfee40c8c586a19/62ab5f069babcfe42d9fd420_Frame%20481941.png"],
    name: "Startup Supreme",
    description: "Wearing digital nostaglia.",
    year: "2021",
    expertise: ["Brand Identity", "Web Design"]
  },
  {
    importance: 2,
    cover: ["https://uploads-ssl.webflow.com/62997260adfee40c8c586a19/62ab5f069babcfe42d9fd420_Frame%20481941.png"],
    name: "VC Puzzle",
    description: "A Shrug x Party Round collaboration.",
    year: "2022",
    expertise: ["Brand Identity", "Web Design", "Packaging Design"]
  },
  {
    importance: 1,
    cover: ["https://uploads-ssl.webflow.com/62997260adfee40c8c586a19/62ab5f069babcfe42d9fd420_Frame%20481941.png"],
    name: "Workweek",
    description: "Putting creators first.",
    year: "2021",
    expertise: ["Brand Identity", "Web Design"]
  }
]

// data with multiple images
const cellData = allProjectsData.reduce((arr, currProject) => {
  currProject.cover.forEach((coverImageUrl) => {
    arr.push({
      ...currProject, cover: coverImageUrl
    })
  })

  return arr;
}, [] as ProjectCellData[])

const cellDataShuffled = shuffleGridData(cellData.reduce((arr, curr) => {
  arr.push({ importance: curr.importance, data: curr });
  return arr
}, [] as ShuffeableData<ProjectCellData>[]));



window.addEventListener("load", () => {

  const cleanupInfiniteGrid = createInfiniteGrid({
    cols: 8,
    templates: gridTemplates,
    baseElm: document.querySelector(".daybreak-grid") as HTMLDivElement,
    renderCell: (cellInfo) => {

      cellInfo.elm.style.height = "100px";

      // for empty cells
      if (cellInfo.type === CELL_EMPTY) {
        cellInfo.elm.innerHTML = "empty";
        cellInfo.elm.style.opacity = ".2";
        return;
      }

      const celldata = cellDataShuffled.next();
      cellInfo.elm.innerHTML = celldata.name;
      cellInfo.onUpdate(() => {
        console.log("update")
      })

      // cleanup
      return () => {

      }
    }
  });
})
