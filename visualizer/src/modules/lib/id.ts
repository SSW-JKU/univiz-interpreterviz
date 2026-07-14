import { idFactory } from './utils';

export let ID = idFactory({
  memoryEntry: 'ent_mem',
  modifiedEntry: 'ent_mod',
  pointer: 'ptr',
  addressableRegion: 'reg_adre',
  stackRegion: 'reg_stak',
  codeRegion: 'reg_co',
  function: 'func',
  symbolType: 'symt',
  variable: 'var',
  operation: 'operation',
  chunk: 'chk',
  run: 'run'
});
