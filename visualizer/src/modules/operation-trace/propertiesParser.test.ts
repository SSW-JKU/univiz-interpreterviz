import { describe, expect, it } from 'vitest';
import { propertiesParser } from './propertiesParser';

describe('propertiesParser', () => {
  it('should parse simple key-value pairs', () => {
    const lines = ['key1="value1"', 'key2="value2"'];
    const result = propertiesParser(lines);
    expect(result).toEqual({ key1: 'value1', key2: 'value2' });
  });

  it('should parse nested key-value pairs', () => {
    const lines = ['key1.subkey1="value1"', 'key1.subkey2="value2"'];
    const result = propertiesParser(lines);
    expect(result).toEqual({ key1: { subkey1: 'value1', subkey2: 'value2' } });
  });

  it('should parse boolean values', () => {
    const lines = ['key1=true', 'key2=false'];
    const result = propertiesParser(lines);
    expect(result).toEqual({ key1: true, key2: false });
  });

  it('should parse numeric values', () => {
    const lines = ['key1=123', 'key2=45.67'];
    const result = propertiesParser(lines);
    expect(result).toEqual({ key1: 123, key2: 45.67 });
  });

  it('should parse quoted string values', () => {
    const lines = ['key1="value1"', 'key2="value2"'];
    const result = propertiesParser(lines);
    expect(result).toEqual({ key1: 'value1', key2: 'value2' });
  });

  it('should ignore lines without "="', () => {
    const lines = ['key1="value1"', 'invalidLine'];
    const result = propertiesParser(lines);
    expect(result).toEqual({ key1: 'value1' });
  });

  it('should ignore lines with empty key or value', () => {
    const lines = ['=value1', 'key2='];
    const result = propertiesParser(lines);
    expect(result).toEqual({});
  });
});
