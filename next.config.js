/** @type {import('next').NextConfig} */

// База пути статической выкладки (US-E8-06, ED-3).
// GitHub Pages project site отдаётся по /<repo>/ — базовый путь приходит из
// CI (actions/configure-pages). Для кастомного домена scenario-games.ru
// базовый путь пустой (NEXT_PUBLIC_BASE_PATH='').
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const basePath = rawBasePath === '/' ? '' : rawBasePath;

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath,
  // CNAME для кастомного домена добавляется в public/ при подключении
  // домена (US-E8-01, ED-3).
};

module.exports = nextConfig;
