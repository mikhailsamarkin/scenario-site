'use client';

import {useEffect, useState} from 'react';
import {getDb} from '../../../lib/firebase';
import {getScenario} from '../../../lib/contract/repository';
import {ScenarioPublic} from '../../../lib/contract/types';
import SupabaseImage from '../../../components/SupabaseImage';

export default function ScenarioClient({id}: {id: string}) {
  const [scenario, setScenario] = useState<ScenarioPublic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getDb();
    if (!db) {
      setError('Firebase не настроен (проверьте NEXT_PUBLIC_FIREBASE_* в .env.local)');
      return;
    }
    getScenario(db, id)
      .then((doc) => {
        if (doc) {
          setScenario(doc);
        } else {
          setError(`Сценарий ${id} не найден`);
        }
      })
      .catch((e) => setError(String(e)));
  }, [id]);

  return (
    <main style={{padding: '2rem', maxWidth: 800, margin: '0 auto'}}>
      <h1>Сценарий: {scenario?.title ?? id}</h1>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {!scenario && !error && <p>Загрузка…</p>}
      {scenario?.whyTheseGames && (
        <p style={{whiteSpace: 'pre-wrap'}}>{scenario.whyTheseGames}</p>
      )}
      {scenario?.games && scenario.games.length > 0 && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {scenario.games.map((game, i) => (
            <section key={i}>
              <h2>{game.title}</h2>
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