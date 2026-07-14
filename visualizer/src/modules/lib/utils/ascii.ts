export let isAscii = (value: number) => value >= 32 && value <= 126;

export let toAscii = (value: number) => (isAscii(value) ? String.fromCharCode(value) : '.');
