import { entrySizeAtom, regionWidthAtom } from './settings';

export const WRAPPER_PADDING = 20;

// export const REGION_WIDTH = 150;
export const REGION_HEADER_HEIGHT = -5; // 36;
export const REGION_PADDING = 10;
export const REGION_GAP = 20;

export const POINTER_HEIGHT = 20;
export const POINTER_GAP = 6;

export const METHOD_HEADER_HEIGHT = 30;

export const FIELD_REGION_HEADER = 30;

export const BYTECODE_GAP = 10;
export const BYTECODE_HEIGHT = 30;

export const ENTRY_HEIGHT_SMALL = 25;
export const ENTRY_HEIGHT_LARGE = 50;

export const ENTRY_GAP_LARGE = 10;
export const ENTRY_GAP_SMALL = 5;

// export const ENTRY_WIDTH = REGION_WIDTH - 2 * REGION_PADDING;
export const ENTRY_FIELD_INSET = 12;

export const ENTRY_COLLAPSED_HEIGHT = 30;

export let getRegionWidth = () => regionWidthAtom.get();

export let getEntryWidth = () => getRegionWidth() - 2 * REGION_PADDING;

export let getEntryHeight = () =>
  entrySizeAtom.get() == 'small' ? ENTRY_HEIGHT_SMALL : ENTRY_HEIGHT_LARGE;

export let getEntryGap = () =>
  entrySizeAtom.get() == 'small' ? ENTRY_GAP_SMALL : ENTRY_GAP_LARGE;
