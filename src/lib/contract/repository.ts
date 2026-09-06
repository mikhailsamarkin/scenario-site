// Репозиторий чтения публичных агрегатов для Next.js (SP-E0-01).
//
// Читает только публичные коллекции (A-10, A-12); черновики недоступны
// клиенту (A-38). Используется в SSG-страницах и generateStaticParams.
//
// Бюджет запросов (A-10b): одна страница — 1–2 чтения через агрегаты
// `*_public` / `sitemap_public`.

import {doc, getDoc, Firestore} from 'firebase/firestore';

import {
  homeFeedPath,
  semanticGroupPublicPath,
  scenarioPublicPath,
  gamePublicPath,
  sitemapPublicPath,
} from './paths';
import {
  HomeFeed,
  SemanticGroupPublic,
  ScenarioPublic,
  GamePublic,
  SitemapPublic,
} from './types';

/** Читает документ и приводит к типу; null, если документ не найден. */
async function readDoc<T>(
  db: Firestore,
  path: string,
): Promise<T | null> {
  const snap = await getDoc(doc(db, path));
  if (!snap.exists()) return null;
  return snap.data() as T;
}

/** `home_feed/main` — агрегат главного экрана. */
export async function getHomeFeed(
  db: Firestore,
): Promise<HomeFeed | null> {
  return readDoc<HomeFeed>(db, homeFeedPath());
}

/** `semantic_groups_public/{id}`. */
export async function getSemanticGroup(
  db: Firestore,
  id: string,
): Promise<SemanticGroupPublic | null> {
  return readDoc<SemanticGroupPublic>(db, semanticGroupPublicPath(id));
}

/** `scenario_public/{scenarioId}`. */
export async function getScenario(
  db: Firestore,
  scenarioId: string,
): Promise<ScenarioPublic | null> {
  return readDoc<ScenarioPublic>(db, scenarioPublicPath(scenarioId));
}

/** `game_public/{gameId}`. */
export async function getGame(
  db: Firestore,
  gameId: string,
): Promise<GamePublic | null> {
  return readDoc<GamePublic>(db, gamePublicPath(gameId));
}

/** `sitemap_public/main` — список опубликованных slug для SSG. */
export async function getSitemap(
  db: Firestore,
): Promise<SitemapPublic | null> {
  return readDoc<SitemapPublic>(db, sitemapPublicPath());
}