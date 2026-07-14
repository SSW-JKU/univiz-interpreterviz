let createStringCounter = (min = 1, max = 1) => {
  let length = String(max).length;
  let n = min;

  return () => {
    let str = String(n++);
    return ' '.repeat(length - str.length) + str;
  };
};

export let highlightLine = (str: string, lineNo: number) => {
  let lines = str.split('\n');
  let counter = createStringCounter(1, lines.length);

  return lines
    .map((line, i) => `${i + 1 === lineNo ? `> ` : `  `} ${counter()} | ${line}`)
    .join('\n');
};
