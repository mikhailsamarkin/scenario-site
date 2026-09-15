// Хелперы связей между агрегатами для списков сайта (SP-E10-01..03).
//
// У слайда карусели (`Slide`) нет ссылки на игру — gameId извлекается из
// формата imageRef `games/{gameId}/{файл}` (ED-14, бакет games). Слаги —
// из `sitemap_public/main` (A-10b, без N+1 чтений деталек).

/** Извлекает gameId из imageRef `games/{gameId}/{файл}`; null — другой формат. */
export function gameIdFromImageRef(imageRef: string): string | null {
  const match = /^games\/([^/]+)\//.exec(imageRef);
  return match ? match[1] : null;
}

/** Fallback-заголовок из slug: `romantic-evening` → `Romantic evening`. */
export function titleFromSlug(slug: string): string {
  const words = slug.split('-').filter(Boolean);
  if (words.length === 0) return slug;
  const [first, ...rest] = words;
  const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  return [capitalize(first), ...rest].join(' ');
}
