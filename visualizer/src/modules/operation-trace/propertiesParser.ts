export let propertiesParser = (lines: string[]) => {
  let obj: Record<string, any> = {};

  for (let line of lines) {
    let [key, value] = line.split('=');
    if (!key || !value) continue;

    let v = value.trim();
    let k = key.trim();

    let kParts = k.split('.');
    let objVal = obj;
    for (let i = 0; i < kParts.length - 1; i++) {
      let part = kParts[i];
      if (!objVal[part]) objVal[part] = {};
      objVal = objVal[part];
    }

    let lastK = kParts[kParts.length - 1];

    let isTrue = v == 'true';
    if (isTrue || v == 'false') {
      objVal[lastK] = isTrue;
    } else if (v.startsWith('"')) {
      objVal[lastK] = v.slice(1, v.length - 1);
    } else {
      objVal[lastK] = parseFloat(v);
    }
  }

  return obj;
};
