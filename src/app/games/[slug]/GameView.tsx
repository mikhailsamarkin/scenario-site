// Рендер игры (SP-E4-01, SR-SEO-1).
//
// Серверный компонент: получает данные `game_public/{id}` из page.tsx
// (SSG), рендерит контент в статический HTML — доступен для индексации.

import Link from 'next/link';
import { GamePublic } from '../../../lib/contract/types';
import SupabaseImage from '../../../components/SupabaseImage';
import InstallCta from '../../../components/InstallCta';

// Подпись на русском для durationBucket (ED-2.
const DURATION_LABELS: Record<string, string> = {
  warmup: 'Разминка',
  short: 'Короткая',
  evening: 'На вечер',
  long: 'Долгая',
  main_event: 'Главное событие',
};

// Подпись на русском для rulesComplexity (ED-2.
const RULES_LABELS: Record<string, string> = {
  easy: 'Простые правила',
  normal: 'Средние правила',
  heavy: 'Сложные правила',
};

export default function GameView({ game }: { game: GamePublic }) {
  const characteristics = [
    `${game.playersHint} игрок`,
    DURATION_LABELS[game.durationBucket] ?? game.durationBucket,
    game.ageHint,
    RULES_LABELS[game.rulesComplexity] ?? game.rulesComplexity,
  ];

  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <Link href="/scenarios">← К сценариям</Link>
      <h1>{game.title}</h1>
      <InstallCta />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {characteristics.map((c, i) => (
          <span
            key={i}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: 8,
              background: '#eee',
              fontSize: '0.85rem',
            }}
          >
            {c}
          </span>
        ))}
      </div>
      {game.carousel && game.carousel.length > 0 && (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}
        >
          {game.carousel.map((slide, i) => (
            <SupabaseImage
              key={i}
              imageRef={slide.imageRef}
              alt={slide.alt ?? game.title}
              width={800}
              height={600}
            />
          ))}
        </div>
      )}
      {game.scenarios && game.scenarios.length > 0 && (
        <section>
          <h2>В сценариях</h2>
          <ul>
            {game.scenarios.map((sc, i) => (
              <li key={i}>
                <Link href={`/scenarios/${sc.slug}`}>{sc.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}