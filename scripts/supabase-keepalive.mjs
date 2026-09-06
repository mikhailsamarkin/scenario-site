// Keep-alive для free-tier Supabase (dev + prod).
// Запускается GitHub Actions cron (supabase-keepalive.yml) ежедневно.
//
// Логика:
//   1. Для каждого окружения (dev, prod) выполняем GET /rest/v1/storage.objects?select=*&limit=1
//      с anon key. Это полноценный запрос к БД через PostgREST — засчитывается
//      как активность и не даёт Supabase приостановить проект после 7 дней простоя.
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
  },
  {
    name: 'prod',
    url: process.env.SUPABASE_URL_PROD,
    anonKey: process.env.SUPABASE_ANON_KEY_PROD,
  },
];

async function ping(project) {
  if (!project.url || !project.anonKey) {
    console.error(`supabase-keepalive: ${project.name}: URL или anon key не заданы`);
    return false;
  }

  const base = project.url.replace(/\/+$/, '');
  const url = `${base}/rest/v1/storage.objects?select=*&limit=1`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: project.anonKey,
        Authorization: `Bearer ${project.anonKey}`,
        Accept: 'application/json',
      },
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