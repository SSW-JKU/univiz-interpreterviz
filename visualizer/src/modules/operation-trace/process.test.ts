import fs from 'fs/promises';
import { join } from 'path';
import { describe, expect, test } from 'vitest';
import { processOperationTrace } from './process';

let stringToStream = (str: string) => {
  let textEncoder = new TextEncoder();
  let buffer = textEncoder.encode(str);
  let uint8Stream = new ReadableStream({
    start(controller) {
      let i = 0;
      let chunkSize = 100; // Stupidly small chunk size to test the parser

      while (i < buffer.length) {
        let end = Math.min(i + chunkSize, buffer.length);
        controller.enqueue(buffer.slice(i, end));
        i = end;
      }

      controller.close();
    }
  });

  let textStream = uint8Stream.pipeThrough(new TextDecoderStream());

  return textStream;
};

describe('process', () => {
  test('should parse MultiDim.v0t', async () => {
    let fixture = await fs.readFile(join(__dirname, '__fixtures__', 'MultiDim.v0t'), 'utf-8');

    let res = await processOperationTrace(stringToStream(fixture));

    expect(res).toMatchSnapshot();
  });

  test('should parse StudentList.v0t', async () => {
    let fixture = await fs.readFile(
      join(__dirname, '__fixtures__', 'StudentList.v0t'),
      'utf-8'
    );

    let res = await processOperationTrace(stringToStream(fixture));

    expect(res).toMatchSnapshot();
  });

  test('should parse Test1.v0t', async () => {
    let fixture = await fs.readFile(join(__dirname, '__fixtures__', 'Test1.v0t'), 'utf-8');

    let res = await processOperationTrace(stringToStream(fixture));

    expect(res).toMatchSnapshot();
  });

  test('should parse TestProgram.v0t', async () => {
    let fixture = await fs.readFile(
      join(__dirname, '__fixtures__', 'TestProgram.v0t'),
      'utf-8'
    );

    let res = await processOperationTrace(stringToStream(fixture));

    expect(res).toMatchSnapshot();
  });
});
