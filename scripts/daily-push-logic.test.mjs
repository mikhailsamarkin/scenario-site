// Unit-тесты логики ежедневного push (SP-E3-03).
//
// Покрывают AC-02 (последний сценарий из очереди) и AC-03 (текст из данных,
// payload scenarioId, topic new_scenarios).

import {test} from 'node:test';
import {strict as assert} from 'node:assert';

import {
  buildPushMessage,
  pickLastScenarioId,
  NEW_SCENARIOS_TOPIC,
  SCENARIO_ID_KEY,
} from './daily-push-logic.mjs';

test('AC-02: pickLastScenarioId берёт lastScenarioId из очереди', () => {
  assert.equal(pickLastScenarioId({lastScenarioId: 'vecherinka'}), 'vecherinka');
  assert.equal(pickLastScenarioId(null), null);
  assert.equal(pickLastScenarioId({}), null);
  assert.equal(pickLastScenarioId({lastScenarioId: ''}), null);
});

test('AC-03: buildPushMessage — topic new_scenarios и payload scenarioId', () => {
  const scenario = {
    title: 'Вечеринка',
    shareText: 'Новая подборка для компании',
  };
  const msg = buildPushMessage(scenario, 'vecherinka');

  assert.equal(msg.topic, NEW_SCENARIOS_TOPIC);
  assert.equal(msg.topic, 'new_scenarios');
  assert.equal(msg.data[SCENARIO_ID_KEY], 'vecherinka');
  assert.equal(msg.notification.title, 'Вечеринка');
  assert.equal(msg.notification.body, 'Новая подборка для компании');
});

test('AC-03: buildPushMessage — fallback текста из данных', () => {
  const msg = buildPushMessage(null, 'vecherinka');
  assert.equal(msg.notification.title, 'Новый сценарий');
  assert.equal(msg.data[SCENARIO_ID_KEY], 'vecherinka');
});