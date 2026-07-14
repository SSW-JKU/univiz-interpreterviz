import { describe, expect, it, vi } from 'vitest';
import { combineUnsubscribes } from './combineUnsubscribes';

describe('combineUnsubscribes', () => {
  it('should call all unsubscribe functions', () => {
    const unsubscribe1 = vi.fn();
    const unsubscribe2 = vi.fn();
    const unsubscribe3 = vi.fn();

    const combinedUnsubscribe = combineUnsubscribes([
      unsubscribe1,
      unsubscribe2,
      unsubscribe3
    ]);
    combinedUnsubscribe();

    expect(unsubscribe1).toHaveBeenCalled();
    expect(unsubscribe2).toHaveBeenCalled();
    expect(unsubscribe3).toHaveBeenCalled();
  });

  it('should not throw if no unsubscribe functions are provided', () => {
    const combinedUnsubscribe = combineUnsubscribes([]);
    expect(combinedUnsubscribe).not.toThrow();
  });
});
