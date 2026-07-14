import fs from 'fs/promises';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { parse } from './parser';

describe('parser', () => {
  it('should parse vizspec', async () => {
    let fixture = await fs.readFile(join(__dirname, '__fixtures__', '1.vizspec'), 'utf-8');

    let res = parse(fixture);

    expect(res).toMatchSnapshot();
  });
});
