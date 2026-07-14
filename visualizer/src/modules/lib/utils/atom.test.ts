import { describe, expect, it } from 'vitest';
import { atom, computed } from './atom';

describe('atom', () => {
  it('should initialize with the given value', () => {
    const count = atom(0);
    expect(count.get()).toBe(0);
  });

  it('should update the value when set is called', () => {
    const count = atom(0);
    count.set(1);
    expect(count.get()).toBe(1);
  });

  it('should notify subscribers when the value changes', () => {
    const count = atom(0);
    let updatedValue = 0;
    const unsubscribe = count.subscribe(value => {
      updatedValue = value;
    });

    count.set(1);
    expect(updatedValue).toBe(1);

    unsubscribe();
    count.set(2);
    expect(updatedValue).toBe(1); // should not update after unsubscribe
  });
});

describe('computed', () => {
  it('should create a read-only atom based on another atom', () => {
    const count = atom(0);
    const doubleCount = computed(count, value => value * 2);

    expect(doubleCount.get()).toBe(0);
    count.set(1);
    expect(doubleCount.get()).toBe(2);
  });

  it('should update the computed value when the source atom changes', () => {
    const count = atom(1);
    const doubleCount = computed(count, value => value * 2);

    count.set(2);
    expect(doubleCount.get()).toBe(4);
  });

  it('should notify subscribers when the computed value changes', () => {
    const count = atom(1);
    const doubleCount = computed(count, value => value * 2);
    let updatedValue = 0;
    const unsubscribe = doubleCount.subscribe(value => {
      updatedValue = value;
    });

    count.set(2);
    expect(updatedValue).toBe(4);

    unsubscribe();
    count.set(3);
    expect(updatedValue).toBe(4); // should not update after unsubscribe
  });
});
