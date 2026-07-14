import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryError } from '../lib/error';
import { Function, FunctionManager, OpenFunctionParams } from './function';
import { Variable } from './variable';

describe('FunctionManager', () => {
  let functionManager: FunctionManager;

  beforeEach(() => {
    functionManager = new FunctionManager();
  });

  it('should open a function and add it to the stack', () => {
    let params: OpenFunctionParams = {
      name: 'testFunction',
      line: 1,
      localsStartOffset: 0,
      locals: [
        {
          name: 'localVar',
          address: 0,
          initialValue: 0,
          symbolTypeId: 'int',
          isParameter: false
        }
      ]
    };
    let startAddress = 100;

    let func = functionManager.open(params, startAddress);

    expect(func).toBeInstanceOf(Function);
    expect(func.name).toBe('testFunction');
    expect(func.line).toBe(1);
    expect(func.startAddress).toBe(startAddress);
    expect(func.locals.length).toBe(1);
    expect(functionManager.getCurrent()).toBe(func);
  });

  it('should close the current function', () => {
    let params: OpenFunctionParams = {
      name: 'testFunction',
      line: 1,
      localsStartOffset: 0,
      locals: [
        {
          name: 'localVar',
          address: 0,
          initialValue: 0,
          symbolTypeId: 'int',
          isParameter: false
        }
      ]
    };
    let startAddress = 100;

    functionManager.open(params, startAddress);
    let closedFunc = functionManager.close();

    expect(closedFunc).toBeInstanceOf(Function);
    expect(functionManager.getCurrent()).toBeNull();
  });

  it('should throw an error when closing a function if no function is open', () => {
    expect(() => functionManager.close()).toThrow(MemoryError);
  });

  it('should list all opened functions', () => {
    let params1: OpenFunctionParams = {
      name: 'function1',
      line: 1,
      localsStartOffset: 0,
      locals: [
        {
          name: 'localVar1',
          address: 0,
          initialValue: 0,
          symbolTypeId: 'int',
          isParameter: false
        }
      ]
    };
    let params2: OpenFunctionParams = {
      name: 'function2',
      line: 2,
      localsStartOffset: 0,
      locals: [
        {
          name: 'localVar2',
          address: 1,
          initialValue: 1,
          symbolTypeId: 'int',
          isParameter: false
        }
      ]
    };
    let startAddress1 = 100;
    let startAddress2 = 200;

    functionManager.open(params1, startAddress1);
    functionManager.open(params2, startAddress2);

    let functions = functionManager.listFunctions();

    expect(functions.length).toBe(2);
    expect(functions[0].name).toBe('function1');
    expect(functions[1].name).toBe('function2');
  });

  it('should get a variable at a specific address', () => {
    let params: OpenFunctionParams = {
      name: 'testFunction',
      line: 1,
      localsStartOffset: 0,
      locals: [
        {
          name: 'localVar',
          address: 0,
          initialValue: 0,
          symbolTypeId: 'int',
          isParameter: false
        }
      ]
    };
    let startAddress = 100;

    functionManager.open(params, startAddress);

    let variable = functionManager.getVariableAtAddress(100);

    expect(variable).toBeInstanceOf(Variable);
    expect(variable?.name).toBe('localVar');
  });

  it('should return null if no variable is found at a specific address', () => {
    let params: OpenFunctionParams = {
      name: 'testFunction',
      line: 1,
      localsStartOffset: 0,
      locals: [
        {
          name: 'localVar',
          address: 0,
          initialValue: 0,
          symbolTypeId: 'int',
          isParameter: false
        }
      ]
    };
    let startAddress = 100;

    functionManager.open(params, startAddress);

    let variable = functionManager.getVariableAtAddress(200);

    expect(variable).toBeUndefined();
  });
});
