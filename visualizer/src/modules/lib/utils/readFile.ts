export let readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      let content = reader.result as string;
      resolve(content);
    };

    reader.onerror = reject;

    reader.readAsText(file);
  });

export let readFileAsArrayBuffer = (file: File) => file.arrayBuffer();
