// Логика ежедневного push (SP-E3-03).
//
// Чистые функции: выбор последнего сценария из очереди (A-32) и
// формирование FCM-сообщения (SR-PUSH-1, ED-11). Не выполняют сетевых
// вызовов — тестируются отдельно.

// Topic новых сценариев (SR-PUSH-1).
export const NEW_SCENARIOS_TOPIC = 'new_scenarios';

// Ключ scenarioId в data (US-E3-04).
export const SCENARIO_ID_KEY = 'scenarioId';

/**
 * Формирует FCM-сообщение для последнего сценария.
 *
 * @param {object} scenario — публичный сценарий (scenario_public/{id}).
 * @param {string} scenarioId — id сценария (ключ документа).
 * @returns {object} message для messaging.send().
 */
export function buildPushMessage(scenario, scenarioId) {
  const title = scenario?.title ?? 'Новый сценарий';
  const body = scenario?.shareText ?? scenario?.whyTheseGames ?? 'Новая подборка игр';
  return {
    topic: NEW_SCENARIOS_TOPIC,
    notification: {
      title,
      body,
    },
    data: {
      [SCENARIO_ID_KEY]: scenarioId,
    },
  };
}

/**
 * Выбирает последний сценарий из записи очереди (A-32).
 *
 * @param {object|null} queueRecord — pending_notifications/daily.
 * @returns {string|null} lastScenarioId или null, если записи нет.
 */
export function pickLastScenarioId(queueRecord) {
  if (typeof queueRecord !== 'object' || queueRecord === null) return null;
  const id = queueRecord.lastScenarioId;
  return typeof id === 'string' && id.trim().length > 0 ? id : null;
}