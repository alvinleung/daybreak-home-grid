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

function readProjectDataFromHTML() {
  const baseElm = document.querySelector(".all-daybreak-projects") as HTMLDivElement;
  const allProjects = baseElm.querySelectorAll(".daybreak-project");
  const projectData = Array.from(allProjects).map((projectElm) => {
    const importanceElm = projectElm.querySelector(".daybreak-project-importance") as HTMLDivElement;
    const nameElm = projectElm.querySelector(".daybreak-project-name") as HTMLDivElement;
    const descriptionElm = projectElm.querySelector(".daybreak-project-description") as HTMLDivElement;
    const yearElm = projectElm.querySelector(".daybreak-project-year") as HTMLDivElement;
    const expertiseElm = projectElm.querySelector(".daybreak-project-expertise") as HTMLDivElement;
    const coverElm = projectElm.querySelector(".daybreak-project-cover") as HTMLDivElement;

    const importance = parseInt(importanceElm.innerHTML);
    const name = nameElm.innerHTML;
    const description = descriptionElm.innerHTML;
    const year = yearElm.innerHTML;
    const expertise = expertiseElm.innerHTML.split(",").map((str) => str.trim());
    const cover = Array.from(coverElm.children).map((elm) => (elm as HTMLImageElement).src);

    return {
      importance, name, description, year, expertise, cover,
    }
  })

  return projectData;
}



// function createProjectDOM(project: ProjectData) {
//   const container = document.createElement("div");
//   container.classList.add("daybreak-project");

//   const name = document.createElement("div");
//   name.innerHTML = project.name;
//   name.classList.add("daybreak-project-name");

//   const description = document.createElement("div");
//   description.innerHTML = project.description;
//   description.classList.add("daybreak-project-description");

//   const year = document.createElement("div");
//   year.innerHTML = project.year;
//   year.classList.add("daybreak-project-year");

//   const expertise = document.createElement("div");
//   expertise.innerHTML = project.expertise.reduce((prev, curr) => prev + `<div>${curr}</div>`, "")
//   expertise.classList.add("daybreak-project-expertise");

//   const cover = document.createElement("div");
//   cover.innerHTML = project.cover.reduce((prev, curr) => prev + `<img src="${curr}"/>`, "")
//   cover.classList.add("daybreak-project-cover");

//   container.appendChild(name);
//   container.appendChild(description);
//   container.appendChild(year);
//   container.appendChild(expertise);
//   container.appendChild(cover);

//   return container;
// }

// const projectDom = allProjectsData.map((project) => createProjectDOM(project));
// projectDom.forEach((elm) => {
//   document.body.appendChild(elm);
// })



window.addEventListener("load", () => {
  const projectDataFromHTML = readProjectDataFromHTML();

  // data with multiple images
  const cellData = projectDataFromHTML.reduce((arr, currProject) => {
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
