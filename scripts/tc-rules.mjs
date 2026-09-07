// TC-01/TC-02/TC-03: проверка Firestore Security Rules в эмуляторе (SP-E0-01,
// A-38; SP-E1-03, шаг 5).
//
// Запуск (из scenario-site/, Java обязательна для эмулятора):
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
//   FIREBASE_SERVICE_ACCOUNT_PATH=<path-to-dev-service-account.json> \
//   firebase emulators:exec --only firestore --project scenario-ba26a "node scripts/tc-rules.mjs"
//
// Примечания:
//   - admin SDK v13 использует gRPC; переключение на эмулятор — через env var
//     FIRESTORE_EMULATOR_HOST (db.settings.host не переключает gRPC-клиент).
//   - FIREBASE_SERVICE_ACCOUNT_PATH нужен для seed-записи через admin SDK
//     (обходит правила); без него admin SDK не инициализируется.
//
// TC-01: read черновика (games/{id}) через клиентский путь → permission denied.
// TC-02: read опубликованного агрегата (scenario_public/{id}) → ok.
// TC-03: read связки scenario_games/{id} (источник правды) → denied (SP-E1-03).
// TC-04: read game_public/{id} возвращает SEO-поля (SP-E1-04, ED-9).
//
// Правила применяются к НЕ-admin запросам; admin SDK обходит правила, поэтому
// проверка идёт через REST-эмулятор с валидным JWT анонима. Seed-данные
// создаются через admin SDK (обходит правила), а читаются через REST (правила
// применяются).

import {initializeApp, cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {readFileSync} from 'node:fs';

const EMULATOR_HOST = 'http://127.0.0.1:8080';
const PROJECT_ID = 'scenario-ba26a';
const UID = 'test-uid-0001';

// Service account для admin SDK (обходит правила при seed). Путь — из env
// FIREBASE_SERVICE_ACCOUNT_PATH (как в tools/import-*.mjs, A-40).
function loadServiceAccount() {
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!path) throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH не задан (A-40)');
  return JSON.parse(readFileSync(path, 'utf8'));
}

// Валидный JWT для REST-эмулятора Firestore. Эмулятор парсит payload и берёт
// uid из sub/user_id; подпись не проверяется строго, но формируем HS256.
function anonymousToken() {
  const b64u = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const header = b64u({alg: 'HS256', typ: 'JWT'});
  const now = Math.floor(Date.now() / 1000);
  const payload = b64u({
    sub: UID,
    user_id: UID,
    iat: now,
    exp: now + 3600,
    aud: PROJECT_ID,
    iss: 'firebase-auth',
  });
  return `${header}.${payload}.sig`;
}

async function main() {
  const app = initializeApp({
    credential: cert(loadServiceAccount()),
    projectId: PROJECT_ID,
  });
  // admin SDK v13 использует gRPC; переключение на эмулятор — через env var
  // FIRESTORE_EMULATOR_HOST (db.settings.host не переключает gRPC-клиент).
  const db = getFirestore(app);

  // Seed-данные через admin SDK (обходит правила, чтобы документы существовали).
  await db.doc('games/draft-1').set({id: 'draft-1', slug: 'draft-1', title: 'Черновик'});
  await db.doc('scenario_public/s1').set({id: 's1', slug: 's1', title: 'Сценарий'});
  await db.doc('scenario_games/s1_g1').set({scenarioId: 's1', gameId: 'g1', order: 1});
  // SP-E1-04: game_public несёт обязательные SEO-поля (ED-9).
  await db.doc('game_public/g1').set({
    id: 'g1',
    slug: 'g1',
    title: 'Игра',
    seoTitle: 'Игра — настольная игра',
    seoDescription: 'Описание игры.',
  });

  const token = anonymousToken();
  const base = `${EMULATOR_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

  async function restGet(path) {
    const res = await fetch(`${base}/${path}`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    return {status: res.status, body: await res.text()};
  }

  // TC-01: черновик — denied (403).
  const draft = await restGet('games/draft-1');
  const draftDenied = draft.status === 403;
  console.log(`TC-01 read games/draft-1 -> HTTP ${draft.status} (denied=${draftDenied})`);

  // TC-02: опубликованный агрегат — ok (200).
  const pub = await restGet('scenario_public/s1');
  const pubOk = pub.status === 200;
  console.log(`TC-02 read scenario_public/s1 -> HTTP ${pub.status} (ok=${pubOk})`);

  // TC-03: связка scenario_games (источник правды) — denied (403) (SP-E1-03).
  const sg = await restGet('scenario_games/s1_g1');
  const sgDenied = sg.status === 403;
  console.log(`TC-03 read scenario_games/s1_g1 -> HTTP ${sg.status} (denied=${sgDenied})`);

  // TC-04: game_public читается и возвращает SEO-поля (SP-E1-04, ED-9).
  const gp = await restGet('game_public/g1');
  const gpOk = gp.status === 200 && gp.body.includes('seoTitle') && gp.body.includes('seoDescription');
  console.log(`TC-04 read game_public/g1 -> HTTP ${gp.status} (seo=${gpOk})`);

  const pass = draftDenied && pubOk && sgDenied && gpOk;
  console.log(pass ? 'TC-01/TC-02/TC-03/TC-04 PASS' : 'TC-01/TC-02/TC-03/TC-04 FAIL');
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error('ERROR', e);
  process.exit(2);
});