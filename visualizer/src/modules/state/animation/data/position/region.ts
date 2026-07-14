import {
  ENTRY_COLLAPSED_HEIGHT,
  ENTRY_FIELD_INSET,
  FIELD_REGION_HEADER,
  getEntryGap,
  getEntryHeight,
  getEntryWidth,
  getRegionWidth,
  METHOD_HEADER_HEIGHT,
  REGION_GAP,
  REGION_HEADER_HEIGHT,
  REGION_PADDING,
  WRAPPER_PADDING
} from '../../../const';
import { getCollapsedChildEntriesThreshold } from '../../../settings';
import { EnrichedSnapshot } from '../normalize/operationSnapshot';
import { sortEntries } from '../normalize/sortEntries';
import { AnimatedRegionWithSymbolInfo } from '../symbolInfo';
import { applyPointerDiffs, setPointerPositions } from './pointer';
import { PositionManager } from './positionManager';

/**
 * Calculate positions for entries and pointers in region
 */
export let setPositions = (
  region: AnimatedRegionWithSymbolInfo,
  operation: EnrichedSnapshot,
  state: {
    expanded: string[];
    index: number;
  }
) => {
  let orientation: 'horizontal' | 'vertical' = 'vertical';
  let sizeMultiplier = orientation == 'vertical' ? getEntryHeight() : getEntryWidth();

  let getPosition = (
    opts1: { offset: number; inset?: number; size?: number },
    opts2?: { offset?: number; inset?: number; size?: number }
  ) => {
    let opts = { ...opts1, ...opts2 };

    return {
      [orientation == 'vertical' ? 'top' : 'left']: opts.offset,
      [orientation == 'vertical' ? 'left' : 'top']: opts.inset ?? 0,
      [orientation == 'vertical' ? 'height' : 'width']: opts.size ?? sizeMultiplier,
      [orientation == 'vertical' ? 'width' : 'height']:
        (orientation == 'vertical' ? getEntryWidth() : getEntryHeight()) -
        (opts.inset ?? 0) * 2
    } as {
      top: number;
      left: number;
      height: number;
      width: number;
    };
  };

  let sortedEntriesWithFieldEntries = sortEntries(region.entries);

  let sortedEntries = sortedEntriesWithFieldEntries.filter(e => e.fieldKind != 'field_entry');

  let fieldEntriesByFieldRegion = sortedEntriesWithFieldEntries.reduce((map, entry) => {
    if (entry.fieldKind != 'field_entry') return map;

    let entries = map.get(entry.fieldRegionEntryId) ?? [];
    entries.push(entry);
    map.set(entry.fieldRegionEntryId, entries);

    return map;
  }, new Map<string, AnimatedRegionWithSymbolInfo['entries']>());

  let positionManager = new PositionManager(REGION_HEADER_HEIGHT + REGION_PADDING);
  let hiddenEntriesCount = 0;

  let hasCollapsedRef = { current: false };

  let entries: (AnimatedRegionWithSymbolInfo['entries'][number] & {
    position: {
      top: number;
      left: number;
      height: number;
      width: number;
    };
    isCollapsable?: boolean;
    isCollapsed?: boolean;
    fieldParentEntryId?: string;
  })[] = sortedEntries.flatMap((entry, i) => {
    let entryPosition = positionManager.add({
      main: entry.address.main - hiddenEntriesCount,
      slice: entry.address.slice
    });

    // Reserve space for method header
    if (entry.isFunctionStart) entryPosition.addOffsetBefore(METHOD_HEADER_HEIGHT);

    if (!entry.fieldKind || entry.fieldKind == 'none') {
      entryPosition.addOffsetAfter(getEntryGap()); // Add gap after
      entryPosition.setSize(sizeMultiplier);

      return {
        ...entry,
        position: getPosition(entryPosition.position)
      };
    }

    let children = sortEntries(fieldEntriesByFieldRegion.get(entry.id) ?? []);

    let isCollapsed = false;
    let isCollapsable = children.length > getCollapsedChildEntriesThreshold();

    let shownChildren = children;
    if (
      isCollapsable &&
      !state.expanded.includes(entry.id) &&
      !state.expanded.includes(entry.fieldsMemoryRegionId!)
    ) {
      shownChildren = children.slice(0, getCollapsedChildEntriesThreshold());
      isCollapsed = true;
    }

    let positionedChildren = shownChildren.map((child, i) => {
      let entryPosition = positionManager.add({
        main: child.address.main - hiddenEntriesCount,
        slice: child.address.slice
      });

      let isLast = i == shownChildren.length - 1;
      let isFirst = child.address.main == entry.address.main && child.address.slice == 0;

      entryPosition.addOffsetAfter(getEntryGap());
      entryPosition.setSize(sizeMultiplier);

      if (isFirst) entryPosition.addOffsetBefore(FIELD_REGION_HEADER);
      if (isLast) {
        entryPosition.addOffsetAfter(ENTRY_FIELD_INSET);
        if (isCollapsable) entryPosition.addOffsetAfter(ENTRY_COLLAPSED_HEIGHT);
      }

      let position = getPosition(entryPosition.position, { inset: ENTRY_FIELD_INSET });

      return {
        ...child,
        position
      };
    });

    // CAREFUL: We need to set the size of the parent entry after we've added all the children
    entryPosition.setSize(positionManager.nextOffset - entryPosition.offset - getEntryGap());

    if (isCollapsed) hasCollapsedRef.current = true;

    return [
      {
        ...entry,
        isCollapsable,
        isCollapsed,
        position: getPosition(entryPosition.position)
      },
      ...positionedChildren.map(
        child =>
          ({
            ...child,
            fieldParentEntryId: entry.id
          }) as any
      )
    ];
  }) as any;

  let maxAddress = hasCollapsedRef.current
    ? Math.max(0, ...entries.map(e => e.address.main))
    : Infinity;

  let pointersBefore = setPointerPositions({
    region,
    operation,
    marginTop: REGION_HEADER_HEIGHT + 10,
    positionManager,
    maxAddress
  });
  let pointersAfter = setPointerPositions({
    region: applyPointerDiffs(region, operation),
    operation,
    marginTop: REGION_HEADER_HEIGHT + 10,
    positionManager,
    maxAddress
  });

  let changedPointers = operation.diff?.pointers.filter(([_, p]) =>
    region.pointers.some(rp => rp.id == p.id && rp.address != p.address)
  );

  let pointersAfterSnapshots = changedPointers
    ?.sort((a, b) => {
      let aBefore = region.pointers.find(p => p.id == a[1].id);
      let bBefore = region.pointers.find(p => p.id == b[1].id);

      let aAdrBefore = aBefore?.address ?? 0;
      let bAdrBefore = bBefore?.address ?? 0;

      let aAdr = a[1].address;
      let bAdr = b[1].address;

      let movedUpwards = aAdr <= aAdrBefore && bAdr <= bAdrBefore;
      if (movedUpwards) return aAdr - bAdr;

      return bAdr - aAdr;
    })
    .map((_, index) => {
      let only = changedPointers!.slice(0, index + 1).map(([_, p]) => p.id);

      return setPointerPositions({
        region: applyPointerDiffs(region, operation, only),
        operation,
        marginTop: REGION_HEADER_HEIGHT + 10,
        positionManager,
        maxAddress
      });
    });

  return {
    ...region,
    width: getRegionWidth(),
    height: 'auto',
    position: {
      width: getRegionWidth() + REGION_GAP,
      top: WRAPPER_PADDING,
      height: `calc(100% - ${WRAPPER_PADDING}px)`,
      left: WRAPPER_PADDING + state.index * (REGION_GAP + getRegionWidth()) - REGION_GAP / 2,

      scrollHeight: Math.max(...entries.map(e => e.position.top + e.position.height)) + 100
    },
    flags: {
      pointersChanged: !!changedPointers?.length
    },
    pointers: {
      before: pointersBefore,
      after: pointersAfter,
      pointersAfterSnapshots
    },
    entries
  };
};

export type RegionEntryState = ReturnType<typeof setPositions>;
export type PositionEntry = RegionEntryState['entries'][0];
