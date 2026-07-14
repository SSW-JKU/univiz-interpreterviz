export let isElementMountedToDom = (element: Element) => {
  return document.body.contains(element) && element.isConnected;
};
