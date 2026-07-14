export type Unsubscribe = () => void;

export let combineUnsubscribes = (ubsub: Unsubscribe[]) => () => {
  for (let u of ubsub) u();
};
