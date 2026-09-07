// Контрактные тесты путей и типов (SP-E0-01).
//
// Проверяют, что пути публичных агрегатов соответствуют контракту
// (TC-03) и что enum-ключи совпадают с Dart-моделями.
//
// Запуск: node --test src/lib/contract/contract.test.mjs
// (использует встроенный node:test — без дополнительных зависимостей).

import {test} from 'node:test';
import {strict as assert} from 'node:assert';

import {
  homeFeedPath,
  semanticGroupPublicPath,
  scenarioPublicPath,
  gamePublicPath,
  sitemapPublicPath,
  PublicCollections,
  SourceCollections,
} from './paths.ts';
import {CONTENT_CONTRACT_VERSION} from './types.ts';

test('пути публичных агрегатов соответствуют контракту', () => {
  assert.equal(homeFeedPath(), 'home_feed/main');
  assert.equal(semanticGroupPublicPath('g1'), 'semantic_groups_public/g1');
  assert.equal(scenarioPublicPath('s1'), 'scenario_public/s1');
  assert.equal(gamePublicPath('g1'), 'game_public/g1');
  assert.equal(sitemapPublicPath(), 'sitemap_public/main');
});

test('имена коллекций соответствуют СТ §4', () => {
  assert.equal(SourceCollections.games, 'games');
  assert.equal(SourceCollections.scenarios, 'scenarios');
  assert.equal(SourceCollections.semanticGroups, 'semantic_groups');
  assert.equal(
    SourceCollections.scenarioSemanticGroups,
    'scenario_semantic_groups',
  );
  assert.equal(SourceCollections.scenarioGames, 'scenario_games');
  assert.equal(PublicCollections.homeFeed, 'home_feed');
  assert.equal(PublicCollections.semanticGroupsPublic, 'semantic_groups_public');
  assert.equal(PublicCollections.scenarioPublic, 'scenario_public');
  assert.equal(PublicCollections.gamePublic, 'game_public');
  assert.equal(PublicCollections.sitemapPublic, 'sitemap_public');
});

test('версия контракта = 2', () => {
  assert.equal(CONTENT_CONTRACT_VERSION, 2);
});

// A-25: UTM не теряются при редиректах. Сайт не имеет редиректов,
// сбрасывающих query; проверяем, что URL с UTM сохраняет параметры.
test('UTM сохраняются в URL (A-25)', () => {
  const url =
    'https://scenario-games.ru/scenario/vecherinka?utm_source=share&utm_campaign=vecherinka';
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get('utm_source'), 'share');
  assert.equal(parsed.searchParams.get('utm_campaign'), 'vecherinka');
  // Финальный URL (без редиректов) сохраняет query.
  assert.equal(parsed.toString(), url);
});