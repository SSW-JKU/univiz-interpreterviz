export let base64ToArrayBuffer = (base64: string) => {
  let binaryString = atob(base64);
  let len = binaryString.length;

  let bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};
