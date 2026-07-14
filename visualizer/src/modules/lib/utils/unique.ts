export let unique = <T>(arr: T[], eq?: (a: T, b: T) => boolean) => {
  let result = [];

  for (let i = 0; i < arr.length; i++) {
    let found = false;

    if (eq) {
      for (let j = 0; j < result.length; j++) {
        if (eq(arr[i], result[j])) {
          found = true;
          break;
        }
      }
    } else {
      found = result.includes(arr[i]);
    }

    if (!found) result.push(arr[i]);
  }

  return result;
};
