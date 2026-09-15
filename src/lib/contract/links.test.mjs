// Тесты хелперов связей агрегатов (SP-E10-01..03).
//
// Запуск: node --test src/lib/contract/links.test.mjs

import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import { gameIdFromImageRef, titleFromSlug } from './links.ts';

test('gameIdFromImageRef: извлекает id из формата games/{id}/…', () => {
  assert.equal(gameIdFromImageRef('games/g1/teaser.jpg'), 'g1');
  assert.equal(gameIdFromImageRef('games/dixit-2026/box/a.png'), 'dixit-2026');
});

test('gameIdFromImageRef: null для другого формата', () => {
  assert.equal(gameIdFromImageRef('scenarios/s1/cover.jpg'), null);
  assert.equal(gameIdFromImageRef('games/'), null);
  assert.equal(gameIdFromImageRef(''), null);
});

test('titleFromSlug: fallback-заголовок из slug', () => {
  assert.equal(titleFromSlug('romantic-evening'), 'Romantic evening');
  assert.equal(titleFromSlug('dixit'), 'Dixit');
  assert.equal(titleFromSlug('a--b'), 'A b');
});
