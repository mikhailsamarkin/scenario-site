// Список игр сайта (SP-E10-03, FR-W-2).
//
// Серверный компонент: полный список опубликованных игр из
// `sitemap_public/main` + caption/alt/медиа из `home_feed/main.carousel`
// (2 чтения, A-10b, без N+1 чтений game_public). SSG-рендер — контент
// в статическом HTML (SR-SEO-1).

import type { Metadata } from 'next';
import Link from 'next/link';

import SupabaseImage from '../../components/SupabaseImage';
import { getDb } from '../../lib/firebase';
import { getHomeFeed, getSitemap } from '../../lib/contract/repository';
import { gameIdFromImageRef, titleFromSlug } from '../../lib/contract/links';
import type { Slide } from '../../lib/contract/types';

export const metadata: Metadata = {
  title: 'Игры — Scenario',
  description: 'Все опубликованные настольные игры из подборок Scenario.',
};

export default async function GamesListPage() {
  const db = getDb();
  const [sitemap, feed] = db ? await Promise.all([getSitemap(db), getHomeFeed(db)]) : [null, null];

  const entries = sitemap?.gameEntries ?? [];
  // Слайды карусели по gameId (у слайда нет ссылки на игру — gameId
  // извлекается из imageRef, см. links.ts).
  const slideByGameId = new Map<string, Slide>();
  for (const slide of feed?.carousel ?? []) {
    const gameId = gameIdFromImageRef(slide.imageRef);
    if (gameId !== null && !slideByGameId.has(gameId)) {
      slideByGameId.set(gameId, slide);
    }
  }

  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Игры</h1>
      {entries.length === 0 ? (
        <p>Пока нет опубликованных игр.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {entries.map((entry) => (
            <GameListItem key={entry.id} slug={entry.slug} slide={slideByGameId.get(entry.id)} />
          ))}
        </div>
      )}
    </main>
  );
}

function GameListItem({ slug, slide }: { slug: string; slide?: Slide }) {
  const title = slide?.caption ?? slide?.alt ?? titleFromSlug(slug);
  return (
    <article>
      <h2>
        <Link href={`/games/${slug}`}>{title}</Link>
      </h2>
      {slide?.alt && <p>{slide.alt}</p>}
      {slide && (
        <SupabaseImage
          imageRef={slide.imageRef}
          alt={slide.alt ?? title}
          width={800}
          height={600}
        />
      )}
    </article>
  );
}
