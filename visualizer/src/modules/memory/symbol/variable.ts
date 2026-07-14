import { fastVal, ID } from '../../lib';

export let variableParamsValidator = fastVal.object({
  name: fastVal.string(),
  symbolTypeId: fastVal.union(fastVal.number(), fastVal.string()),
  address: fastVal.number(),
  initialValue: fastVal.optional(fastVal.number()),
  isParameter: fastVal.optional(fastVal.boolean())
});

export type VariableParams = typeof variableParamsValidator.__ref;

export class Variable {
  public readonly id: string;
  public readonly name: string;
  public readonly symbolTypeId: string;
  public readonly address: number;
  public readonly initialValue: number;
  public readonly isParameter: boolean;
  public readonly version = 0;

  constructor(opts: VariableParams) {
    this.id = ID.variable.generate();
    this.name = opts.name;
    this.symbolTypeId =
      typeof opts.symbolTypeId == 'number'
        ? ID.symbolType.generateFrom(opts.symbolTypeId)
        : opts.symbolTypeId;
    this.address = Math.max(opts.address, 0);
    this.initialValue = opts.initialValue ?? 0;
    this.isParameter = !!opts.isParameter;
  }

  static create(opts: VariableParams) {
    let res = fastVal.validate(opts, variableParamsValidator);
    if (!res.ok) throw new Error('Invalid variable params: ' + JSON.stringify(res.errors));
    return new Variable(opts);
  }
}
