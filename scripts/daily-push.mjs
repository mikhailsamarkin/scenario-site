// Ежедневный push (замена Cloud Scheduler, A-7) — без Cloud Functions.
// Запускается GitHub Actions cron (daily-push.yml) в 11:00 МСК.
//
// Логика (SP-E3-03):
//   1. Инициализация firebase-admin через service account (GOOGLE_APPLICATION_CREDENTIALS).
//   2. Чтение очереди pending_notifications/daily → lastScenarioId (A-32).
//   3. Чтение scenario_public/{id} для текста (ED-11).
//   4. Отправка FCM на topic 'new_scenarios' (SR-PUSH-1) с data.scenarioId
//      для deep link (US-E3-04).
//
// Требуемые env:
//   GOOGLE_APPLICATION_CREDENTIALS — путь к service account JSON (GitHub Secret).

import {initializeApp, cert, getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getMessaging} from 'firebase-admin/messaging';

import {buildPushMessage, pickLastScenarioId} from './daily-push-logic.mjs';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS not set (путь к service account JSON)',
    );
  }
  return initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  });
}

async function main() {
  const app = getAdminApp();
  const db = getFirestore(app);

  // 1. Читаем очередь уведомлений (A-32): последний опубликованный сценарий.
  const queueSnap = await db.doc('pending_notifications/daily').get();
  const queueRecord = queueSnap.exists ? queueSnap.data() : null;
  const scenarioId = pickLastScenarioId(queueRecord);
  if (!scenarioId) {
    console.log('daily-push: нет новинок в очереди, пропуск');
    return;
  }
  console.log(`daily-push: последний сценарий "${scenarioId}"`);

  // 2. Читаем публичный сценарий для текста (ED-11).
  const scenarioSnap = await db.doc(`scenario_public/${scenarioId}`).get();
  const scenario = scenarioSnap.exists ? scenarioSnap.data() : null;
  if (!scenario) {
    console.log(`daily-push: сценарий ${scenarioId} не найден, пропуск`);
    return;
  }

  // 3. Отправка FCM на topic new_scenarios (SR-PUSH-1) с scenarioId (US-E3-04).
  const message = buildPushMessage(scenario, scenarioId);
  const messaging = getMessaging(app);
  const response = await messaging.send(message);
  console.log(`daily-push: FCM отправлено (${response})`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('daily-push: ошибка', err);
    process.exit(1);
  });