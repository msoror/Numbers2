export type Language = 'en' | 'ar';

export interface BilingualText {
  en: string;
  ar: string;
}

export type GameScreenState =
  | 'TITLE_MENU'
  | 'MAP_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'ROUND_SUMMARY'
  | 'STICKER_BOOK'
  | 'PRACTICE_MENU'
  | 'PRACTICE_SUBJECT';

export type WorldId = 'bazaar' | 'nile' | 'clock' | 'workshop';

export type SubjectId =
  | 'place_value'
  | 'money'
  | 'vertical_math'
  | 'arrays'
  | 'clock'
  | 'calendar'
  | 'length'
  | 'capacity'
  | 'mass'
  | 'shapes'
  | 'fractions'
  | 'graphs';

export type PracticeSubjectId = SubjectId;

export type LevelNumber = 1 | 2 | 3 | 4 | 5;

export type StickerId =
  | 'bazaar_scarab'
  | 'egypt_pound_chest'
  | 'khan_lantern'
  | 'nile_felucca'
  | 'palm_abacus'
  | 'golden_array'
  | 'sundial_badge'
  | 'oasis_clock'
  | 'calendar_moon'
  | 'papyrus_ruler'
  | 'nile_amphora'
  | 'pyramid_prism';

export interface StickerInfo {
  id: StickerId;
  name: BilingualText;
  worldId: WorldId;
  subjectId: SubjectId;
  unlockHint: BilingualText;
}

export interface SubjectConfig {
  id: SubjectId;
  order: string;
  worldId: WorldId;
  title: BilingualText;
  shortTitle: BilingualText;
  subtitle: BilingualText;
  termTag: BilingualText;
  stickerId: StickerId;
  accentColor: string;
  surfaceTint: string;
}

export interface LevelConfig {
  id: string;
  subjectId: SubjectId;
  subjectName: BilingualText;
  worldId: WorldId;
  worldName: BilingualText;
  levelNumber: LevelNumber;
  difficultyLabel: BilingualText;
  title: BilingualText;
  conceptSummary: BilingualText;
  termTag: BilingualText;
  roundsCount: number;
  stickerId: StickerId;
}

export interface PlayerProgress {
  language: Language;
  starsByLevel: Record<string, number>;
  unlockedStickers: StickerId[];
  practicedSubjects: SubjectId[];
  celebratedMasteredSubjects: SubjectId[];
  totalStars: number;
  totalGems: number;
  bestStreak: number;
  muted: boolean;
  musicEnabled: boolean;
}

/* World 1: Cairo Bazaar (Place Value H-T-O, Money LE, 3-Digit Compare) */
export type BazaarQuestion =
  | {
      id: string;
      kind: 'place_value';
      hundreds: number;
      tens: number;
      ones: number;
      value: number;
      options: number[];
      prompt: BilingualText;
      hint: BilingualText;
    }
  | {
      id: string;
      kind: 'money_build';
      targetAmount: number;
      itemName: BilingualText;
      availableNotes: number[];
      prompt: BilingualText;
      hint: BilingualText;
    }
  | {
      id: string;
      kind: 'money_change_or_compare';
      subKind: 'change' | 'compare';
      leftValue: number;
      rightValue: number;
      leftLabel: BilingualText;
      rightLabel: BilingualText;
      answerCompare?: '<' | '=' | '>';
      answerNumber?: number;
      optionsNumber?: number[];
      prompt: BilingualText;
      hint: BilingualText;
    };

/* World 2: Nile Felucca (2/3-Digit Addition & Subtraction with Regrouping, Arrays) */
export type NileQuestion =
  | {
      id: string;
      kind: 'vertical_math';
      operator: '+' | '-';
      top: number;
      bottom: number;
      answer: number;
      needsRegroup: boolean;
      options: number[];
      prompt: BilingualText;
      hint: BilingualText;
    }
  | {
      id: string;
      kind: 'array_multiply';
      rows: number;
      cols: number;
      answer: number;
      options: number[];
      prompt: BilingualText;
      hint: BilingualText;
    };

/* World 3: Oasis Clocktower (Analog/Digital Time, Quarter Hours, Elapsed/Calendar) */
export type ClockQuestion =
  | {
      id: string;
      kind: 'read_clock';
      hour: number; // 1..12
      minute: number; // 0, 5, 10, ..., 55
      dayPeriod: 'am' | 'pm';
      options: { hour: number; minute: number }[];
      correctIndex: number;
      prompt: BilingualText;
      hint: BilingualText;
    }
  | {
      id: string;
      kind: 'set_clock';
      targetHour: number;
      targetMinute: number;
      startHour: number;
      startMinute: number;
      stepMinutes?: 5 | 15;
      prompt: BilingualText;
      hint: BilingualText;
    }
  | {
      id: string;
      kind: 'elapsed_or_calendar';
      prompt: BilingualText;
      displayBadge: BilingualText;
      options: BilingualText[];
      correctIndex: number;
      hint: BilingualText;
    };

/* World 4: Pyramid Workshop (Length cm/m, Capacity L/mL, Mass g/kg, Shapes, Fractions, Graphs) */
export type ShapeKind =
  | 'triangle'
  | 'square'
  | 'rectangle'
  | 'pentagon'
  | 'hexagon'
  | 'cube'
  | 'cylinder'
  | 'pyramid';

export type WorkshopQuestion =
  | {
      id: string;
      kind: 'capacity_pour';
      targetMl: number;
      maxMl: number;
      scoops: number[];
      prompt: BilingualText;
      hint: BilingualText;
    }
  | {
      id: string;
      kind: 'measure_length';
      objectName: BilingualText;
      objectColor: string;
      lengthCm: number;
      startCm: number;
      maxCm: number;
      options: number[];
      prompt: BilingualText;
      hint: BilingualText;
    }
  | {
      id: string;
      kind: 'mass_or_unit';
      leftLabel: BilingualText;
      rightLabel: BilingualText;
      leftWeightGrams: number;
      rightWeightGrams: number;
      options: BilingualText[];
      correctIndex: number;
      prompt: BilingualText;
      hint: BilingualText;
    }
  | {
      id: string;
      kind: 'fraction_or_shape';
      subKind: 'fraction' | 'shape' | 'graph';
      fractionTotalParts?: number;
      fractionShadedParts?: number;
      shape?: ShapeKind;
      graphBars?: { label: BilingualText; count: number; color: string }[];
      options: BilingualText[];
      correctIndex: number;
      prompt: BilingualText;
      hint: BilingualText;
    };

export type ActiveQuestion =
  | { stage: 'bazaar'; data: BazaarQuestion }
  | { stage: 'nile'; data: NileQuestion }
  | { stage: 'clock'; data: ClockQuestion }
  | { stage: 'workshop'; data: WorkshopQuestion };

export interface RoundResult {
  levelId: string;
  correctFirstTry: number;
  totalRounds: number;
  starsEarned: 1 | 2 | 3;
  gemsEarned: number;
  newlyUnlockedSticker: StickerId | null;
}
