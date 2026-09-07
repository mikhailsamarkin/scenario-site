import type { Metadata } from 'next';
import { getDb } from '../../../lib/firebase';
import { getScenario, getSitemap } from '../../../lib/contract/repository';
import ScenarioClient from './ScenarioClient';

// Список опубликованных slug сценариев из `sitemap_public/main` (A-10b.
// Без N+1 по коллекциям (A-10d.
export async function generateStaticParams() {
  const db = getDb();
  if (!db) return [];
  const sitemap = await getSitemap(db);
  if (!sitemap) return [];
  return sitemap.scenarioSlugs.map((slug) => ({ id: slug }));
}

type Props = { params: { id: string } };

// Метаданные из `scenario_public` (US-E1-04, SR-SEO-1.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const db = getDb();
  if (!db) return { title: params.id };
  const scenario = await getScenario(db, params.id);
  if (!scenario) return { title: params.id };
  return {
    title: scenario.seoTitle ?? scenario.title,
    description: scenario.seoDescription,
  };
}

export default function ScenarioPage({ params }: Props) {
  return <ScenarioClient id={params.id} />;
}
