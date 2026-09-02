// Ежедневный push (замена Cloud Scheduler, A-7) — без Cloud Functions.
// Запускается GitHub Actions cron (daily-push.yml) в 11:00 МСК.
//
// Логика:
//   1. Инициализация firebase-admin через service account (GOOGLE_APPLICATION_CREDENTIALS).
//   2. Чтение коллекции games из Firestore.
//   3. Выбор игры (пока — первая; TODO(E3): ротация/алгоритм).
//   4. Отправка FCM-сообщения подписчикам (topic 'daily').
//
// Требуемые env:
//   GOOGLE_APPLICATION_CREDENTIALS — путь к service account JSON (GitHub Secret).
//   FCM_TOPIC — топик для рассылки (default 'daily').

import {initializeApp, cert, getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getMessaging} from 'firebase-admin/messaging';

const FCM_TOPIC = process.env.FCM_TOPIC ?? 'daily';

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

  // 1. Читаем игры
  const snap = await db.collection('games').limit(10).get();
  if (snap.empty) {
    console.log('daily-push: нет игр в Firestore, пропуск');
    return;
  }

  // 2. Выбор игры (TODO(E3): алгоритм ротации)
  const game = snap.docs[0];
  const data = game.data();
  const title = data.title ?? game.id;
  console.log(`daily-push: выбрана игра "${title}" (${game.id})`);

  // 3. Отправка FCM
  const message = {
    topic: FCM_TOPIC,
    notification: {
      title: 'Игра дня',
      body: title,
    },
    data: {
      gameId: game.id,
      slug: data.slug ?? '',
    },
  };

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
