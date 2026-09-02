'use client';

import {useEffect, useState} from 'react';
import {doc, getDoc} from 'firebase/firestore';
import {getDb} from '../../../lib/firebase';
import SupabaseImage from '../../../components/SupabaseImage';

type Slide = {
  imageRef: string;
  frameType?: string;
  caption?: string;
  alt?: string;
};

type Game = {
  id: string;
  title?: string;
  carousel?: Slide[];
};

export default function ScenarioClient({id}: {id: string}) {
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getDb();
    if (!db) {
      setError('Firebase не настроен (проверьте NEXT_PUBLIC_FIREBASE_* в .env.local)');
      return;
    }
    getDoc(doc(db, 'games', id))
      .then((snap) => {
        if (snap.exists()) {
          setGame({id: snap.id, ...(snap.data() as Omit<Game, 'id'>)});
        } else {
          setError(`Сценарий ${id} не найден`);
        }
      })
      .catch((e) => setError(String(e)));
  }, [id]);

  return (
    <main style={{padding: '2rem', maxWidth: 800, margin: '0 auto'}}>
      <h1>Сценарий: {game?.title ?? id}</h1>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {!game && !error && <p>Загрузка…</p>}
      {game?.carousel && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {game.carousel.map((slide, i) => (
            <figure key={i}>
              <SupabaseImage
                imageRef={slide.imageRef}
                alt={slide.alt ?? game.title ?? id}
                width={800}
                height={600}
              />
              {slide.caption && <figcaption>{slide.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </main>
  );
}