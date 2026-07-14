export type EntryTypeKind = 'pointer' | 'array' | 'object' | 'memory';

export interface EntryTypeParams {
  identifier: string;
  name: string;
  hasFields?: boolean;
  fieldSize?: number;
  kind: EntryTypeKind;
  region?: string;
}

export class EntryType {
  public readonly identifier: string;
  public readonly name: string;
  public readonly hasFields: boolean;
  public readonly fieldSize: number = 4;
  public readonly kind: EntryTypeKind;
  public readonly region?: string;

  constructor(opts: EntryTypeParams) {
    if (opts.kind == 'pointer' && !opts.region) {
      throw new Error('Pointer type must have a region');
    }

    if (opts.hasFields && !opts.fieldSize) {
      throw new Error('Field size must be provided for types with fields');
    }

    if (opts.hasFields && opts.kind != 'object' && opts.kind != 'array') {
      throw new Error('Only object and array types can have fields');
    }

    this.identifier = opts.identifier;
    this.name = opts.name;
    this.hasFields = !!opts.hasFields;
    this.kind = opts.kind;
    this.region = opts.region;

    if (opts.fieldSize) {
      this.fieldSize = opts.fieldSize;
    }
  }
}
