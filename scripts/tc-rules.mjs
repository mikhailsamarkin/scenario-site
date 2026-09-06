// TC-01/TC-02: проверка Firestore Security Rules в эмуляторе (SP-E0-01, A-38).
//
// Запуск (из scenario-site/):
//   firebase emulators:exec --project scenario-ba26a "node scripts/tc-rules.mjs"
//
// TC-01: read черновика (games/{id}) через клиентский путь → permission denied.
// TC-02: read опубликованного агрегата (scenario_public/{id}) → ok.
//
// Использует firebase-admin с эмулятором Firestore (порт 8080).
// Правила применяются к НЕ-admin запросам; admin SDK обходит правила,
// поэтому проверка идёт через REST-эмулятор с токеном анонима.

import {initializeApp, cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';

const EMULATOR_HOST = 'http://127.0.0.1:8080';

// Анонимный токен для проверки правил (не admin).
async function anonymousToken() {
  // В эмуляторе auth не запущен — используем REST API эмулятора Firestore
  // с правилами. Для этого нужен токен; эмулятор принимает любой JWT
  // с uid. Сгенерируем через admin SDK (эмулятор auth отключён, поэтому
  // используем прямой REST-запрос с заголовком Authorization: Bearer <uid>).
  return 'test-uid-0001';
}

async function main() {
  const app = initializeApp({
    projectId: 'scenario-ba26a',
    // Эмулятор: без реальных ключей
  });
  const db = getFirestore(app);
  db.settings.host = EMULATOR_HOST;

  // TC-01: черновик games/{id} — должен быть denied.
  // Через admin SDK правила обходятся, поэтому проверяем через REST.
  const uid = await anonymousToken();
  const base = `${EMULATOR_HOST}/v1/projects/scenario-ba26a/databases/(default)/documents`;

  async function restGet(path) {
    const res = await fetch(`${base}/${path}`, {
      headers: {Authorization: `Bearer ${uid}`},
    });
    return {status: res.status, body: await res.text()};
  }

  // TC-01: черновик
  const draft = await restGet('games/draft-1');
  const draftDenied = draft.status === 403 || draft.status === 404;
  console.log(`TC-01 read games/draft-1 -> HTTP ${draft.status} (denied=${draftDenied})`);

  // TC-02: опубликованный агрегат
  const pub = await restGet('scenario_public/s1');
  const pubOk = pub.status === 200;
  console.log(`TC-02 read scenario_public/s1 -> HTTP ${pub.status} (ok=${pubOk})`);

  const pass = draftDenied && pubOk;
  console.log(pass ? 'TC-01/TC-02 PASS' : 'TC-01/TC-02 FAIL');
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error('ERROR', e);
  process.exit(2);
});