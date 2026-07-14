import { parse, VOTChunkError, VOTChunkOperation, VOTChunkValue } from './parser';

export let processOperationTrace = async (stream: ReadableStream<String>) => {
  let log = parse(stream);
  let source: string | null = null;
  let initialValues = new Map<string, string>();

  let c = await log.next();
  while (!c.done) {
    if (c.value.type == 'source') source = c.value.code;
    else if (c.value.type == 'value') initialValues.set(c.value.name, c.value.value);
    else if (c.value.type == 'start') {
      if (!source) throw new Error('Source must be defined before start');

      return {
        source,
        initialValues,
        programName: c.value.name,
        operationIterator: log as AsyncGenerator<
          VOTChunkValue | VOTChunkError | VOTChunkOperation,
          void,
          unknown
        >
      };
    }

    c = await log.next();
  }

  throw new Error('No start chunk found');
};
