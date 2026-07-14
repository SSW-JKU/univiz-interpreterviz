import { SerializedFunction, SerializedVariable } from '../../../memory';
import { parsedVizspec } from '../../vizspec';
import { AnimatedRegion } from '../plan/animationStateManager';
import { EnrichedSnapshot } from './normalize/operationSnapshot';

/**
 * Add symbol information (variable info & function info) to entries
 */
export let getAnimatedRegionWithSymbolInfo = (
  region: AnimatedRegion,
  operation: EnrichedSnapshot
) => {
  let currentFunction: SerializedFunction | undefined;
  let functions = [...region.functions];
  let functionStartAddress: number | undefined;

  return {
    ...region,

    entries: region.entries.map(entry => {
      let functionIdx = functions.findIndex(f => f.id == entry.functionId);
      if (functionIdx != -1) {
        currentFunction = { ...functions[functionIdx] };
        functions.splice(functionIdx, 1);
        let firstLocal = currentFunction.locals.sort((a, b) => a.address - b.address)[0];

        functionStartAddress = entry.address.main + (firstLocal?.address ?? 0) + 1; // entry.address + 1
      }

      let variable: SerializedVariable | undefined;
      let isGlobal = false;
      if (currentFunction) {
        variable = currentFunction.locals
          .sort((a, b) => b.address - a.address)
          .find(l => l.address <= entry.address.main - functionStartAddress!);

        currentFunction.locals = currentFunction.locals.filter(
          l => l.address != variable?.address
        );
      } else {
        variable = region.globals.find(g => g.address == entry.address.main);
        if (variable) isGlobal = true;
      }

      let symbolType = operation.previousOperationSnapshot.symbolTypes.find(
        s => s.id == entry.symbolTypeId
      );

      return {
        ...entry,

        isGlobal,
        variable,
        symbolType,
        functionStartAddress,
        function: currentFunction,
        isFunctionStart: functionIdx != -1,

        type: parsedVizspec.declarations.type[entry.typeId]
      };
    })
  };
};

export type AnimatedRegionWithSymbolInfo = ReturnType<typeof getAnimatedRegionWithSymbolInfo>;
