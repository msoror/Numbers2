import assert from 'node:assert/strict';
import test from 'node:test';
import { EGYPT_LEVELS, EGYPT_SUBJECTS, withSeededRandom } from '../data/egyptLevels';
import {
  buildPlacementReportHtml,
  classifySubjectAccuracy,
  comparePlacementResults,
  generatePlacementExam,
  PlacementAnswerRecord,
  recommendedStartLevelForTier,
  scorePlacementExam,
} from '../data/placementExam';
import { PlacementExamResult } from '../types/game';
import { resetAllQuestionHistory } from './questionHistory';
import {
  createDefaultProgress,
  isLevelUnlockedForPlayer,
  migrateProgress,
  parseProgressBackup,
  serializeProgressBackup,
} from './scoring';

const VALID_LEVEL_IDS = new Set(EGYPT_LEVELS.map((l) => l.id));
const VALID_SUBJECT_IDS = new Set(EGYPT_SUBJECTS.map((s) => s.id));

test('generatePlacementExam produces 24 MC questions (2 per subject, easy -> hard) with comprehension formats', () => {
  resetAllQuestionHistory();
  const exam = withSeededRandom(2025, () => generatePlacementExam());

  assert.equal(exam.length, 24);

  const formats = new Set(exam.map((q) => q.format));
  assert.ok(formats.has('word_problem'), 'Exam should include bilingual word problems');
  assert.ok(formats.has('explain_it'), 'Exam should include explain-it comprehension questions');

  // Verify 2 questions per subject in easy -> hard order across all 12 subjects
  for (let i = 0; i < EGYPT_SUBJECTS.length; i++) {
    const subj = EGYPT_SUBJECTS[i];
    const qEasy = exam[i * 2];
    const qHard = exam[i * 2 + 1];
    assert.equal(qEasy.subjectId, subj.id);
    assert.equal(qHard.subjectId, subj.id);
    assert.equal(qEasy.difficulty, 'easy');
    assert.equal(qHard.difficulty, 'hard');
  }

  for (const q of exam) {
    assert.ok(q.prompt.en.trim().length > 0 && q.prompt.ar.trim().length > 0);
    assert.ok(q.options.length >= 3 && q.options.length <= 4, `Expected 3-4 MC options for ${q.id}`);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length);
    const enOpts = q.options.map((o) => o.en.trim());
    assert.equal(new Set(enOpts).size, enOpts.length, `Duplicate EN options in ${q.id}`);
    if (q.format === 'explain_it') {
      assert.equal(q.options.length, 3, 'Explain-it questions must have 3 choices');
    }
  }
});

test('two consecutive placement exam runs do not repeat questions', () => {
  resetAllQuestionHistory();
  const [run1, run2] = withSeededRandom(8080, () => [
    generatePlacementExam(),
    generatePlacementExam(),
  ]);
  const sigs1 = new Set(run1.map((q) => q.signature));
  const repeated = run2.filter((q) => sigs1.has(q.signature));
  assert.equal(repeated.length, 0, `Found ${repeated.length} repeated placement questions`);
});

test('classifySubjectAccuracy and recommendedStartLevelForTier follow exact thresholds', () => {
  assert.equal(classifySubjectAccuracy(0), 'needs_support');
  assert.equal(classifySubjectAccuracy(0.49), 'needs_support');
  assert.equal(classifySubjectAccuracy(0.5), 'developing');
  assert.equal(classifySubjectAccuracy(0.79), 'developing');
  assert.equal(classifySubjectAccuracy(0.8), 'strong');
  assert.equal(classifySubjectAccuracy(1), 'strong');

  assert.equal(recommendedStartLevelForTier('needs_support', 5000), 1);
  assert.equal(recommendedStartLevelForTier('developing', 5000), 2);
  assert.equal(recommendedStartLevelForTier('strong', 9000), 4);
  assert.equal(recommendedStartLevelForTier('strong', 18000), 3);
});

test('scorePlacementExam computes per-subject tiers, strengths, practice areas, and comparison', () => {
  resetAllQuestionHistory();
  const exam = withSeededRandom(5150, () => generatePlacementExam());

  // Make fractions developing (1/2) on Run 1, then strong (2/2) on Run 2; place_value strong; graphs needs_support (0/2)
  const answers1: Record<string, PlacementAnswerRecord> = {};
  const answers2: Record<string, PlacementAnswerRecord> = {};

  for (const q of exam) {
    const wrongIdx = (q.correctIndex + 1) % q.options.length;
    if (q.subjectId === 'place_value') {
      answers1[q.id] = { questionId: q.id, selectedIndex: q.correctIndex, responseTimeMs: 4000 };
      answers2[q.id] = { questionId: q.id, selectedIndex: q.correctIndex, responseTimeMs: 4000 };
    } else if (q.subjectId === 'fractions') {
      answers1[q.id] = {
        questionId: q.id,
        selectedIndex: q.difficulty === 'easy' ? q.correctIndex : wrongIdx,
        responseTimeMs: 7000,
      };
      answers2[q.id] = { questionId: q.id, selectedIndex: q.correctIndex, responseTimeMs: 6000 };
    } else if (q.subjectId === 'graphs') {
      answers1[q.id] = { questionId: q.id, selectedIndex: wrongIdx, responseTimeMs: 12000 };
      answers2[q.id] = { questionId: q.id, selectedIndex: wrongIdx, responseTimeMs: 12000 };
    } else {
      answers1[q.id] = {
        questionId: q.id,
        selectedIndex: q.difficulty === 'easy' ? q.correctIndex : wrongIdx,
        responseTimeMs: 8000,
      };
      answers2[q.id] = {
        questionId: q.id,
        selectedIndex: q.difficulty === 'easy' ? q.correctIndex : wrongIdx,
        responseTimeMs: 8000,
      };
    }
  }

  const res1 = scorePlacementExam(exam, answers1, '2026-05-01T10:00:00.000Z');
  const res2 = scorePlacementExam(exam, answers2, '2026-05-08T10:00:00.000Z');

  assert.equal(res1.totalQuestions, 24);
  assert.equal(res1.subjects.length, 12);
  assert.equal(res1.topStrengths[0], 'place_value');
  assert.equal(res1.topAreasToPractice[0], 'graphs');

  const comparisons = comparePlacementResults(res2, res1);
  const fracComp = comparisons.find((c) => c.subjectId === 'fractions')!;
  assert.equal(fracComp.changed, true);
  assert.equal(fracComp.previousTier, 'developing');
  assert.equal(fracComp.currentTier, 'strong');
  assert.match(fracComp.summary.en, /Developing → Strong/);

  const htmlEn = buildPlacementReportHtml(res2, res1, 'en');
  assert.ok(htmlEn.includes('dir="ltr"'));
  assert.ok(htmlEn.includes('Developing → Strong'));

  const htmlAr = buildPlacementReportHtml(res2, res1, 'ar');
  assert.ok(htmlAr.includes('dir="rtl"'));
  assert.ok(htmlAr.includes('تقرير تحديد المستوى'));
});

test('backup export/import, legacy migration, history cap (5), and recommended level unlock safety', () => {
  const base = createDefaultProgress();
  base.starsByLevel['place_value-1'] = 3;
  base.totalStars = 3;
  base.totalGems = 120;
  base.recommendedUnlockedLevels = { place_value: 4 };

  // Level 4 of place_value is unlocked via recommendation without requiring level 3 stars
  const pvLevel4 = EGYPT_LEVELS.find((l) => l.id === 'place_value-4')!;
  const pvLevel5 = EGYPT_LEVELS.find((l) => l.id === 'place_value-5')!;
  assert.equal(isLevelUnlockedForPlayer(pvLevel4, base), true);
  assert.equal(isLevelUnlockedForPlayer(pvLevel5, base), false);

  // Add 7 placement records -> migration caps to 5
  const dummyResult = (i: number): PlacementExamResult => ({
    id: `exam-${i}`,
    completedAt: `2026-05-0${i + 1}T10:00:00.000Z`,
    totalCorrect: 18,
    totalQuestions: 24,
    overallAccuracy: 0.75,
    overallLevel: { en: 'Confident Builder', ar: 'بنّاء واثق' },
    avgResponseMs: 6500,
    subjects: EGYPT_SUBJECTS.map((s) => ({
      subjectId: s.id,
      correct: 2,
      total: 2,
      accuracy: 1,
      avgResponseMs: 6000,
      tier: 'strong',
      recommendedStartLevel: 4,
    })),
    topStrengths: ['place_value', 'money'],
    topAreasToPractice: ['graphs', 'fractions'],
  });
  base.placementHistory = Array.from({ length: 7 }, (_, i) => dummyResult(i));

  const serialized = serializeProgressBackup(base);
  const restored = parseProgressBackup(serialized, VALID_LEVEL_IDS, VALID_SUBJECT_IDS);
  assert.ok(restored);
  assert.equal(restored!.totalGems, 120);
  assert.equal(restored!.starsByLevel['place_value-1'], 3);
  assert.equal(restored!.placementHistory.length, 5);
  assert.equal(restored!.recommendedUnlockedLevels.place_value, 4);

  // Rejects arbitrary/corrupt JSON cleanly
  assert.equal(parseProgressBackup('{"hello":"world"}', VALID_LEVEL_IDS, VALID_SUBJECT_IDS), null);
  assert.equal(parseProgressBackup('not-json', VALID_LEVEL_IDS, VALID_SUBJECT_IDS), null);

  // Legacy v1 save (no placementHistory / recommendedUnlockedLevels) migrates safely
  const legacy = migrateProgress(
    { language: 'ar', starsByLevel: { 'money-1': 2 }, totalGems: 45 },
    VALID_LEVEL_IDS,
    VALID_SUBJECT_IDS
  );
  assert.equal(legacy.language, 'ar');
  assert.equal(legacy.totalStars, 2);
  assert.equal(legacy.totalGems, 45);
  assert.deepEqual(legacy.placementHistory, []);
  assert.deepEqual(legacy.recommendedUnlockedLevels, {});
});
