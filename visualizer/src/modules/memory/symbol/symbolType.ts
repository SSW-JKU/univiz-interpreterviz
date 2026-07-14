import { fastVal, ID } from '../../lib';
import { Variable, variableParamsValidator } from './variable';

export type SymbolTypeKind = 'atomic' | 'struct' | 'array';

let symbolTypeParamsValidator = fastVal.object({
  id: fastVal.number(),
  kind: fastVal.oneOf('atomic', 'struct', 'array'),
  name: fastVal.string(),
  line: fastVal.number(),
  arrayDepth: fastVal.optional(fastVal.number()),
  variables: fastVal.optional(fastVal.array(variableParamsValidator))
});

export type SymbolTypeParams = typeof symbolTypeParamsValidator.__ref;

export class SymbolType {
  public readonly id: string;
  public readonly name: string;
  public readonly kind: SymbolTypeKind;
  public readonly line: number;
  public readonly arrayDepth: number;
  public readonly variables: Variable[];
  public readonly version = 0;

  constructor(opts: Omit<SymbolTypeParams, 'variables'> & { variables: Variable[] }) {
    this.id = ID.symbolType.generateFrom(opts.id);
    this.kind = opts.kind;
    this.name = opts.name;
    this.line = opts.line;
    this.arrayDepth = Math.max(opts.arrayDepth ?? 0, 0);
    this.variables = opts.variables.map(variable =>
      variable instanceof Variable ? variable : new Variable(variable)
    );
  }

  static create(opts: SymbolTypeParams) {
    let res = fastVal.validate(opts, symbolTypeParamsValidator);
    if (!res.ok) throw new Error('Invalid symbol type params: ' + JSON.stringify(res.errors));

    return new SymbolType({
      ...opts,
      variables: (opts.variables ?? []).map(variable => Variable.create(variable))
    });
  }

  static getById(symbolTypes: Iterable<SymbolType>, id: number | string) {
    let sid = typeof id == 'number' ? ID.symbolType.generateFrom(id) : id;
    return Array.from(symbolTypes).find(
      symbolType => symbolType.id == sid || symbolType.name == sid
    );
  }
}
