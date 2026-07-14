import { customAlphabet } from 'nanoid';

let id = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

export let randomId = (prefix: string) => `${prefix}_${id()}`;
