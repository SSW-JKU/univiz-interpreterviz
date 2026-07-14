import tomlParser from 'toml';
import { dedent } from '../lib/utils/dedent';
import { collect, VSCollectedDeclaration } from './collect';

class ParseError extends Error {
  constructor(message: string, line: number) {
    super(message);
  }
}

let assert = (condition: boolean, message: string, line: number) => {
  if (!condition) throw new ParseError(message, line);
};

let isAlnum = (char: string) => /^[a-zA-Z0-9_]+$/.test(char);

let isCommentLine = (line: string) => {
  let trimmed = line.trim();

  return trimmed.startsWith('#');
};

let parseUntilBlock = (lines: string[], currentIndex: number) => {
  let curlyBraceCount = 0;
  let result = '';
  let initialIndex = currentIndex;
  while (true) {
    let notFirstLine = initialIndex < currentIndex;
    let line = lines[++currentIndex];
    if (curlyBraceCount == 0 && line.startsWith('}')) break;

    if (isCommentLine(line)) continue;

    let openBraces = line.split('{').length - 1;
    let closeBraces = line.split('}').length - 1;
    curlyBraceCount += openBraces - closeBraces;

    if (notFirstLine) result += '\n';
    result += line;
  }

  return { result, currentIndex };
};

let parseToml = (lines: string[], currentIndexInitial: number) => {
  let { result, currentIndex } = parseUntilBlock(lines, currentIndexInitial);

  try {
    let toml = tomlParser.parse(result);

    return { toml, currentIndex };
  } catch (e: any) {
    if (e.line) e.line += currentIndexInitial;
    throw e;
  }
};

export interface VSDeclaration {
  type: 'type' | 'region';
  identifier: string;
  object: Record<string, any>;
}

export interface VSFunction {
  identifier: string;
  args: string[];
  javascript: string;
}

export interface VSOperation {
  identifier: string;
  name: string;
  aliases: string[];
  args: Record<string, any>;
  javascript: string;
  flags: {
    highlightJumps: boolean;
    highlightNextForCall: boolean;
    animationHint?: 'load_operation' | 'enter_operation';
  };
}

export interface VSInit {
  javascript: string;
}

export interface VizSpec {
  declarations: VSCollectedDeclaration;
  operations: VSOperation[];
  functions: VSFunction[];
  init: VSInit | null;
}

export let parse = (code: string): VizSpec => {
  let lines = code.split('\n');
  let declarations: VSDeclaration[] = [];
  let operations: VSOperation[] = [];
  let functions: VSFunction[] = [];
  let init: VSInit | null = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (isCommentLine(line)) continue;

    let parts = line
      .trim()
      .split(' ')
      .filter(part => part.length);
    if (parts.length == 0) continue;

    if (parts[0] == 'init') {
      if (init) throw new ParseError('Multiple init blocks.', i + 1);

      assert(parts.length == 2, `Invalid init on line ${i + 1}.`, i + 1);
      assert(parts[1] == '{', `Invalid init on line ${i + 1}.`, i + 1);

      let { result: javascript, currentIndex } = parseUntilBlock(lines, i);
      i = currentIndex;

      init = { javascript: dedent(javascript) };
    } else if (parts[0] == 'declare') {
      assert(parts.length == 4, `Invalid declaration on line ${i + 1}.`, i + 1);

      let type = parts[1] as 'type' | 'region';
      let identifier = parts[2];
      assert(isAlnum(type), `Invalid type on line ${i + 1}.`, i + 1);
      assert(isAlnum(identifier), `Invalid identifier on line ${i + 1}.`, i + 1);

      assert(parts[3] == '{', `Invalid declaration on line ${i + 1}.`, i + 1);
      assert(type == 'type' || type == 'region', `Invalid type on line ${i + 1}.`, i + 1);

      let { toml, currentIndex } = parseToml(lines, i);
      i = currentIndex;

      declarations.push({ type, identifier, object: toml });
    } else if (parts[0] == 'operation') {
      assert(parts.length == 3, `Invalid operation on line ${i + 1}.`, i + 1);

      let identifier = parts[1];
      assert(isAlnum(identifier), `Invalid identifier on line ${i + 1}.`, i + 1);

      assert(parts[2] == '{', `Invalid operation on line ${i + 1}.`, i + 1);

      let { toml, currentIndex } = parseToml(lines, i + 1);
      i = currentIndex;

      parts = lines[i].trim().split(' ');

      assert(parts.length == 4, `Invalid operation on line ${i + 1}.`, i + 1);
      assert(parts[0] == '}', `Invalid operation on line ${i + 1}.`, i + 1);
      assert(parts[1] == 'with', `Invalid operation on line ${i + 1}.`, i + 1);
      assert(parts[2] == 'action', `Invalid operation on line ${i + 1}.`, i + 1);
      assert(parts[3] == '{', `Invalid operation on line ${i + 1}.`, i + 1);

      let { result: javascript, currentIndex: currentIndex2 } = parseUntilBlock(lines, i);
      i = currentIndex2;

      operations.push({
        identifier,
        name: toml.name,
        args: toml.input,
        aliases: toml.alias ?? [],
        javascript: dedent(javascript),
        flags: {
          highlightNextForCall: !!toml.highlightNextForCall,
          highlightJumps: !!toml.highlightJumps,
          animationHint: toml.animationHint
        }
      });
    } else if (parts[0] == 'function') {
      let identifier = parts[1];

      assert(isAlnum(identifier), `Invalid identifier on line ${i + 1}.`, i + 1);
      assert(parts[2].startsWith('('), `Invalid function on line ${i + 1}.`, i + 1);

      let rest = parts.slice(2).join(' ');
      let argsStartIndex = rest.indexOf('(');
      let argsEndIndex = rest.indexOf(')');
      assert(
        argsStartIndex != -1 && argsEndIndex != -1,
        `Invalid function on line ${i + 1}.`,
        i + 1
      );

      let argsString = rest.slice(argsStartIndex + 1, argsEndIndex);
      let args = argsString
        .split(' ')
        .flatMap(part => part.split(','))
        .map(part => part.trim())
        .filter(part => part.length);

      parts = rest
        .slice(argsEndIndex + 1)
        .trim()
        .split(' ');

      assert(parts[0] == '{', `Invalid function on line ${i + 1}.`, i + 1);

      let { result: javascript, currentIndex: currentIndex2 } = parseUntilBlock(lines, i);

      i = currentIndex2;

      functions.push({ identifier, args, javascript: dedent(javascript) });
    } else {
      throw new ParseError(`Invalid line ${i + 1}.`, i + 1);
    }
  }

  // if (!init) throw new ParseError('Missing init block.', lines.length);

  return { declarations: collect(declarations), operations, functions, init };
};
