import { OperationTraceParserError } from './error';
import { propertiesParser } from './propertiesParser';

let SEPARATOR = '------';

export type VOTChunkSource = {
  type: 'source';
  code: string;
};

export type VOTChunkStart = {
  type: 'start';
  name: string;
};

export type VOTChunkValue = {
  type: 'value';
  name: string;
  value: string;
};

export type VOTChunkError = {
  type: 'error';
  properties: {
    message: string;
    [key: string]: any;
  };
};

export type VOTChunkOperation = {
  type: 'operation';
  name: string;
  properties: {
    vizop: string;
    operation: {
      code: number;
      name: string;
      pc: number;
      line: number;
      args: string[];
    };
    args: {
      [key: string]: string | number | boolean;
    };
  };
};

export type VOTChunk =
  | VOTChunkSource
  | VOTChunkStart
  | VOTChunkValue
  | VOTChunkError
  | VOTChunkOperation;

function* parseString(input: string | string[]) {
  let lines = Array.isArray(input) ? input : input.split('\n');

  for (let i = 0; i < lines.length; ) {
    let line = lines[i];

    if (line == SEPARATOR) {
      i++;
      let name = lines[i];

      if (name == 'start') {
        let propertiesLines: string[] = [];
        i++;
        while (lines[i] != SEPARATOR && i < lines.length) {
          propertiesLines.push(lines[i]);
          i++;
        }

        let parsedProperties = propertiesParser(propertiesLines);

        if (typeof parsedProperties.name != 'string') {
          throw new OperationTraceParserError('Invalid start properties, name is required');
        }

        yield { type: 'start', name: parsedProperties.name } satisfies VOTChunk;
      } else if (name == 'source') {
        i++;

        let code = '';
        while (lines[i] != SEPARATOR && i < lines.length) {
          code += lines[i] + '\n';
          i++;
        }

        yield {
          type: 'source',
          code
        } satisfies VOTChunk;
      } else if (name == 'operation') {
        let propertiesLines: string[] = [];

        i++;

        while (lines[i] != SEPARATOR && i < lines.length) {
          propertiesLines.push(lines[i]);
          i++;
        }

        let parsedProperties = propertiesParser(propertiesLines);
        if (
          typeof parsedProperties.vizop != 'string' ||
          typeof parsedProperties.operation != 'object' ||
          typeof parsedProperties.operation.code != 'number' ||
          typeof parsedProperties.operation.name != 'string' ||
          typeof parsedProperties.operation.pc != 'number' ||
          typeof parsedProperties.operation.line != 'number' ||
          (parsedProperties.operation.args &&
            typeof parsedProperties.operation.args != 'string')
        )
          throw new OperationTraceParserError('Invalid operation properties');

        let args = ((parsedProperties.operation.args ?? '') as string)
          .split(',')
          .map(arg => arg.trim())
          .filter(Boolean);

        let { vizop, operation, ...restArgs } = parsedProperties;

        yield {
          type: 'operation',
          name: vizop,
          properties: {
            vizop,
            operation: {
              code: operation.code,
              name: operation.name,
              pc: operation.pc,
              line: operation.line,
              args
            },
            args: restArgs
          }
        } satisfies VOTChunk;
      } else if (name == 'error') {
        let propertiesLines: string[] = [];

        i++;

        while (lines[i] != SEPARATOR && i < lines.length) {
          propertiesLines.push(lines[i]);
          i++;
        }

        let parsedProperties = propertiesParser(propertiesLines);

        if (typeof parsedProperties.message != 'string')
          throw new OperationTraceParserError('Invalid error properties');

        yield {
          type: 'error',
          properties: {
            message: parsedProperties.message,
            ...parsedProperties
          }
        } satisfies VOTChunk;
      } else if (name.startsWith('value = ')) {
        let valueName = name.slice('value = '.length).trim();
        let value = '';

        i++;

        while (lines[i] != SEPARATOR && i < lines.length) {
          value += lines[i] + '\n';
          i++;
        }

        yield {
          type: 'value',
          name: valueName,
          value
        } satisfies VOTChunk;
      } else {
        throw new OperationTraceParserError(`Unknown chunk type: ${name}`);
      }
    } else {
      i++;
    }
  }
}

export async function* parse(stream: ReadableStream<String>) {
  let remainingBuffer = '';

  for await (let string of stream as any) {
    let parts = (remainingBuffer + string).split('\n');

    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i] == SEPARATOR) {
        remainingBuffer = parts.slice(i).join('\n');
        parts = parts.slice(0, i);
        break;
      }
    }

    yield* parseString(parts);
  }

  if (remainingBuffer) {
    yield* parseString(remainingBuffer);
  }
}
