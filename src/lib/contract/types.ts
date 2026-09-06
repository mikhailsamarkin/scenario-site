// Единый контракт данных (SP-E0-01): TS-типы публичных агрегатов,
// которые читает Next.js (SSG). Соответствует §4.2–§4.6 спеки и СТ §4/§5.
//
// Имена полей и enum-ключи совпадают с Dart-моделями (scenario/lib/data/contract)
// и с JSON Schema контракта. В Firestore хранится ключ enum; подпись на
// русском — в UI (ED-2).

/** Состав игроков (CR-4.1 п.1). Ключ → подпись в UI на русском. */
export type PlayersHint =
  | 'players_1'
  | 'players_2'
  | 'players_2_4'
  | 'players_2_5'
  | 'players_2_6'
  | 'players_5_plus';

/** Длительность партии (CR-4.1 п.2). */
export type DurationBucket =
  | 'warmup'
  | 'short'
  | 'evening'
  | 'long'
  | 'main_event';

/** Аудитория по возрасту (CR-4.1 п.3). */
export type AgeHint = 'age_kids' | 'age_family' | 'age_adults';

/** Сложность правил (CR-4.1 п.4). */
export type RulesComplexity = 'easy' | 'normal' | 'heavy';

/** Тип кадра слайда карусели (CR-5). */
export type FrameType =
  | 'teaser'
  | 'box'
  | 'in_play'
  | 'mechanic_closeup';

/** Слайд карусели (CR-5). */
export interface Slide {
  imageRef: string;
  frameType: FrameType;
  caption?: string;
  alt?: string;
}

/** Карточка сценария на главном экране / в группе (§4.2). */
export interface ScenarioCard {
  scenarioId: string;
  slug: string;
  title: string;
  subtitle?: string;
  imageRef?: string;
  alt?: string;
}

/** Ссылка на группу смысла на главном экране (§4.2). */
export interface GroupRef {
  semanticGroupId: string;
  slug: string;
  title: string;
}

/** Публичный агрегат `home_feed/main` (§4.2). */
export interface HomeFeed {
  contentVersion: number;
  updatedAt: string;
  carousel: Slide[];
  vitrine: ScenarioCard[];
  groups: GroupRef[];
}

/** Публичный агрегат группы смысла `semantic_groups_public/{id}` (§4.3). */
export interface SemanticGroupPublic {
  id: string;
  title: string;
  slug: string;
  listOrder?: number;
  isPastArchive: boolean;
  scenarios: ScenarioCard[];
  contentVersion: number;
  updatedAt: string;
}

/** Игра в контексте сценария (`scenario_public.games[]`, §4.4). */
export interface ScenarioGameRef {
  gameId: string;
  slug: string;
  title: string;
  shortDescription: string;
  imageRef?: string;
  alt?: string;
  playersHint?: PlayersHint;
  durationBucket?: DurationBucket;
  ageHint?: AgeHint;
  rulesComplexity?: RulesComplexity;
}

/** Публичный агрегат сценария `scenario_public/{scenarioId}` (§4.4). */
export interface ScenarioPublic {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  whyTheseGames: string;
  seoTitle?: string;
  seoDescription?: string;
  shareTitle?: string;
  shareText?: string;
  shareImageUrl?: string;
  publishedAt?: string;
  games: ScenarioGameRef[];
  semanticGroupIds?: string[];
  contentVersion: number;
  updatedAt: string;
}

/** Сценарий, где участвует игра (`game_public.scenarios[]`, §4.5). */
export interface GameScenarioRef {
  scenarioId: string;
  slug: string;
  title: string;
  shortDescription: string;
}

/** Публичный агрегат игры `game_public/{gameId}` (§4.5). */
export interface GamePublic {
  id: string;
  slug: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  playersHint: PlayersHint;
  durationBucket: DurationBucket;
  ageHint: AgeHint;
  rulesComplexity: RulesComplexity;
  carousel: Slide[];
  scenarios: GameScenarioRef[];
  contentVersion: number;
  updatedAt: string;
}

/** Публичный агрегат `sitemap_public/main` (§4.6). */
export interface SitemapPublic {
  scenarioSlugs: string[];
  gameSlugs: string[];
  contentVersion: number;
  updatedAt: string;
}

/** Версия контракта данных (A-44). */
export const CONTENT_CONTRACT_VERSION = 1;