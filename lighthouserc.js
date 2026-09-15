// Конфигурация Lighthouse CI (SP-E4-05, NFR-SR-5, СТ §13.1).
//
// Измеряет Core Web Vitals (LCP, INP, CLS) на ключевых шаблонах —
// страницах сценария и игры. Пороги — ориентировочные; согласовать с §13.1.
// Запускается в CI после сборки (build.yml). Базовый путь выкладки
// (GH Pages project site) учитывается через NEXT_PUBLIC_BASE_PATH.

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const basePath = rawBasePath === '/' ? '' : rawBasePath;

module.exports = {
  ci: {
    collect: {
      url: [
        `http://localhost:3000${basePath}/scenarios`,
        `http://localhost:3000${basePath}/scenario/semya`,
        `http://localhost:3000${basePath}/games/codenames`,
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'largest-contentful-paint': ['error', { max: 2500 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
