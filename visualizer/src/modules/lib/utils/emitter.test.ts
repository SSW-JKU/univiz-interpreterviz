import { describe, expect, it, vi } from 'vitest';
import { createEmitter } from './emitter';

describe('createEmitter', () => {
  it('should allow subscribing to events', () => {
    const emitter = createEmitter<number>();
    const listener = vi.fn();

    const unsubscribe = emitter.subscribe(listener);
    emitter.publish(42);

    expect(listener).toHaveBeenCalledWith(42);

    unsubscribe();
  });

  it('should allow unsubscribing from events', () => {
    const emitter = createEmitter<number>();
    const listener = vi.fn();

    const unsubscribe = emitter.subscribe(listener);
    unsubscribe();
    emitter.publish(42);

    expect(listener).not.toHaveBeenCalled();
  });

  it('should call all subscribed listeners when an event is published', () => {
    const emitter = createEmitter<number>();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    emitter.subscribe(listener1);
    emitter.subscribe(listener2);
    emitter.publish(42);

    expect(listener1).toHaveBeenCalledWith(42);
    expect(listener2).toHaveBeenCalledWith(42);
  });

  it('should not call unsubscribed listeners when an event is published', () => {
    const emitter = createEmitter<number>();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    const unsubscribe1 = emitter.subscribe(listener1);
    emitter.subscribe(listener2);
    unsubscribe1();
    emitter.publish(42);

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledWith(42);
  });
});
