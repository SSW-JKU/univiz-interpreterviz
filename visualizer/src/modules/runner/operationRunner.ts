import { highlightLine } from '../lib';
import { createStdLib, Memory, StdLib } from '../memory';
import { VOTChunkOperation } from '../operation-trace';
import { Log } from '../run-manager';
import { VizSpec, VSOperation } from '../vizspec';
import { RunError } from './error';

export class OperationRunner {
  private currentData = {
    logs: [] as Log[],
    line: 0
  };

  private scopeScript: string;
  private sourceLines: string[];
  private stdLib: StdLib;

  private constructor(
    private memory: Memory,
    private source: string,
    private vizSpec: VizSpec,
    private valuesMap: Map<string, any>
  ) {
    this.stdLib = createStdLib(memory);

    this.sourceLines = source.split('\n');

    this.scopeScript = [
      ...Object.keys(this.scope).map(key => `let ${key} = _fun_.${key};`),
      '',
      `let setValue = (key, value) => {
    _fun_._setValue(key, value);
    globalThis[key] = value;
  };`,
      '',
      ...vizSpec.functions.map(
        f => `function ${f.identifier} (${f.args.join(', ')}) {
${f.javascript}
}`
      )
    ].join('\n');
  }

  public static async create(
    memory: Memory,
    source: string,
    vizSpec: VizSpec,
    valuesMap: Map<string, any>
  ) {
    let runner = new OperationRunner(memory, source, vizSpec, valuesMap);
    if (vizSpec.init?.javascript) await runner.runInit();

    return runner;
  }

  public runOperation(opts: { vizOperation: VSOperation; traceOperation: VOTChunkOperation }) {
    this.memory.setPointer('pc', opts.traceOperation.properties.operation.pc ?? 0);

    return this.run(opts);
  }

  private get valueEntriesScript() {
    return [...this.valuesMap.entries()]
      .map(([key, value]) => `  let ${key} = ${JSON.stringify(value)};`)
      .join('\n');
  }

  private getSourceLine(line: number) {
    return this.sourceLines[line - 1] ?? '';
  }

  private get scope() {
    return {
      ...this.stdLib,
      _setValue: (key: string, value: any) => this.valuesMap.set(key, value),
      setLineRef: (line: number) => {
        this.currentData.line = line;
      },
      log: (message: any) =>
        this.currentData.logs.push({ message: message.toString(), ts: Date.now() })
    };
  }

  private async run({
    vizOperation,
    traceOperation
  }: {
    vizOperation?: VSOperation;
    traceOperation: VOTChunkOperation | { type: 'init' };
  }) {
    this.currentData = { logs: [], line: 0 };

    let setupScript = '';
    if (traceOperation.type == 'operation') {
      setupScript = `
  let operation = ${JSON.stringify({
    identifier: traceOperation.name,
    ...traceOperation.properties.operation
  })};
  
  ${Object.entries(traceOperation.properties.args)
    .map(([key, value]) => {
      return `  let ${key} = ${JSON.stringify(value)};`;
    })
    .join('\n')}
      `;
    }

    let js =
      traceOperation.type == 'operation'
        ? vizOperation!.javascript
        : (this.vizSpec.init?.javascript ?? '');

    let script = `
    async (_fun_) => {
      ${this.valueEntriesScript}

      ${this.scopeScript}
    
      let sourceLine = ${JSON.stringify(
        traceOperation.type == 'operation'
          ? this.getSourceLine(traceOperation.properties.operation.line)
          : ''
      )};
    
    ${setupScript}
    
      await (async () => {
    ${addLineLogger(js)} 
      })();
    }`;

    try {
      await eval(script)(this.scope);
    } catch (e: any) {
      console.warn('Error executing operation:');
      console.warn(e.message);
      console.warn('Args:');
      console.warn(traceOperation.type == 'operation' ? traceOperation.properties.args : {});
      console.warn('Trace:');
      console.warn(`${vizOperation?.identifier}:${this.currentData.line}`);
      console.warn(highlightLine(js, this.currentData.line));
      throw new RunExecutionError(e.message);
    }

    return { logs: this.currentData.logs };
  }

  private runInit() {
    return this.run({ traceOperation: { type: 'init' } });
  }
}

export class RunExecutionError extends RunError {
  constructor(message: string) {
    super(message);
    this.name = 'RunExecutionError';
  }
}

let addLineLogger = (script: string) => {
  let lines = script.split('\n');
  let scope = 0;
  let str = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    let openCount = line.split('{').length - 1;
    let closeCount = line.split('}').length - 1;

    let lineSetter = `    _fun_.setLineRef(${i + 1});\n`;
    str += `${scope > 0 ? '' : lineSetter}  ${line}\n`;

    scope += openCount - closeCount;
  }

  return str;
};
