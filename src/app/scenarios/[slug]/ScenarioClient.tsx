'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDb } from '../../../lib/firebase';
import { getScenario, getSitemap } from '../../../lib/contract/repository';
import { ScenarioPublic } from '../../../lib/contract/types';
import SupabaseImage from '../../../components/SupabaseImage';
import InstallCta from '../../../components/InstallCta';

export default function ScenarioClient({ slug }: { slug: string }) {
  const [scenario, setScenario] = useState<ScenarioPublic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getDb();
    if (!db) {
      setError('Firebase не настроен (проверьте NEXT_PUBLIC_FIREBASE_* в .env.local)');
      return;
    }
    // slug → id из sitemap (A-23/A-24), затем чтение scenario_public/{id}.
    getSitemap(db)
      .then((sitemap) => {
        const entry = sitemap?.scenarioEntries.find((e) => e.slug === slug);
        if (!entry) {
          setError(`Сценарий ${slug} не найден`);
          return null;
        }
        return getScenario(db, entry.id);
      })
      .then((doc) => {
        if (doc) {
          setScenario(doc);
        } else if (!error) {
          setError(`Сценарий ${slug} не найден`);
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
  if (!scenario) {
    return (
      <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
        <p>Загрузка…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Сценарий: {scenario.title}</h1>
      <InstallCta />
      {scenario.whyTheseGames && <p style={{ whiteSpace: 'pre-wrap' }}>{scenario.whyTheseGames}</p>}
      {scenario.games && scenario.games.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {scenario.games.map((game, i) => (
            <section key={i}>
              <h2>
                <Link href={`/games/${game.slug}`}>{game.title}</Link>
              </h2>
              <p>{game.shortDescription}</p>
              {game.imageRef && (
                <SupabaseImage
                  imageRef={game.imageRef}
                  alt={game.alt ?? game.title}
                  width={800}
                  height={600}
                />
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
