export let dedent = (input: string) => {
  let lines = input.split('\n');

  let minIndent = Math.min(
    ...lines.filter(line => line.trim()).map(line => line.match(/^\s*/)![0].length)
  );

  return lines.map(line => line.slice(minIndent)).join('\n');
};
