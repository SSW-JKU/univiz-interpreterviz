export class OperationTraceParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OperationTraceParserError';
  }
}
