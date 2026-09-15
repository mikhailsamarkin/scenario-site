// Список сценариев сайта (SP-E10-02, FR-W-2).
//
// Серверный компонент: полный список опубликованных сценариев из
// `sitemap_public/main` + заголовки/медиа из `home_feed/main.vitrine`
// (2 чтения, A-10b, без N+1 чтений scenario_public). Сценарий вне
// витрины (архив, US-E7-02) показывается fallback-заголовком из slug.
// SSG-рендер — контент в статическом HTML (SR-SEO-1).

import type { Metadata } from 'next';
import Link from 'next/link';

import SupabaseImage from '../../components/SupabaseImage';
import { getDb } from '../../lib/firebase';
import { getHomeFeed, getSitemap } from '../../lib/contract/repository';
import { titleFromSlug } from '../../lib/contract/links';
import type { ScenarioCard } from '../../lib/contract/types';

export const metadata: Metadata = {
  title: 'Сценарии — Scenario',
  description: 'Все опубликованные подборки настольных игр по ситуациям.',
};

export default async function ScenariosListPage() {
  const db = getDb();
  const [sitemap, feed] = db ? await Promise.all([getSitemap(db), getHomeFeed(db)]) : [null, null];

  const entries = sitemap?.scenarioEntries ?? [];
  // Заголовки/медиа — из витрины (по scenarioId), без чтения деталек.
  const vitrineById = new Map((feed?.vitrine ?? []).map((card) => [card.scenarioId, card]));

  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Сценарии</h1>
      {entries.length === 0 ? (
        <p>Пока нет опубликованных сценариев.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {entries.map((entry) => (
            <ScenarioListItem key={entry.id} slug={entry.slug} card={vitrineById.get(entry.id)} />
          ))}
        </div>
      )}
    </main>
  );
}

function ScenarioListItem({ slug, card }: { slug: string; card?: ScenarioCard }) {
  const title = card?.title ?? titleFromSlug(slug);
  return (
    <article>
      <h2>
        <Link href={`/scenario/${slug}`}>{title}</Link>
      </h2>
      {card?.subtitle && <p>{card.subtitle}</p>}
      {card?.imageRef && (
        <SupabaseImage imageRef={card.imageRef} alt={card.alt ?? title} width={800} height={600} />
      )}
    </article>
  );
}
