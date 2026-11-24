import { ActiveQuestion } from '../types/game';

const SEEN_QUESTIONS_STORAGE_KEY = 'nile_numbers_seen_questions_v1';
const MAX_PERSISTED_SIGNATURES = 800;

// In-memory session set so questions never repeat even when localStorage is unavailable (e.g. Node tests / private mode)
const sessionSeenSignatures = new Set<string>();

/**
 * Computes a canonical content signature for any generated question so the
 * no-repeat registry can recognize mathematically identical questions even
 * across different runs or randomized option orders.
 */
export function getQuestionSignature(question: ActiveQuestion): string {
  const { data } = question;
  switch (data.kind) {
    case 'place_value':
      return `pv:${data.hundreds}:${data.tens}:${data.ones}`;
    case 'money_build':
      return `mb:${data.targetAmount}:${data.itemName.en}`;
    case 'money_change_or_compare':
      return `mcc:${data.subKind}:${data.leftValue}:${data.rightValue}`;
    case 'vertical_math':
      return `vm:${data.operator}:${data.top}:${data.bottom}`;
    case 'array_multiply':
      return `arr:${data.rows}x${data.cols}`;
    case 'read_clock':
      return `rc:${data.hour}:${data.minute}:${data.dayPeriod}`;
    case 'set_clock':
      return `sc:${data.targetHour}:${data.targetMinute}:${data.startHour}:${data.startMinute}`;
    case 'elapsed_or_calendar':
      return `cal:${data.prompt.en}|${data.displayBadge.en}`;
    case 'capacity_pour':
      return `cap:${data.targetMl}:${data.scoops.join(',')}`;
    case 'measure_length':
      return `len:${data.startCm}:${data.lengthCm}:${data.objectName.en}`;
    case 'mass_or_unit':
      return `mass:${data.leftWeightGrams}:${data.rightWeightGrams}:${data.leftLabel.en}:${data.rightLabel.en}:${data.prompt.en}`;
    case 'fraction_or_shape':
      if (data.subKind === 'fraction') {
        return `frac:${data.fractionShadedParts}/${data.fractionTotalParts}:${data.prompt.en}`;
      }
      if (data.subKind === 'shape') {
        return `shp:${data.shape}:${data.prompt.en}`;
      }
      return `gr:${(data.graphBars ?? []).map((b) => `${b.label.en}=${b.count}`).join(',')}:${data.prompt.en}`;
  }
}

export function loadPersistedQuestionSignatures(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEEN_QUESTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === 'string');
  } catch {
    return [];
  }
}

/**
 * Returns the combined Set of question signatures already shown in the
 * current session AND across recent persisted sessions in localStorage.
 */
export function getCombinedSeenSignatures(): Set<string> {
  const combined = new Set<string>(loadPersistedQuestionSignatures());
  for (const sig of sessionSeenSignatures) {
    combined.add(sig);
  }
  return combined;
}

/**
 * Records newly shown question signatures into both session memory and
 * localStorage (keeping a rolling window of the most recent 800 signatures).
 */
export function recordSeenQuestionSignatures(signatures: Iterable<string>): void {
  const persisted = loadPersistedQuestionSignatures();
  const seenInPersisted = new Set<string>(persisted);

  for (const sig of signatures) {
    if (!sig) continue;
    sessionSeenSignatures.add(sig);
    if (!seenInPersisted.has(sig)) {
      persisted.push(sig);
      seenInPersisted.add(sig);
    }
  }

  const trimmed =
    persisted.length > MAX_PERSISTED_SIGNATURES
      ? persisted.slice(-MAX_PERSISTED_SIGNATURES)
      : persisted;

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SEEN_QUESTIONS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Ignore storage quota errors
    }
  }
}

export function recordSeenQuestions(questions: ActiveQuestion[]): void {
  recordSeenQuestionSignatures(questions.map(getQuestionSignature));
}

export function clearSessionQuestionHistory(): void {
  sessionSeenSignatures.clear();
}

export function resetAllQuestionHistory(): void {
  sessionSeenSignatures.clear();
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(SEEN_QUESTIONS_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}
