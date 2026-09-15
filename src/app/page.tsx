// Главная страница сайта (SP-E10-01, FR-W-1).
//
// Серверный компонент: читает `home_feed/main` + `sitemap_public/main`
// (2 чтения, A-10b) и рендерит витрину, группы смысла и карусель в
// статический HTML (SR-SEO-1). Медиа — Supabase Storage (ED-14).
// Те же агрегаты, что у главного экрана МП (US-E2-01, US-E7-01).

import Link from 'next/link';

import SupabaseImage from '../components/SupabaseImage';
import { getDb } from '../lib/firebase';
import { getHomeFeed, getSitemap } from '../lib/contract/repository';
import { gameIdFromImageRef } from '../lib/contract/links';
import type { ScenarioCard, Slide } from '../lib/contract/types';

export default async function HomePage() {
  const db = getDb();
  const [feed, sitemap] = db ? await Promise.all([getHomeFeed(db), getSitemap(db)]) : [null, null];

  if (!feed) {
    return (
      <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
        <h1>Scenario</h1>
        <p>Контент появится позже.</p>
        <p>
          <Link href="/scenarios">Сценарии</Link>
        </p>
      </main>
    );
  }

  // slug игр для ссылок карусели: gameId → slug из sitemap (без N+1).
  const gameSlugById = new Map((sitemap?.gameEntries ?? []).map((e) => [e.id, e.slug]));

  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Что сегодня?</h1>

      {/* Витрина (A-12 home_feed.vitrine, AC-01). */}
      {feed.vitrine.length > 0 && (
        <section>
          <h2>Витрина</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {feed.vitrine.map((card) => (
              <ScenarioCardLink key={card.scenarioId} card={card} />
            ))}
          </div>
        </section>
      )}

      {/* Группы смысла (US-E7-01): деталок групп на сайте нет —
          ведут на список сценариев. */}
      {feed.groups.length > 0 && (
        <section>
          <h2>Подборки</h2>
          <ul>
            {feed.groups.map((group) => (
              <li key={group.semanticGroupId}>
                <Link href="/scenarios">{group.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Карусель игр (A-12 home_feed.carousel): slug из sitemap. */}
      {feed.carousel.length > 0 && (
        <section>
          <h2>Игры</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {feed.carousel.map((slide, i) => {
              const gameId = gameIdFromImageRef(slide.imageRef);
              return (
                <CarouselSlide
                  key={i}
                  slide={slide}
                  slug={gameId ? (gameSlugById.get(gameId) ?? null) : null}
                />
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

function ScenarioCardLink({ card }: { card: ScenarioCard }) {
  return (
    <article>
      <h3>
        <Link href={`/scenario/${card.slug}`}>{card.title}</Link>
      </h3>
      {card.subtitle && <p>{card.subtitle}</p>}
      {card.imageRef && (
        <SupabaseImage
          imageRef={card.imageRef}
          alt={card.alt ?? card.title}
          width={800}
          height={600}
        />
      )}
    </article>
  );
}

function CarouselSlide({ slide, slug }: { slide: Slide; slug: string | null }) {
  const label = slide.caption ?? slide.alt ?? slug;
  if (!label) return null;
  return (
    <article>
      <h3>{slug ? <Link href={`/games/${slug}`}>{label}</Link> : label}</h3>
      {slide.alt && <p>{slide.alt}</p>}
      <SupabaseImage
        imageRef={slide.imageRef}
        alt={slide.alt ?? slide.caption ?? label}
        width={800}
        height={600}
      />
    </article>
  );
}
