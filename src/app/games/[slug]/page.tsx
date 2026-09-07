import type { Metadata } from 'next';
import { getDb } from '../../../lib/firebase';
import { getGame, getSitemap } from '../../../lib/contract/repository';
import GameClient from './GameClient';

// Список опубликованных slug игр из `sitemap_public/main` (A-10b.
// Без N+1 по коллекциям (A-10d.
export async function generateStaticParams() {
  const db = getDb();
  if (!db) return [];
  const sitemap = await getSitemap(db);
  if (!sitemap) return [];
  return sitemap.gameSlugs.map((slug) => ({ slug }));
}

type Props = { params: { slug: string } };

// Метаданные из `game_public` (US-E1-04, SR-SEO-1.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const db = getDb();
  if (!db) return { title: params.slug };
  const game = await getGame(db, params.slug);
  if (!game) return { title: params.slug };
  return {
    title: game.seoTitle ?? game.title,
    description: game.seoDescription,
  };
}

export default function GamePage({ params }: Props) {
  return <GameClient slug={params.slug} />;
}
