import {getDb} from '../../../lib/firebase';
import {getSitemap} from '../../../lib/contract/repository';
import ScenarioClient from './ScenarioClient';

// Список опубликованных slug сценариев из `sitemap_public/main` (A-10b).
// Без N+1 по коллекциям (A-10d).
export async function generateStaticParams() {
  const db = getDb();
  if (!db) return [];
  const sitemap = await getSitemap(db);
  if (!sitemap) return [];
  return sitemap.scenarioSlugs.map((slug) => ({id: slug}));
}

type Props = {params: {id: string}};

export default function ScenarioPage({params}: Props) {
  return <ScenarioClient id={params.id} />;
}