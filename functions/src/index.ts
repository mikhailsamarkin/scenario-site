/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import {defineString} from "firebase-functions/params";

// Секрет для авторизации вызова dailyPush из GitHub Actions cron.
// Spark-совместимо (без Secret Manager): значение задаётся в functions/.env
// (вне git), деплоится вместе с функциями.
//   .env: DAILY_PUSH_SECRET=<значение>
const dailyPushSecret = defineString("DAILY_PUSH_SECRET");

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// Ежедневный запуск в 11:00 МСК (замена Cloud Scheduler, A-7).
// Вызывается GitHub Actions workflow daily-push.yml (cron '0 8 * * *').
// Авторизация: заголовок Authorization: Bearer <DAILY_PUSH_SECRET>.
export const dailyPush = onRequest(
  {
    maxInstances: 1,
  },
  async (request, response) => {
    const auth = request.headers.authorization ?? "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (token !== dailyPushSecret.value()) {
      response.status(401).json({error: "Unauthorized"});
      return;
    }

    logger.info("dailyPush triggered", {structuredData: true});
    // TODO(E3): логика ежедневного push (выбор игры, отправка FCM).
    response.json({ok: true, at: new Date().toISOString()});
  },
);
