export let joinStringWithAnd = (strings: (string | number | boolean)[]) =>
  strings.reduce((acc, str, i) => {
    if (i === 0) return str;
    return acc + (i === strings.length - 1 ? ` and ${str}` : `, ${str}`);
  }, '');
