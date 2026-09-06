// Keep-alive для free-tier Supabase (dev + prod).
// Запускается GitHub Actions cron (supabase-keepalive.yml) ежедневно.
//
// Логика:
//   1. Для каждого окружения (dev, prod) выполняем POST /storage/v1/object/list/games
//      с anon key. Это запрос к БД (таблица storage.objects) через Storage API —
//      засчитывается как активность и не даёт Supabase приостановить проект
//      после 7 дней простоя.
//      (PostgREST /rest/v1/storage.objects недоступен: схема storage не входит
//      в exposed schemas, поэтому возвращает 404.)
//   2. HTTP 2xx — успех; иначе ошибка (exit 1).
//
// Требуемые env (GitHub Secrets):
//   SUPABASE_URL_DEV / SUPABASE_ANON_KEY_DEV
//   SUPABASE_URL_PROD / SUPABASE_ANON_KEY_PROD
//
// Anon keys — публичные клиентские ключи (лежат в .env.local и в бандле),
// секрет не критичен, но храним в secrets для единообразия с daily-push.

const PROJECTS = [
  {
    name: 'dev',
    url: process.env.SUPABASE_URL_DEV,
    anonKey: process.env.SUPABASE_ANON_KEY_DEV,
    bucket: 'games',
  },
  {
    name: 'prod',
    url: process.env.SUPABASE_URL_PROD,
    anonKey: process.env.SUPABASE_ANON_KEY_PROD,
    bucket: 'games',
  },
];

async function ping(project) {
  if (!project.url || !project.anonKey) {
    console.error(`supabase-keepalive: ${project.name}: URL или anon key не заданы`);
    return false;
  }

  const base = project.url.replace(/\/+$/, '');
  const url = `${base}/storage/v1/object/list/${project.bucket}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: project.anonKey,
        Authorization: `Bearer ${project.anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({prefix: '', limit: 1, offset: 0}),
    });

    if (!res.ok) {
      console.error(`supabase-keepalive: ${project.name}: HTTP ${res.status} ${res.statusText}`);
      return false;
    }

    console.log(`supabase-keepalive: ${project.name}: OK (HTTP ${res.status})`);
    return true;
  } catch (err) {
    console.error(`supabase-keepalive: ${project.name}: ошибка запроса`, err);
    return false;
  }
}

async function main() {
  const results = await Promise.all(PROJECTS.map(ping));
  const ok = results.every(Boolean);
  if (!ok) {
    console.error('supabase-keepalive: одно или несколько окружений не ответили');
    process.exit(1);
  }
  console.log('supabase-keepalive: все окружения OK');
}

main().catch((err) => {
  console.error('supabase-keepalive: ошибка', err);
  process.exit(1);
});