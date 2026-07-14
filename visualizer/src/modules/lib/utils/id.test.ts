import { beforeEach, describe, expect, it } from 'vitest';
import { idFactory } from './id';

describe('idFactory', () => {
  let factory: ReturnType<typeof idFactory>;

  beforeEach(() => {
    factory = idFactory({ user: 'usr', post: 'pst' });
  });

  it('should generate unique ids with the correct prefix', () => {
    const userId1 = factory.user.generate();
    const userId2 = factory.user.generate();
    const postId1 = factory.post.generate();
    const postId2 = factory.post.generate();

    expect(userId1).toMatch(/^usr_[a-z0-9]{10}$/);
    expect(userId2).toMatch(/^usr_[a-z0-9]{10}$/);
    expect(postId1).toMatch(/^pst_[a-z0-9]{10}$/);
    expect(postId2).toMatch(/^pst_[a-z0-9]{10}$/);

    expect(userId1).not.toBe(userId2);
    expect(postId1).not.toBe(postId2);
  });

  it('should generate consistent ids from the same input', () => {
    const userIdFrom1 = factory.user.generateFrom(1);
    const userIdFrom2 = factory.user.generateFrom(1);
    const postIdFrom1 = factory.post.generateFrom(1);
    const postIdFrom2 = factory.post.generateFrom(1);

    expect(userIdFrom1).toBe(userIdFrom2);
    expect(postIdFrom1).toBe(postIdFrom2);
  });

  it('should generate different ids from different inputs', () => {
    const userIdFrom1 = factory.user.generateFrom(1);
    const userIdFrom2 = factory.user.generateFrom(2);
    const postIdFrom1 = factory.post.generateFrom(1);
    const postIdFrom2 = factory.post.generateFrom(2);

    expect(userIdFrom1).not.toBe(userIdFrom2);
    expect(postIdFrom1).not.toBe(postIdFrom2);
  });
});
