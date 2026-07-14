export interface ValidationError {
  message: string;
  path: string[];
}

export let fastVal = {
  string: () => ({
    validate: (value: any, path: string[]): ValidationError[] => {
      if (typeof value !== 'string') {
        return [{ message: 'Value is not a string', path }];
      }

      return [];
    },
    __ref: null as any as string
  }),

  oneOf: <T extends string[]>(...values: T) => ({
    validate: (value: any, path: string[]): ValidationError[] => {
      if (!values.includes(value)) {
        return [{ message: `Value is not one of ${values.join(', ')}`, path }];
      }

      return [];
    },
    __ref: null as any as T[number]
  }),

  union: <T extends FastValValidationFunction[]>(...schemas: T) => ({
    validate: (value: any, path: string[]): ValidationError[] => {
      let errors: ValidationError[] = [];

      for (let schema of schemas) {
        let res = schema.validate(value, path);
        if (res.length == 0) return [];
        errors.push(...res);
      }

      return errors;
    },
    __ref: null as any as T[number]['__ref']
  }),

  number: () => ({
    validate: (value: any, path: string[]): ValidationError[] => {
      if (typeof value !== 'number') {
        return [{ message: 'Value is not a number', path }];
      }

      return [];
    },
    __ref: null as any as number
  }),

  boolean: () => ({
    validate: (value: any, path: string[]): ValidationError[] => {
      if (typeof value !== 'boolean') {
        return [{ message: 'Value is not a boolean', path }];
      }

      return [];
    },
    __ref: null as any as boolean
  }),

  object: <
    T extends {
      [key: string]: {
        validate: (value: any, path: string[]) => ValidationError[];
        __ref: any;
      };
    }
  >(
    schema?: T
  ) => ({
    validate: (value: any, path: string[]): ValidationError[] => {
      if (typeof value !== 'object') {
        return [{ message: 'Value is not an object', path }];
      }

      if (schema === undefined) return [];

      let errors: ValidationError[] = [];

      for (let key in schema) {
        errors.push(...schema[key].validate(value[key], [...path, key]));
      }

      return errors;
    },
    __ref: null as any as {
      [key in keyof T]: T[key]['__ref'];
    }
  }),

  record: <
    T extends {
      validate: (value: any, path: string[]) => ValidationError[];
      __ref: any;
    }
  >(
    schema: T
  ) => ({
    validate: (value: any, path: string[]): ValidationError[] => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return [{ message: 'Value is not a record', path }];
      }

      let errors: ValidationError[] = [];
      for (let key in value) {
        errors.push(...schema.validate(value[key], [...path, key]));
      }
      return errors;
    },
    __ref: null as any as Record<string, T['__ref']>
  }),

  array: <
    T extends {
      validate: (value: any, path: string[]) => ValidationError[];
      __ref: any;
    }
  >(
    schema: T
  ) => ({
    validate: (value: any, path: string[]): ValidationError[] => {
      if (!Array.isArray(value)) {
        return [{ message: 'Value is not an array', path }];
      }

      let errors: ValidationError[] = [];

      for (let i = 0; i < value.length; i++) {
        errors.push(...schema.validate(value[i], [...path, i.toString()]));
      }

      return errors;
    },
    __ref: null as any as T['__ref'][]
  }),

  any: () => ({
    validate: (value: any, path: string[]): ValidationError[] => {
      return [];
    },
    __ref: null as any
  }),

  optional: <
    T extends {
      validate: (value: any, path: string[]) => ValidationError[];
      __ref: any;
    }
  >(
    schema: T
  ) => ({
    validate: (value: any, path: string[]): ValidationError[] => {
      if (value === undefined) return [];

      return schema.validate(value, path);
    },
    __ref: null as any as T['__ref'] | undefined
  }),

  nullable: <
    T extends {
      validate: (value: any, path: string[]) => ValidationError[];
      __ref: any;
    }
  >(
    schema: T
  ) => ({
    validate: (value: any, path: string[]): ValidationError[] => {
      if (value === null) return [];

      return schema.validate(value, path);
    },
    __ref: null as any as T['__ref'] | null
  }),

  validate: <T extends FastValValidationFunction>(value: any, schema: T) => {
    let errors = schema.validate(value, []);
    if (errors.length == 0) return { ok: true as const, value: value as any as T['__ref'] };
    return { ok: false as const, errors };
  }
};

export type FastValValidationFunction<T = any> = {
  validate: (value: any, path: string[]) => ValidationError[];
  __ref: T;
};
