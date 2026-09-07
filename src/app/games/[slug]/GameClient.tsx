'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDb } from '../../../lib/firebase';
import { getGame, getSitemap } from '../../../lib/contract/repository';
import { GamePublic } from '../../../lib/contract/types';
import SupabaseImage from '../../../components/SupabaseImage';

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

export default function GameClient({ slug }: { slug: string }) {
  const [game, setGame] = useState<GamePublic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getDb();
    if (!db) {
      setError('Firebase не настроен (проверьте NEXT_PUBLIC_FIREBASE_* в .env.local)');
      return;
    }
    // slug → id из sitemap (A-23/A-24), затем чтение game_public/{id}.
    getSitemap(db)
      .then((sitemap) => {
        const entry = sitemap?.gameEntries.find((e) => e.slug === slug);
        if (!entry) {
          setError(`Игра ${slug} не найдена`);
          return null;
        }
        return getGame(db, entry.id);
      })
      .then((doc) => {
        if (doc) {
          setGame(doc);
        } else if (!error) {
          setError(`Игра ${slug} не найдена`);
        }
      })
      .catch((e) => setError(String(e)));
  }, [slug, error]);

  if (error) {
    return (
      <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <Link href="/scenarios">← К сценариям</Link>
      </main>
    );
  }
  if (!game) {
    return (
      <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
        <p>Загрузка…</p>
      </main>
    );
  }

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
