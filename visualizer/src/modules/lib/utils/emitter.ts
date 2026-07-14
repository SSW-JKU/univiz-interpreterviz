export let createEmitter = <T>() => {
  let listeners = new Set<(value: T) => void>();

  return {
    subscribe: (listener: (value: T) => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    publish: (value: T) => {
      for (let listener of listeners) {
        listener(value);
      }
    }
  };
};
