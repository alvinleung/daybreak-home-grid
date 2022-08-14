export interface ShuffeableData<T> {
  importance: number;
  data: T
};
export const shuffleGridData = <T>(data: Array<ShuffeableData<T>>) => {
  const tiers: Array<T[]> = [];

  data.forEach((item) => {
    if (Math.round(item.importance) !== item.importance) {
      throw "importance must be an integer"
    }

    tiers[item.importance] = tiers[item.importance] || [];
    tiers[item.importance].push(item.data);
  })

  const shuffledData = tiers.map((data) => {
    return shuffle(data);
  });

  const flattenedData = shuffledData.flat() as T[];

  let readNext = 0;
  const next = () => {
    const selectedData = flattenedData[readNext];
    if (readNext < flattenedData.length - 1)
      readNext++;
    else
      readNext = 0;
    return selectedData;
  }

  return {
    data: flattenedData,
    next: next,
  }
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}