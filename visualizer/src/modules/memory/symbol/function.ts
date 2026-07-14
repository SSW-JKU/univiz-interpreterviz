import { fastVal, ID } from '../../lib';
import { MemoryError } from '../lib';
import { Variable } from './variable';

export let openFunctionValidation = fastVal.object({
  name: fastVal.string(),
  line: fastVal.number(),
  locals: fastVal.array(
    fastVal.object({
      name: fastVal.string(),
      address: fastVal.number(),
      initialValue: fastVal.number(),
      isParameter: fastVal.optional(fastVal.boolean()),
      symbolTypeId: fastVal.union(fastVal.string(), fastVal.number())
    })
  ),
  localsStartOffset: fastVal.optional(fastVal.number())
});

export type OpenFunctionParams = (typeof openFunctionValidation)['__ref'];

interface FunctionParams {
  name: string;
  line: number;
  locals: Variable[];
  startAddress: number;
  localsStartOffset: number;
}

export class Function {
  public readonly name: string;
  public readonly id: string;
  public readonly line: number;
  public readonly locals: Variable[];
  public readonly startAddress: number;
  public readonly localsStartOffset: number;
  public readonly version = 0;

  constructor(opts: FunctionParams) {
    this.id = ID.function.generate();
    this.name = opts.name;
    this.line = opts.line;
    this.locals = opts.locals;
    this.startAddress = opts.startAddress;
    this.localsStartOffset = opts.localsStartOffset;
  }
}

export class FunctionManager {
  private funcs: Map<string, Function>;
  private funcStack: string[];

  constructor() {
    this.funcs = new Map();
    this.funcStack = [];
  }

  public openInternal(opts: FunctionParams) {
    let func = new Function(opts);
    this.funcs.set(func.id, func);
    this.funcStack.push(func.id);
    return func;
  }

  public close() {
    let funcId = this.funcStack.pop();
    if (!funcId) {
      // throw new MemoryError('No func to close');
      return;
    }

    let func = this.funcs.get(funcId);
    if (!func) {
      throw new MemoryError('Function not found');
    }

    return func;
  }

  public open(opts: OpenFunctionParams, startAddress: number) {
    let res = fastVal.validate(opts, openFunctionValidation);
    if (!res.ok)
      throw new MemoryError('Invalid function params: ' + JSON.stringify(res.errors));

    return this.openInternal({
      startAddress,
      name: res.value.name,
      line: res.value.line,
      locals: res.value.locals.map(v => Variable.create(v)),
      localsStartOffset: res.value.localsStartOffset ?? 0
    });
  }

  public getCurrent() {
    let funcId = this.funcStack[this.funcStack.length - 1];
    if (!funcId) return null;

    return this.funcs.get(funcId) ?? null;
  }

  public listFunctions() {
    return Array.from(this.funcs.values());
  }

  public getVariableAtAddress(address: number) {
    for (let fid of this.funcStack) {
      let func = this.funcs.get(fid);
      if (!func) continue;

      let localAddress = address - (func.startAddress + func.localsStartOffset);

      let local = func.locals.find(local => local.address == localAddress);
      if (local) return local;
    }
  }
}
