import { describe, expect, it } from 'vitest';
import { fastVal } from './fastValidation';

describe('fastVal', () => {
  describe('string', () => {
    it('should validate a string correctly', () => {
      const schema = fastVal.string();
      const result = schema.validate('test', []);
      expect(result).toEqual([]);
    });

    it('should return an error for non-string values', () => {
      const schema = fastVal.string();
      const result = schema.validate(123, []);
      expect(result).toEqual([{ message: 'Value is not a string', path: [] }]);
    });
  });

  describe('number', () => {
    it('should validate a number correctly', () => {
      const schema = fastVal.number();
      const result = schema.validate(123, []);
      expect(result).toEqual([]);
    });

    it('should return an error for non-number values', () => {
      const schema = fastVal.number();
      const result = schema.validate('test', []);
      expect(result).toEqual([{ message: 'Value is not a number', path: [] }]);
    });
  });

  describe('boolean', () => {
    it('should validate a boolean correctly', () => {
      const schema = fastVal.boolean();
      const result = schema.validate(true, []);
      expect(result).toEqual([]);
    });

    it('should return an error for non-boolean values', () => {
      const schema = fastVal.boolean();
      const result = schema.validate('test', []);
      expect(result).toEqual([{ message: 'Value is not a boolean', path: [] }]);
    });
  });

  describe('object', () => {
    it('should validate an object correctly', () => {
      const schema = fastVal.object({
        name: fastVal.string(),
        age: fastVal.number()
      });
      const result = schema.validate({ name: 'John', age: 30 }, []);
      expect(result).toEqual([]);
    });

    it('should return errors for invalid object properties', () => {
      const schema = fastVal.object({
        name: fastVal.string(),
        age: fastVal.number()
      });
      const result = schema.validate({ name: 123, age: 'test' }, []);
      expect(result).toEqual([
        { message: 'Value is not a string', path: ['name'] },
        { message: 'Value is not a number', path: ['age'] }
      ]);
    });
  });

  describe('array', () => {
    it('should validate an array correctly', () => {
      const schema = fastVal.array(fastVal.string());
      const result = schema.validate(['test1', 'test2'], []);
      expect(result).toEqual([]);
    });

    it('should return errors for invalid array elements', () => {
      const schema = fastVal.array(fastVal.string());
      const result = schema.validate(['test1', 123], []);
      expect(result).toEqual([{ message: 'Value is not a string', path: ['1'] }]);
    });
  });

  describe('any', () => {
    it('should validate any value correctly', () => {
      const schema = fastVal.any();
      const result = schema.validate('test', []);
      expect(result).toEqual([]);
    });
  });

  describe('optional', () => {
    it('should validate an optional value correctly', () => {
      const schema = fastVal.optional(fastVal.string());
      const result = schema.validate(undefined, []);
      expect(result).toEqual([]);
    });

    it('should validate a present optional value correctly', () => {
      const schema = fastVal.optional(fastVal.string());
      const result = schema.validate('test', []);
      expect(result).toEqual([]);
    });

    it('should return an error for invalid optional value', () => {
      const schema = fastVal.optional(fastVal.string());
      const result = schema.validate(123, []);
      expect(result).toEqual([{ message: 'Value is not a string', path: [] }]);
    });
  });

  describe('nullable', () => {
    it('should validate a nullable value correctly', () => {
      const schema = fastVal.nullable(fastVal.string());
      const result = schema.validate(null, []);
      expect(result).toEqual([]);
    });

    it('should validate a present nullable value correctly', () => {
      const schema = fastVal.nullable(fastVal.string());
      const result = schema.validate('test', []);
      expect(result).toEqual([]);
    });

    it('should return an error for invalid nullable value', () => {
      const schema = fastVal.nullable(fastVal.string());
      const result = schema.validate(123, []);
      expect(result).toEqual([{ message: 'Value is not a string', path: [] }]);
    });
  });

  describe('validate', () => {
    it('should validate a value against a schema correctly', () => {
      const schema = fastVal.string();
      const result = fastVal.validate('test', schema);
      expect(result).toEqual({ ok: true, value: 'test' });
    });

    it('should return errors for invalid value against a schema', () => {
      const schema = fastVal.string();
      const result = fastVal.validate(123, schema);
      expect(result).toEqual({
        ok: false,
        errors: [{ message: 'Value is not a string', path: [] }]
      });
    });
  });
});
