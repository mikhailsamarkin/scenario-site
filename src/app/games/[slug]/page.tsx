import type { Metadata } from 'next';
import { getDb } from '../../../lib/firebase';
import { getGame, getSitemap } from '../../../lib/contract/repository';
import GameView from './GameView';

// Список опубликованных игр (slug + id) из `sitemap_public/main` (A-10b.
// URL — ЧПУ по slug (A-23); чтение — по id (A-24, A-13. Без N+1 (A-10d..
export async function generateStaticParams() {
  const db = getDb();
  if (!db) return [];
  const sitemap = await getSitemap(db);
  if (!sitemap) return [];
  return sitemap.gameEntries.map((e) => ({ slug: e.slug }));
}

type Props = { params: { slug: string } };

// Метаданные из `game_public/{id}` (US-E1-04, SR-SEO-1. slug → id из sitemap.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const db = getDb();
  if (!db) return { title: params.slug };
  const sitemap = await getSitemap(db);
  const entry = sitemap?.gameEntries.find((e) => e.slug === params.slug);
  if (!entry) return { title: params.slug };
  const game = await getGame(db, entry.id);
  if (!game) return { title: params.slug };
  return {
    title: game.seoTitle ?? game.title,
    description: game.seoDescription,
  };
}

// Контент рендерится на сервере (SSG) — доступен для индексации (SR-SEO-1).
export default async function GamePage({ params }: Props) {
  const db = getDb();
  if (!db) {
    return <main>Игра недоступна</main>;
  }
  const sitemap = await getSitemap(db);
  const entry = sitemap?.gameEntries.find((e) => e.slug === params.slug);
  if (!entry) {
    return <main>Игра {params.slug} не найдена</main>;
  }
  const game = await getGame(db, entry.id);
  if (!game) {
    return <main>Игра {params.slug} не найдена</main>;
  }
  return <GameView game={game} />;
}