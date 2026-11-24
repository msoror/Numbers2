import {
  ActiveLevelSessionSnapshot,
  EquippedCosmetics,
  LevelAttemptRecord,
  LevelConfig,
  LevelNumber,
  PlacementExamResult,
  PlayerProgress,
  RoundAdvancePayload,
  SubjectId,
} from '../types/game';

export const MASTERY_ACCURACY_THRESHOLD = 0.8;
export const MAX_RECENT_ATTEMPTS = 3;
export const REPEATED_MISTAKE_THRESHOLD = 2;
export const MAX_PLACEMENT_HISTORY = 5;

const ACTIVE_SESSION_STORAGE_KEY = 'nile_numbers_active_session_v1';

export interface RoundSessionState {
  roundIndex: number;
  totalRounds: number;
  missedCurrentRound: boolean;
  resolvedCurrentRound: boolean;
  firstTryCount: number;
  streak: number;
  bestStreak: number;
  mistakeSkills: string[];
  finished: boolean;
}

export interface RoundRewards {
  correctFirstTry: number;
  totalRounds: number;
  starsEarned: 1 | 2 | 3;
  gemsEarned: number;
  bestStreak: number;
  accuracy: number;
}

export function createRoundSession(totalRounds: number, initialBestStreak = 0): RoundSessionState {
  return {
    roundIndex: 0,
    totalRounds: Math.max(1, totalRounds),
    missedCurrentRound: false,
    resolvedCurrentRound: false,
    firstTryCount: 0,
    streak: 0,
    bestStreak: Math.max(0, initialBestStreak),
    mistakeSkills: [],
    finished: false,
  };
}

/**
 * Records a single user answer attempt synchronously.
 * Updates streak and bestStreak immediately on every answer so live HUD
 * and persisted progress never lag behind or miss the final question.
 */
export function recordRoundAttempt(
  state: RoundSessionState,
  isCorrect: boolean,
  skillKey?: string
): RoundSessionState {
  if (state.finished || state.resolvedCurrentRound) return state;

  if (isCorrect) {
    const nextStreak = state.missedCurrentRound ? 1 : state.streak + 1;
    const nextBestStreak = Math.max(state.bestStreak, nextStreak);
    return {
      ...state,
      resolvedCurrentRound: true,
      streak: nextStreak,
      bestStreak: nextBestStreak,
    };
  }

  return {
    ...state,
    missedCurrentRound: true,
    streak: 0,
    mistakeSkills: skillKey ? [...state.mistakeSkills, skillKey] : state.mistakeSkills,
  };
}

/**
 * Advances to the next question or finalizes the round using an explicit
 * per-question result ({ correctFirstTry }) so the final question is always tallied.
 */
export function advanceRoundSession(
  state: RoundSessionState,
  payload: RoundAdvancePayload
): RoundSessionState {
  if (state.finished) return state;

  const updatedFirstTry = state.firstTryCount + (payload.correctFirstTry ? 1 : 0);
  let nextStreak = state.streak;
  let nextBestStreak = state.bestStreak;
  if (!state.resolvedCurrentRound) {
    nextStreak = payload.correctFirstTry ? state.streak + 1 : 1;
    nextBestStreak = Math.max(state.bestStreak, nextStreak);
  }

  const nextIndex = state.roundIndex + 1;
  const finished = nextIndex >= state.totalRounds;

  return {
    ...state,
    roundIndex: finished ? state.roundIndex : nextIndex,
    firstTryCount: updatedFirstTry,
    streak: nextStreak,
    bestStreak: nextBestStreak,
    missedCurrentRound: false,
    resolvedCurrentRound: false,
    finished,
  };
}

export function computeRoundRewards(state: RoundSessionState): RoundRewards {
  const totalRounds = Math.max(1, state.totalRounds);
  const correctFirstTry = Math.min(totalRounds, Math.max(0, state.firstTryCount));
  const accuracy = correctFirstTry / totalRounds;

  let starsEarned: 1 | 2 | 3;
  if (totalRounds === 6) {
    starsEarned = correctFirstTry >= 5 ? 3 : correctFirstTry >= 3 ? 2 : 1;
  } else {
    starsEarned = accuracy >= 0.8 ? 3 : accuracy >= 0.5 ? 2 : 1;
  }

  const gemsEarned = correctFirstTry * 5 + starsEarned * 10;

  return {
    correctFirstTry,
    totalRounds,
    starsEarned,
    gemsEarned,
    bestStreak: state.bestStreak,
    accuracy,
  };
}

/* ============================================================================
   COMPLETION VS. MASTERY (>= 80% RECENT FIRST-TRY ACCURACY OVER LAST 3 RUNS)
   ============================================================================ */

export function appendLevelAttempt(
  existing: LevelAttemptRecord[] | undefined,
  firstTry: number,
  total: number,
  timestamp = Date.now()
): LevelAttemptRecord[] {
  const safeTotal = Math.max(1, total);
  const safeFirstTry = Math.min(safeTotal, Math.max(0, firstTry));
  const next = [...(existing ?? []), { firstTry: safeFirstTry, total: safeTotal, timestamp }];
  return next.slice(-MAX_RECENT_ATTEMPTS);
}

export function isLevelCompleted(levelId: string, progress: PlayerProgress): boolean {
  const hasStars = (progress.starsByLevel[levelId] ?? 0) > 0;
  const hasAttempts = (progress.recentAttemptsByLevel[levelId]?.length ?? 0) > 0;
  return hasStars || hasAttempts;
}

export function getLevelRecentAccuracy(
  levelId: string,
  progress: PlayerProgress
): number | null {
  const attempts = progress.recentAttemptsByLevel[levelId];
  if (!attempts || attempts.length === 0) return null;
  let totalFirstTry = 0;
  let totalQuestions = 0;
  for (const rec of attempts) {
    totalFirstTry += rec.firstTry;
    totalQuestions += rec.total;
  }
  if (totalQuestions <= 0) return null;
  return totalFirstTry / totalQuestions;
}

export function isLevelMastered(levelId: string, progress: PlayerProgress): boolean {
  if (!isLevelCompleted(levelId, progress)) return false;
  const acc = getLevelRecentAccuracy(levelId, progress);
  return acc !== null && acc >= MASTERY_ACCURACY_THRESHOLD;
}

export interface SubjectMasteryStats {
  completedLevels: number;
  masteredLevels: number;
  totalLevels: number;
  earnedStars: number;
  maxStars: number;
  recentAccuracy: number | null;
  recentAccuracyPct: number | null;
  isCompleted: boolean;
  isMastered: boolean;
  starsPerLevel: number[];
}

export function getSubjectMasteryStats(
  subjectId: SubjectId,
  allLevels: LevelConfig[],
  progress: PlayerProgress
): SubjectMasteryStats {
  const levels = allLevels
    .filter((l) => l.subjectId === subjectId)
    .sort((a, b) => a.levelNumber - b.levelNumber);

  const starsPerLevel = levels.map((lvl) => progress.starsByLevel[lvl.id] ?? 0);
  const completedLevels = levels.filter((lvl) => isLevelCompleted(lvl.id, progress)).length;
  const masteredLevels = levels.filter((lvl) => isLevelMastered(lvl.id, progress)).length;
  const earnedStars = starsPerLevel.reduce((sum, s) => sum + s, 0);
  const maxStars = levels.length * 3;

  let totalFirstTry = 0;
  let totalQuestions = 0;
  let levelsWithRecentHistory = 0;

  for (const lvl of levels) {
    const attempts = progress.recentAttemptsByLevel[lvl.id];
    if (attempts && attempts.length > 0) {
      levelsWithRecentHistory += 1;
      for (const rec of attempts) {
        totalFirstTry += rec.firstTry;
        totalQuestions += rec.total;
      }
    }
  }

  const recentAccuracy = totalQuestions > 0 ? totalFirstTry / totalQuestions : null;
  const recentAccuracyPct =
    recentAccuracy !== null ? Math.round(recentAccuracy * 100) : null;

  const isCompleted = levels.length > 0 && completedLevels === levels.length;
  const isMastered =
    isCompleted &&
    levelsWithRecentHistory === levels.length &&
    recentAccuracy !== null &&
    recentAccuracy >= MASTERY_ACCURACY_THRESHOLD;

  return {
    completedLevels,
    masteredLevels,
    totalLevels: levels.length,
    earnedStars,
    maxStars,
    recentAccuracy,
    recentAccuracyPct,
    isCompleted,
    isMastered,
    starsPerLevel,
  };
}

export function isLevelUnlockedForPlayer(level: LevelConfig, progress: PlayerProgress): boolean {
  if (level.levelNumber <= 2) return true;
  const recommendedUnlock = progress.recommendedUnlockedLevels[level.subjectId] ?? 2;
  if (level.levelNumber <= recommendedUnlock) return true;
  const prevId = `${level.subjectId}-${level.levelNumber - 1}`;
  return isLevelCompleted(prevId, progress);
}

/**
 * Picks the next unfinished unlocked level for the Home screen "Continue Learning" CTA.
 */
export function getNextContinueLevel(
  allLevels: LevelConfig[],
  progress: PlayerProgress
): LevelConfig {
  const startedSubjects = new Set<SubjectId>();
  for (const lvl of allLevels) {
    if (isLevelCompleted(lvl.id, progress)) {
      startedSubjects.add(lvl.subjectId);
    }
  }

  for (const subjId of startedSubjects) {
    const nextInStarted = allLevels.find(
      (l) =>
        l.subjectId === subjId &&
        isLevelUnlockedForPlayer(l, progress) &&
        !isLevelCompleted(l.id, progress)
    );
    if (nextInStarted) return nextInStarted;
  }

  const firstUnfinished = allLevels.find(
    (l) => isLevelUnlockedForPlayer(l, progress) && !isLevelCompleted(l.id, progress)
  );
  if (firstUnfinished) return firstUnfinished;

  const firstUnmastered = allLevels.find((l) => !isLevelMastered(l.id, progress));
  return firstUnmastered ?? allLevels[0];
}

export const DEFAULT_EQUIPPED_COSMETICS: EquippedCosmetics = {
  outfitId: null,
  accessoryId: null,
  trailId: null,
};

export function createDefaultProgress(): PlayerProgress {
  return {
    language: 'en',
    starsByLevel: {},
    recentAttemptsByLevel: {},
    mistakeCountsBySkill: {},
    unlockedStickers: [],
    practicedSubjects: [],
    celebratedMasteredSubjects: [],
    purchasedCosmetics: [],
    equippedCosmetics: { ...DEFAULT_EQUIPPED_COSMETICS },
    placementHistory: [],
    recommendedUnlockedLevels: {},
    hasDismissedPlacementPrompt: false,
    totalStars: 0,
    totalGems: 0,
    bestStreak: 0,
    muted: false,
    musicEnabled: true,
  };
}

function sanitizePlacementHistory(
  raw: unknown,
  validSubjectIds: Set<string>
): PlacementExamResult[] {
  if (!Array.isArray(raw)) return [];
  const valid: PlacementExamResult[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Record<string, unknown>;
    const rawSubjects = Array.isArray(item.subjects)
      ? item.subjects
      : Array.isArray(item.subjectResults)
      ? item.subjectResults
      : null;

    if (
      typeof item.id !== 'string' ||
      typeof item.completedAt !== 'string' ||
      typeof item.totalCorrect !== 'number' ||
      typeof item.totalQuestions !== 'number' ||
      item.totalQuestions <= 0 ||
      !rawSubjects
    ) {
      continue;
    }

    const cleanSubjects = rawSubjects
      .filter((s): s is Record<string, unknown> => {
        if (!s || typeof s !== 'object') return false;
        const r = s as Record<string, unknown>;
        return (
          validSubjectIds.has(String(r.subjectId)) &&
          typeof r.correct === 'number' &&
          typeof r.total === 'number' &&
          r.total > 0
        );
      })
      .map((s) => {
        const total = Math.max(1, Math.floor(Number(s.total)));
        const correct = Math.max(0, Math.min(total, Math.floor(Number(s.correct))));
        const rawRec = Number(s.recommendedStartLevel ?? s.recommendedLevel ?? 1);
        const recLevel = ([1, 2, 3, 4, 5].includes(rawRec) ? rawRec : 1) as LevelNumber;
        return {
          subjectId: s.subjectId as SubjectId,
          correct,
          total,
          accuracy: Math.max(0, Math.min(1, Number(s.accuracy) || 0)),
          avgResponseMs: Math.max(0, Math.floor(Number(s.avgResponseMs) || 0)),
          tier: (s.tier === 'strong' || s.tier === 'developing' || s.tier === 'needs_support'
            ? s.tier
            : 'developing') as PlacementExamResult['subjects'][number]['tier'],
          recommendedStartLevel: recLevel,
        };
      });

    if (cleanSubjects.length === 0) continue;

    const rawOverall = (item.overallLevel ?? item.overallLevelLabel) as
      | { en?: unknown; ar?: unknown }
      | undefined;
    const overallLevel =
      rawOverall && typeof rawOverall.en === 'string' && typeof rawOverall.ar === 'string'
        ? { en: rawOverall.en, ar: rawOverall.ar }
        : { en: 'Growing Explorer', ar: 'مستكشف متطور' };

    const rawPractice = Array.isArray(item.topAreasToPractice)
      ? item.topAreasToPractice
      : Array.isArray(item.topPracticeAreas)
      ? item.topPracticeAreas
      : [];

    valid.push({
      id: item.id,
      completedAt: item.completedAt,
      totalCorrect: Math.max(0, Math.floor(item.totalCorrect)),
      totalQuestions: Math.max(1, Math.floor(item.totalQuestions)),
      overallAccuracy: Math.max(0, Math.min(1, Number(item.overallAccuracy) || 0)),
      overallLevel,
      avgResponseMs: Math.max(0, Math.floor(Number(item.avgResponseMs) || 0)),
      subjects: cleanSubjects,
      topStrengths: Array.isArray(item.topStrengths)
        ? item.topStrengths.filter((id): id is SubjectId => validSubjectIds.has(String(id)))
        : [],
      topAreasToPractice: rawPractice.filter((id): id is SubjectId =>
        validSubjectIds.has(String(id))
      ),
    });
  }
  return valid.slice(0, MAX_PLACEMENT_HISTORY);
}

/**
 * Safely migrates legacy or partial localStorage / imported JSON progress snapshots
 * without losing stars, gems, stickers, practiced subjects, placement history, or settings.
 */
export function migrateProgress(
  raw: unknown,
  validLevelIds: Set<string>,
  validSubjectIds: Set<string>
): PlayerProgress {
  const defaults = createDefaultProgress();
  if (!raw || typeof raw !== 'object') return defaults;

  const parsed = raw as Partial<PlayerProgress>;

  const sanitizedStars: Record<string, number> = {};
  let totalStars = 0;
  if (parsed.starsByLevel && typeof parsed.starsByLevel === 'object') {
    for (const [lvlId, stars] of Object.entries(parsed.starsByLevel)) {
      if (validLevelIds.has(lvlId) && typeof stars === 'number' && stars > 0) {
        const clamped = Math.min(3, Math.max(0, Math.floor(stars)));
        sanitizedStars[lvlId] = clamped;
        totalStars += clamped;
      }
    }
  }

  const sanitizedAttempts: Record<string, LevelAttemptRecord[]> = {};
  if (parsed.recentAttemptsByLevel && typeof parsed.recentAttemptsByLevel === 'object') {
    for (const [lvlId, list] of Object.entries(parsed.recentAttemptsByLevel)) {
      if (validLevelIds.has(lvlId) && Array.isArray(list)) {
        const clean = list
          .filter(
            (r): r is LevelAttemptRecord =>
              !!r &&
              typeof r === 'object' &&
              typeof r.firstTry === 'number' &&
              typeof r.total === 'number' &&
              r.total > 0
          )
          .slice(-MAX_RECENT_ATTEMPTS)
          .map((r) => ({
            firstTry: Math.min(r.total, Math.max(0, Math.floor(r.firstTry))),
            total: Math.max(1, Math.floor(r.total)),
            timestamp: typeof r.timestamp === 'number' ? r.timestamp : 0,
          }));
        if (clean.length > 0) sanitizedAttempts[lvlId] = clean;
      }
    }
  }

  const sanitizedMistakes: Record<string, number> = {};
  if (parsed.mistakeCountsBySkill && typeof parsed.mistakeCountsBySkill === 'object') {
    for (const [k, v] of Object.entries(parsed.mistakeCountsBySkill)) {
      if (typeof v === 'number' && v > 0) {
        sanitizedMistakes[k] = Math.floor(v);
      }
    }
  }

  const sanitizedPracticed: SubjectId[] = Array.isArray(parsed.practicedSubjects)
    ? parsed.practicedSubjects.filter((id): id is SubjectId =>
        validSubjectIds.has(String(id))
      )
    : [];

  const sanitizedCelebrated: SubjectId[] = Array.isArray(parsed.celebratedMasteredSubjects)
    ? parsed.celebratedMasteredSubjects.filter((id): id is SubjectId =>
        validSubjectIds.has(String(id))
      )
    : [];

  const purchasedCosmetics: string[] = Array.isArray(parsed.purchasedCosmetics)
    ? Array.from(
        new Set(parsed.purchasedCosmetics.filter((id): id is string => typeof id === 'string'))
      )
    : [];

  const rawEquipped = parsed.equippedCosmetics;
  const equippedCosmetics: EquippedCosmetics = {
    outfitId:
      rawEquipped &&
      typeof rawEquipped.outfitId === 'string' &&
      purchasedCosmetics.includes(rawEquipped.outfitId)
        ? rawEquipped.outfitId
        : null,
    accessoryId:
      rawEquipped &&
      typeof rawEquipped.accessoryId === 'string' &&
      purchasedCosmetics.includes(rawEquipped.accessoryId)
        ? rawEquipped.accessoryId
        : null,
    trailId:
      rawEquipped &&
      typeof rawEquipped.trailId === 'string' &&
      purchasedCosmetics.includes(rawEquipped.trailId)
        ? rawEquipped.trailId
        : null,
  };

  const placementHistory = sanitizePlacementHistory(parsed.placementHistory, validSubjectIds);

  const recommendedUnlockedLevels: Partial<Record<SubjectId, LevelNumber>> = {};
  if (parsed.recommendedUnlockedLevels && typeof parsed.recommendedUnlockedLevels === 'object') {
    for (const [subjId, lvl] of Object.entries(parsed.recommendedUnlockedLevels)) {
      if (
        validSubjectIds.has(subjId) &&
        typeof lvl === 'number' &&
        [1, 2, 3, 4, 5].includes(Math.floor(lvl))
      ) {
        recommendedUnlockedLevels[subjId as SubjectId] = Math.floor(lvl) as LevelNumber;
      }
    }
  }

  return {
    ...defaults,
    language: parsed.language === 'ar' ? 'ar' : 'en',
    starsByLevel: sanitizedStars,
    recentAttemptsByLevel: sanitizedAttempts,
    mistakeCountsBySkill: sanitizedMistakes,
    unlockedStickers: Array.isArray(parsed.unlockedStickers) ? parsed.unlockedStickers : [],
    practicedSubjects: sanitizedPracticed,
    celebratedMasteredSubjects: sanitizedCelebrated,
    purchasedCosmetics,
    equippedCosmetics,
    placementHistory,
    recommendedUnlockedLevels,
    hasDismissedPlacementPrompt: Boolean(parsed.hasDismissedPlacementPrompt),
    totalStars,
    totalGems:
      typeof parsed.totalGems === 'number' && parsed.totalGems >= 0
        ? Math.floor(parsed.totalGems)
        : 0,
    bestStreak:
      typeof parsed.bestStreak === 'number' && parsed.bestStreak >= 0
        ? Math.floor(parsed.bestStreak)
        : 0,
    muted: Boolean(parsed.muted),
    musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : true,
  };
}

/* ============================================================================
   UNFINISHED LEVEL RESUME & PROGRESS JSON EXPORT/IMPORT
   ============================================================================ */

export function saveActiveLevelSession(snapshot: ActiveLevelSessionSnapshot): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore quota errors
  }
}

export function loadActiveLevelSession(
  validLevelIds: Set<string>
): ActiveLevelSessionSnapshot | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ActiveLevelSessionSnapshot>;
    if (
      !parsed ||
      typeof parsed.levelId !== 'string' ||
      !validLevelIds.has(parsed.levelId) ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0 ||
      typeof parsed.roundIndex !== 'number' ||
      parsed.roundIndex < 0 ||
      parsed.roundIndex >= parsed.questions.length
    ) {
      return null;
    }
    return {
      levelId: parsed.levelId,
      questions: parsed.questions,
      roundIndex: parsed.roundIndex,
      totalRounds: parsed.questions.length,
      missedCurrentRound: Boolean(parsed.missedCurrentRound),
      resolvedCurrentRound: false,
      firstTryCount: Math.max(0, Math.floor(Number(parsed.firstTryCount) || 0)),
      streak: Math.max(0, Math.floor(Number(parsed.streak) || 0)),
      bestStreak: Math.max(0, Math.floor(Number(parsed.bestStreak) || 0)),
      mistakeSkills: Array.isArray(parsed.mistakeSkills)
        ? parsed.mistakeSkills.filter((s): s is string => typeof s === 'string')
        : [],
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function clearActiveLevelSession(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export interface ProgressBackupEnvelope {
  app: 'nile-numbers';
  version: 2;
  exportedAt: string;
  progress: PlayerProgress;
}

export function serializeProgressBackup(progress: PlayerProgress): string {
  const envelope: ProgressBackupEnvelope = {
    app: 'nile-numbers',
    version: 2,
    exportedAt: new Date().toISOString(),
    progress,
  };
  return JSON.stringify(envelope, null, 2);
}

export function parseProgressBackup(
  jsonText: string,
  validLevelIds: Set<string>,
  validSubjectIds: Set<string>
): PlayerProgress | null {
  try {
    const parsed = JSON.parse(jsonText) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const record = parsed as Record<string, unknown>;
    const candidate =
      record.app === 'nile-numbers' && record.progress && typeof record.progress === 'object'
        ? record.progress
        : record;

    // Require at least one recognizable progress field so arbitrary JSON files are rejected safely
    const c = candidate as Record<string, unknown>;
    const looksValid =
      'starsByLevel' in c ||
      'totalGems' in c ||
      'unlockedStickers' in c ||
      'language' in c ||
      'placementHistory' in c;
    if (!looksValid) return null;

    return migrateProgress(candidate, validLevelIds, validSubjectIds);
  } catch {
    return null;
  }
}
