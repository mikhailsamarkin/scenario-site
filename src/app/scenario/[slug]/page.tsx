import type { Metadata } from 'next';
import { getDb } from '../../../lib/firebase';
import { getScenario, getSitemap } from '../../../lib/contract/repository';
import { supabasePublicUrl } from '../../../lib/supabase';
import ScenarioView from './ScenarioView';

// Список опубликованных сценариев (slug + id) из `sitemap_public/main` (A-10b.
// URL — ЧПУ по slug (A-23); чтение — по id (A-24, A-13. Без N+1 (A-10d.
export async function generateStaticParams() {
  const db = getDb();
  if (!db) return [];
  const sitemap = await getSitemap(db);
  if (!sitemap) return [];
  return sitemap.scenarioEntries.map((e) => ({ slug: e.slug }));
}

type Props = { params: { slug: string } };

// Метаданные из `scenario_public/{id}` (US-E1-04, SR-SEO-1. slug → id из sitemap.
// OG-теги (US-E5-03): og:title/og:description/og:image из полей шаринга.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const db = getDb();
  if (!db) return { title: params.slug };
  const sitemap = await getSitemap(db);
  const entry = sitemap?.scenarioEntries.find((e) => e.slug === params.slug);
  if (!entry) return { title: params.slug };
  const scenario = await getScenario(db, entry.id);
  if (!scenario) return { title: params.slug };
  const title = scenario.shareTitle ?? scenario.seoTitle ?? scenario.title;
  const description = scenario.shareText ?? scenario.seoDescription ?? scenario.whyTheseGames;
  return {
    title: scenario.seoTitle ?? scenario.title,
    description: scenario.seoDescription,
    openGraph: {
      title,
      description,
      ...(scenario.shareImageUrl ? { images: [supabasePublicUrl(scenario.shareImageUrl)] } : {}),
    },
  };
}

// Контент рендерится на сервере (SSG) — доступен для индексации (SR-SEO-1).
export default async function ScenarioPage({ params }: Props) {
  const db = getDb();
  if (!db) {
    return <main>Сценарий недоступен</main>;
  }
  const sitemap = await getSitemap(db);
  const entry = sitemap?.scenarioEntries.find((e) => e.slug === params.slug);
  if (!entry) {
    return <main>Сценарий {params.slug} не найден</main>;
  }
  const scenario = await getScenario(db, entry.id);
  if (!scenario) {
    return <main>Сценарий {params.slug} не найден</main>;
  }
  return <ScenarioView scenario={scenario} />;
}