import assert from 'node:assert/strict';
import test from 'node:test';
import { EGYPT_LEVELS, EGYPT_SUBJECTS } from '../data/egyptLevels';
import { computeRegroupingPlan } from './regrouping';
import {
  advanceRoundSession,
  appendLevelAttempt,
  computeRoundRewards,
  createDefaultProgress,
  createRoundSession,
  getLevelRecentAccuracy,
  getNextContinueLevel,
  getSubjectMasteryStats,
  isLevelCompleted,
  isLevelMastered,
  migrateProgress,
  recordRoundAttempt,
  RoundSessionState,
} from './scoring';

function playSequence(
  outcomes: ('first_try' | 'retry_then_correct')[],
  initialBestStreak = 0
): { session: RoundSessionState; bestStreakHistory: number[] } {
  let session = createRoundSession(outcomes.length, initialBestStreak);
  const bestStreakHistory: number[] = [];

  for (const outcome of outcomes) {
    if (outcome === 'first_try') {
      session = recordRoundAttempt(session, true);
      bestStreakHistory.push(session.bestStreak);
      session = advanceRoundSession(session, { correctFirstTry: true });
    } else {
      session = recordRoundAttempt(session, false, 'test_skill');
      bestStreakHistory.push(session.bestStreak);
      session = recordRoundAttempt(session, true);
      bestStreakHistory.push(session.bestStreak);
      session = advanceRoundSession(session, { correctFirstTry: false });
    }
  }

  return { session, bestStreakHistory };
}

test('6/6 first-try sequence yields 6/6, 60 gems, 3 stars, streak 6, and live bestStreak 6', () => {
  const { session, bestStreakHistory } = playSequence([
    'first_try',
    'first_try',
    'first_try',
    'first_try',
    'first_try',
    'first_try',
  ]);

  assert.equal(session.finished, true);
  assert.equal(session.firstTryCount, 6);
  assert.equal(session.streak, 6);
  assert.equal(session.bestStreak, 6);
  // Verifies bestStreak updated after EVERY answer, not only at the end
  assert.deepEqual(bestStreakHistory, [1, 2, 3, 4, 5, 6]);

  const rewards = computeRoundRewards(session);
  assert.equal(rewards.correctFirstTry, 6);
  assert.equal(rewards.totalRounds, 6);
  assert.equal(rewards.starsEarned, 3);
  assert.equal(rewards.gemsEarned, 60);
  assert.equal(rewards.bestStreak, 6);
});

test('5/6 sequence yields 5/6, 55 gems, and 3 stars', () => {
  const { session } = playSequence([
    'first_try',
    'first_try',
    'retry_then_correct',
    'first_try',
    'first_try',
    'first_try',
  ]);

  const rewards = computeRoundRewards(session);
  assert.equal(session.finished, true);
  assert.equal(rewards.correctFirstTry, 5);
  assert.equal(rewards.totalRounds, 6);
  assert.equal(rewards.starsEarned, 3);
  assert.equal(rewards.gemsEarned, 55);
  assert.equal(rewards.bestStreak, 4);
});

test('early mistake on Q1 followed by Q2-Q6 first-try right yields 5/6 and 55 gems', () => {
  const { session } = playSequence([
    'retry_then_correct',
    'first_try',
    'first_try',
    'first_try',
    'first_try',
    'first_try',
  ]);

  const rewards = computeRoundRewards(session);
  assert.equal(session.finished, true);
  assert.equal(rewards.correctFirstTry, 5);
  assert.equal(rewards.starsEarned, 3);
  assert.equal(rewards.gemsEarned, 55);
  assert.equal(session.streak, 6);
  assert.equal(session.bestStreak, 6);
});

test('last-question mistake on Q6 after Q1-Q5 right yields 5/6, 55 gems, and preserves bestStreak 5', () => {
  const { session, bestStreakHistory } = playSequence([
    'first_try',
    'first_try',
    'first_try',
    'first_try',
    'first_try',
    'retry_then_correct',
  ]);

  const rewards = computeRoundRewards(session);
  assert.equal(session.finished, true);
  assert.equal(rewards.correctFirstTry, 5);
  assert.equal(rewards.starsEarned, 3);
  assert.equal(rewards.gemsEarned, 55);
  assert.equal(session.streak, 1);
  assert.equal(session.bestStreak, 5);
  // Best streak reached 5 on Q5 and remained 5 after Q6 miss & retry
  assert.deepEqual(bestStreakHistory, [1, 2, 3, 4, 5, 5, 5]);
});

test('mixed sequence updates bestStreak live and computes exact stars and gems', () => {
  const { session, bestStreakHistory } = playSequence([
    'first_try',
    'first_try',
    'retry_then_correct',
    'first_try',
    'first_try',
    'retry_then_correct',
  ]);

  const rewards = computeRoundRewards(session);
  assert.equal(session.finished, true);
  assert.equal(rewards.correctFirstTry, 4);
  assert.equal(rewards.starsEarned, 2);
  assert.equal(rewards.gemsEarned, 40);
  assert.equal(session.streak, 1);
  assert.equal(session.bestStreak, 3);
  assert.deepEqual(bestStreakHistory, [1, 2, 2, 2, 2, 3, 3, 3]);
});

test('Completed is separated from Mastered (>= 80% recent accuracy over last 3 attempts)', () => {
  const progress = createDefaultProgress();
  const pvLevels = EGYPT_LEVELS.filter((l) => l.subjectId === 'place_value');

  // Finish all 5 levels with 3/6 (50% accuracy) -> Completed, NOT Mastered
  for (const lvl of pvLevels) {
    progress.starsByLevel[lvl.id] = 2;
    progress.recentAttemptsByLevel[lvl.id] = appendLevelAttempt([], 3, 6);
  }

  assert.equal(isLevelCompleted(pvLevels[0].id, progress), true);
  assert.equal(isLevelMastered(pvLevels[0].id, progress), false);

  const completedStats = getSubjectMasteryStats('place_value', EGYPT_LEVELS, progress);
  assert.equal(completedStats.isCompleted, true);
  assert.equal(completedStats.isMastered, false);
  assert.equal(completedStats.recentAccuracyPct, 50);

  // Now log 3 high-accuracy runs (5/6, 6/6, 5/6) per level so the rolling 3-attempt window pushes out the old 3/6 run
  for (const lvl of pvLevels) {
    let history = progress.recentAttemptsByLevel[lvl.id];
    history = appendLevelAttempt(history, 5, 6);
    history = appendLevelAttempt(history, 6, 6);
    history = appendLevelAttempt(history, 5, 6);
    progress.recentAttemptsByLevel[lvl.id] = history;
    assert.equal(history.length, 3);
  }

  assert.equal(isLevelMastered(pvLevels[0].id, progress), true);
  const acc = getLevelRecentAccuracy(pvLevels[0].id, progress);
  assert.ok(acc !== null && acc >= 0.8);

  const masteredStats = getSubjectMasteryStats('place_value', EGYPT_LEVELS, progress);
  assert.equal(masteredStats.isCompleted, true);
  assert.equal(masteredStats.isMastered, true);
  assert.ok((masteredStats.recentAccuracyPct ?? 0) >= 80);
});

test('migrateProgress preserves legacy v1 localStorage progress safely', () => {
  const validLevels = new Set(EGYPT_LEVELS.map((l) => l.id));
  const validSubjects = new Set(EGYPT_SUBJECTS.map((s) => s.id));

  const legacySave = {
    language: 'ar',
    starsByLevel: { 'place_value-1': 3, 'place_value-2': 2, 'invalid-level': 3 },
    unlockedStickers: ['cairo_lantern'],
    practicedSubjects: ['place_value', 'nonexistent_topic'],
    totalStars: 999,
    totalGems: 120,
    bestStreak: 7,
    muted: true,
    musicEnabled: false,
  };

  const migrated = migrateProgress(legacySave, validLevels, validSubjects);
  assert.equal(migrated.language, 'ar');
  assert.deepEqual(migrated.starsByLevel, { 'place_value-1': 3, 'place_value-2': 2 });
  assert.equal(migrated.totalStars, 5);
  assert.equal(migrated.totalGems, 120);
  assert.equal(migrated.bestStreak, 7);
  assert.deepEqual(migrated.unlockedStickers, ['cairo_lantern']);
  assert.deepEqual(migrated.practicedSubjects, ['place_value']);
  assert.deepEqual(migrated.recentAttemptsByLevel, {});
  assert.deepEqual(migrated.purchasedCosmetics, []);
  assert.deepEqual(migrated.equippedCosmetics, {
    outfitId: null,
    accessoryId: null,
    trailId: null,
  });

  // Continue Learning should pick place_value-3 (next unfinished unlocked level)
  const nextContinue = getNextContinueLevel(EGYPT_LEVELS, migrated);
  assert.equal(nextContinue.id, 'place_value-3');
});

test('3-digit regrouping: 178 + 256 teaches both Ones->Tens and Tens->Hundreds carries in order', () => {
  const plan = computeRegroupingPlan('+', 178, 256);

  assert.equal(plan.answer, 434);
  assert.equal(plan.hasHundreds, true);
  assert.equal(plan.needsOnesRegroup, true);
  assert.equal(plan.needsTensRegroup, true);
  assert.equal(plan.carryToTens, 1);
  assert.equal(plan.carryToHundreds, 1);
  assert.equal(plan.steps.length, 3);

  // Step 1: carry +1 to tens only
  assert.equal(plan.steps[0].tensAnnotation, '+1');
  assert.equal(plan.steps[0].hundredsAnnotation, '');

  // Step 2: carry +1 to hundreds while keeping +1 on tens visible
  assert.equal(plan.steps[1].tensAnnotation, '+1');
  assert.equal(plan.steps[1].hundredsAnnotation, '+1');

  // Step 3: hundreds summary preserves both carry annotations
  assert.equal(plan.steps[2].tensAnnotation, '+1');
  assert.equal(plan.steps[2].hundredsAnnotation, '+1');
});

test('3-digit regrouping: 512 - 278 teaches double borrowing with updated Hundreds, Tens, and Ones digits', () => {
  const plan = computeRegroupingPlan('-', 512, 278);

  assert.equal(plan.answer, 234);
  assert.equal(plan.hasHundreds, true);
  assert.equal(plan.needsOnesRegroup, true);
  assert.equal(plan.needsTensRegroup, true);
  assert.equal(plan.borrowedAcrossZero, false);
  assert.equal(plan.steps.length, 3);

  // Step 1: borrow 1 Ten (1 -> 0) so Ones becomes 12
  assert.equal(plan.steps[0].hundredsAnnotation, '');
  assert.equal(plan.steps[0].tensAnnotation, '0');
  assert.equal(plan.steps[0].onesAnnotation, '12');
  assert.deepEqual(plan.steps[0].crossed, { hundreds: false, tens: true, ones: true });

  // Step 2: 0 < 7, borrow 1 Hundred (5 -> 4) so Tens becomes 10 (with intermediate 0 crossed)
  assert.equal(plan.steps[1].hundredsAnnotation, '4');
  assert.equal(plan.steps[1].tensAnnotation, '10');
  assert.equal(plan.steps[1].onesAnnotation, '12');
  assert.equal(plan.steps[1].intermediateTensCrossed, '0');
  assert.deepEqual(plan.steps[1].crossed, { hundreds: true, tens: true, ones: true });

  assert.deepEqual(plan.finalTopDigits, { h: 4, t: 10, o: 12 });
});

test('3-digit regrouping: borrowing across zero (502 - 278 and 400 - 156)', () => {
  const plan502 = computeRegroupingPlan('-', 502, 278);
  assert.equal(plan502.answer, 224);
  assert.equal(plan502.borrowedAcrossZero, true);
  assert.equal(plan502.steps[0].hundredsAnnotation, '4');
  assert.equal(plan502.steps[0].intermediateTensCrossed, '10');
  assert.equal(plan502.steps[0].tensAnnotation, '9');
  assert.equal(plan502.steps[0].onesAnnotation, '12');
  assert.deepEqual(plan502.finalTopDigits, { h: 4, t: 9, o: 12 });

  const plan400 = computeRegroupingPlan('-', 400, 156);
  assert.equal(plan400.answer, 244);
  assert.equal(plan400.borrowedAcrossZero, true);
  assert.deepEqual(plan400.finalTopDigits, { h: 3, t: 9, o: 10 });
});
