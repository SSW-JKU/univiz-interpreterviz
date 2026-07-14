export class RunError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RunError';
  }
}
