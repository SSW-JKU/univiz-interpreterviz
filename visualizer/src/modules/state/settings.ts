import { atom, computed, persistent } from '../lib';

let codeBarWidthAtom = persistent('codeBarWidth', 400);
let showAllBytecodeAtom = persistent('showAllBytecode', false);
let hidePointersAtom = persistent('hidePointers', true);
let showLogsAtom = atom(false);
let animationMultiplierValueAtom = persistent('animationMultiplier', 1);
let animationMultiplierAtom = computed(animationMultiplierValueAtom, v =>
  parseFloat((1 / v).toFixed(2))
);
let collapseStructuresAtom = persistent('collapseStructures', true);
let collapseStructureSizeAtom = persistent('collapseStructureSize', 5);

export let getCollapsedChildEntriesThreshold = () =>
  collapseStructuresAtom.get() ? collapseStructureSizeAtom.get() : Infinity;

export let entrySizeAtom = persistent<'small' | 'large'>('entrySize', 'large');
export let entryNameAtom = persistent<'symbolic' | 'numeric'>('entryName', 'symbolic');
export let regionWidthAtom = persistent('regionWidth', 350);

export let getCodeBarWidth = () => codeBarWidthAtom.get();

export let useSettings = () => {
  let [showAllBytecode, setShowAllBytecode] = showAllBytecodeAtom.use();
  let [showLogs, setShowLogs] = showLogsAtom.use();
  let [animationMultiplierValue, setAnimationMultiplierValue] =
    animationMultiplierValueAtom.use();
  let [animationMultiplier] = animationMultiplierAtom.use();
  let [codeBarWidth, setCodeBarWidth] = codeBarWidthAtom.use();
  let [hidePointers, setHidePointers] = hidePointersAtom.use();
  let [entrySize, setEntrySize] = entrySizeAtom.use();
  let [entryName, setEntryName] = entryNameAtom.use();
  let [collapseStructures, setCollapseStructures] = collapseStructuresAtom.use();
  let [collapseStructureSize, setCollapseStructureSize] = collapseStructureSizeAtom.use();
  let [regionWidth, setRegionWidth] = regionWidthAtom.use();

  return {
    showAllBytecode,
    setShowAllBytecode,

    showLogs,
    setShowLogs,

    codeBarWidth,
    setCodeBarWidth,

    animationMultiplier,
    animationMultiplierValue,
    setAnimationMultiplierValue,

    hidePointers,
    setHidePointers,

    entrySize,
    setEntrySize,

    entryName,
    setEntryName,

    collapseStructures,
    setCollapseStructures,

    collapseStructureSize,
    setCollapseStructureSize,

    regionWidth,
    setRegionWidth
  };
};
