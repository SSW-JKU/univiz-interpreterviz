interface ArrowPosition {
  source: number;
  destination: number;
  xPosition: number;
  color: string;
}

interface Arrow {
  source: number;
  destination: number;
}

let colors = [
  '#4269d0',
  '#efb118',
  '#ff725c',
  '#6cc5b0',
  '#3ca951',
  '#ff8ab7',
  '#a463f2',
  '#97bbf5',
  '#9c6b4e',
  '#9498a0'
];

export let positionArrows = (arrows: Arrow[]): ArrowPosition[] => {
  let normalizedArrows = arrows.map(
    arrow =>
      [
        arrow,
        {
          source: Math.min(arrow.source, arrow.destination),
          destination: Math.max(arrow.source, arrow.destination)
        }
      ] as [Arrow, Arrow]
  );

  let sortedArrows = normalizedArrows.sort((a, b) => {
    let aSource = a[1].source;
    let bSource = b[1].source;

    if (aSource === bSource) {
      return b[1].destination - a[1].destination;
    }

    return aSource - bSource;
  });
  let positionedArrows: [Arrow, Arrow, number][] = [];

  for (let [inner, normalized] of sortedArrows) {
    let xPosition = 0;

    while (
      positionedArrows.some(
        positionedArrow =>
          positionedArrow[1].source <= normalized.source &&
          positionedArrow[1].destination >= normalized.source &&
          positionedArrow[2] === xPosition
      )
    ) {
      xPosition++;
    }

    positionedArrows.push([inner, normalized, xPosition]);
  }

  return positionedArrows.map(([inner, _, xPosition]) => ({
    source: inner.source,
    destination: inner.destination,
    xPosition,
    color: colors[xPosition % colors.length]
  }));
};
