import { describe, expect, it } from 'vitest';
import { fastVal } from '../../lib';
import { Variable, VariableParams, variableParamsValidator } from './variable';

describe('Variable', () => {
  it('should create a Variable instance with valid parameters', () => {
    const params: VariableParams = {
      name: 'testVar',
      symbolTypeId: 1,
      address: 100,
      initialValue: 42,
      isParameter: true
    };

    const variable = Variable.create(params);

    expect(variable.name).toBe('testVar');
    expect(variable.address).toBe(100);
    expect(variable.initialValue).toBe(42);
    expect(variable.isParameter).toBe(true);
    expect(variable.version).toBe(0);
  });

  it('should set default values for optional parameters', () => {
    const params: VariableParams = {
      name: 'testVar',
      symbolTypeId: 'custom-symbol',
      address: 50,
      initialValue: 0,
      isParameter: false
    };

    const variable = Variable.create(params);

    expect(variable.name).toBe('testVar');
    expect(variable.address).toBe(50);
    expect(variable.initialValue).toBe(0);
    expect(variable.isParameter).toBe(false);
    expect(variable.version).toBe(0);
  });

  it('should validate parameters using fastVal', () => {
    const params: VariableParams = {
      name: 'testVar',
      symbolTypeId: 1,
      address: 100,
      initialValue: 42,
      isParameter: true
    };

    const validationResult = fastVal.validate(params, variableParamsValidator);
    expect(validationResult.ok).toBe(true);
  });
});
