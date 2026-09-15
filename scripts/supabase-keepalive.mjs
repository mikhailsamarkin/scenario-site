// Keep-alive для free-tier Supabase (dev + prod).
// Запускается GitHub Actions cron (supabase-keepalive.yml) каждые 6 часов.
//
// Логика:
//   1. Для каждого окружения (dev, prod) выполняем GET /rest/v1/<таблица>?select=id&limit=1
//      с anon key. Это пользовательский запрос к БД через PostgREST — именно его
//      Supabase засчитывает как активность (см. free-project-pausing: «user
//      database activity» / «user requests to the database»).
//      Запросы к Storage API (/storage/v1/object/list/...), Auth и Management API
//      в метрику активности НЕ входят, поэтому на одном Storage-пинге проект
//      всё равно уходил в авто-паузу после 7 дней.
//   2. HTTP 2xx — успех; иначе ошибка (exit 1).
//
// Требование к БД (применяется в обоих проектах, см. migration):
//   create table public.keepalive (
//     id bigint generated always as identity primary key,
//     created_at timestamptz not null default now()
//   );
//   alter table public.keepalive enable row level security;
//   create policy keepalive_select on public.keepalive
//     for select to anon, authenticated using (true);
//   insert into public.keepalive default values;
//
// Требуемые env (GitHub Secrets):
//   SUPABASE_URL_DEV / SUPABASE_ANON_KEY_DEV
//   SUPABASE_URL_PROD / SUPABASE_ANON_KEY_PROD
//
// Anon keys — публичные клиентские ключи (лежат в .env.local и в бандле),
// секрет не критичен, но храним в secrets для единообразия с daily-push.

const KEEPALIVE_TABLE = 'keepalive';

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

/** Идентификатор проекта (ref) из URL вида https://<ref>.supabase.co. */
function projectRef(url) {
  try {
    return new URL(url).host.split('.')[0];
  } catch {
    return null;
  }
}

/** Идентификатор проекта (ref) из payload anon/service JWT. */
function jwtRef(key) {
  try {
    const payload = JSON.parse(
      Buffer.from(key.split('.')[1], 'base64url').toString('utf8'),
    );
    return payload.ref ?? null;
  } catch {
    return null;
  }
}

async function ping(project) {
  if (!project.url || !project.anonKey) {
    console.error(`supabase-keepalive: ${project.name}: URL или anon key не заданы`);
    return false;
  }

  // Защита от перепутанных секретов: ключ должен принадлежать тому же проекту,
  // что и URL (иначе пинги молча уходят в другое окружение).
  const ref = projectRef(project.url);
  const keyRef = jwtRef(project.anonKey);
  if (keyRef && ref && keyRef !== ref) {
    console.error(
      `supabase-keepalive: ${project.name}: anon key принадлежит проекту ` +
        `"${keyRef}", а URL указывает на "${ref}" — перепутаны секреты`,
    );
    return false;
  }

  const base = project.url.replace(/\/+$/, '');
  const url = `${base}/rest/v1/${KEEPALIVE_TABLE}?select=id&limit=1`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: project.anonKey,
        Authorization: `Bearer ${project.anonKey}`,
        Accept: 'application/json',
      },
    });

    if (res.status === 404) {
      console.error(
        `supabase-keepalive: ${project.name}: таблица public.${KEEPALIVE_TABLE} ` +
          `не найдена (${url}). Примените миграцию keepalive для проекта "${ref}".`,
      );
      return false;
    }

    if (!res.ok) {
      console.error(`supabase-keepalive: ${project.name}: HTTP ${res.status} ${res.statusText}`);
      return false;
    }

    console.log(`supabase-keepalive: ${project.name} (${ref}): OK (HTTP ${res.status})`);
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
