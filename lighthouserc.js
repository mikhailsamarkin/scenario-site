// Конфигурация Lighthouse CI (SP-E4-05, NFR-SR-5, СТ §13.1).
//
// Измеряет Core Web Vitals (LCP, INP, CLS) на ключевых шаблонах —
// страницах сценария и игры. Пороги — ориентировочные; согласовать с §13.1.
// Запускается в CI после сборки (build.yml).

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/scenarios',
        'http://localhost:3000/games',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories/performance': ['error', { minScore: 0.8 }],
        'performance/lcp': ['error', { max: 2500 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};