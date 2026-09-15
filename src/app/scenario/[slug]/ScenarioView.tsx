// Рендер сценария (SP-E4-01, SR-SEO-1).
//
// Серверный компонент: получает данные `scenario_public/{id}` из page.tsx
// (SSG), рендерит контент в статический HTML — доступен для индексации.

import Link from 'next/link';
import { ScenarioPublic } from '../../../lib/contract/types';
import SupabaseImage from '../../../components/SupabaseImage';
import InstallCta from '../../../components/InstallCta';

export default function ScenarioView({ scenario }: { scenario: ScenarioPublic }) {
  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Сценарий: {scenario.title}</h1>
      <InstallCta />
      {scenario.whyTheseGames && <p style={{ whiteSpace: 'pre-wrap' }}>{scenario.whyTheseGames}</p>}
      {scenario.games && scenario.games.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {scenario.games.map((game, i) => (
            <section key={i}>
              <h2>
                <Link href={`/games/${game.slug}`}>{game.title}</Link>
              </h2>
              <p>{game.shortDescription}</p>
              {game.imageRef && (
                <SupabaseImage
                  imageRef={game.imageRef}
                  alt={game.alt ?? game.title}
                  width={800}
                  height={600}
                />
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}