// Единый контракт данных (SP-E0-01): пути коллекций/документов Firestore.
//
// Источник правды (закрыт для клиентского read — A-38):
//   games, scenarios, semantic_groups, scenario_semantic_groups, scenario_games
// Публичные агрегаты (read-only для клиентов — A-10, A-12):
//   home_feed/main, semantic_groups_public/{id}, scenario_public/{scenarioId},
//   game_public/{gameId}, sitemap_public/main
//
// Имена фиксируются здесь как единая точка согласования для МП и SSG.

/** Пути коллекций-источников правды (закрыты для клиентского read). */
export const SourceCollections = {
  games: 'games',
  scenarios: 'scenarios',
  semanticGroups: 'semantic_groups',
  scenarioSemanticGroups: 'scenario_semantic_groups',
  scenarioGames: 'scenario_games',
} as const;

/** Пути публичных агрегатов (read-only для клиентов). */
export const PublicCollections = {
  homeFeed: 'home_feed',
  semanticGroupsPublic: 'semantic_groups_public',
  scenarioPublic: 'scenario_public',
  gamePublic: 'game_public',
  sitemapPublic: 'sitemap_public',
} as const;

/** Имена документов-синглтонов в публичных коллекциях. */
export const PublicDocuments = {
  homeFeedMain: 'main',
  sitemapMain: 'main',
} as const;

/** Полный путь к документу `home_feed/main`. */
export function homeFeedPath(): string {
  return `${PublicCollections.homeFeed}/${PublicDocuments.homeFeedMain}`;
}

/** Полный путь к документу `semantic_groups_public/{id}`. */
export function semanticGroupPublicPath(id: string): string {
  return `${PublicCollections.semanticGroupsPublic}/${id}`;
}

/** Полный путь к документу `scenario_public/{scenarioId}`. */
export function scenarioPublicPath(scenarioId: string): string {
  return `${PublicCollections.scenarioPublic}/${scenarioId}`;
}

/** Полный путь к документу `game_public/{gameId}`. */
export function gamePublicPath(gameId: string): string {
  return `${PublicCollections.gamePublic}/${gameId}`;
}

/** Полный путь к документу `sitemap_public/main`. */
export function sitemapPublicPath(): string {
  return `${PublicCollections.sitemapPublic}/${PublicDocuments.sitemapMain}`;
}