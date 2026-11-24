import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EGYPT_SUBJECTS,
  generateSubjectQuestions,
  withSeededRandom,
} from '../data/egyptLevels';
import { generatePracticeQuickCheck } from '../data/practiceSubjects';
import { ActiveQuestion, LevelNumber } from '../types/game';
import {
  getQuestionSignature,
  resetAllQuestionHistory,
} from './questionHistory';

/**
 * Unbounded coin-change reachability check for Egyptian banknote targets and capacity scoops.
 */
function canMakeAmount(target: number, coins: number[]): boolean {
  if (target < 0) return false;
  const dp = new Array<boolean>(target + 1).fill(false);
  dp[0] = true;
  for (let a = 1; a <= target; a++) {
    for (const c of coins) {
      if (c > 0 && a - c >= 0 && dp[a - c]) {
        dp[a] = true;
        break;
      }
    }
  }
  return dp[target];
}

function assertQuestionInvariants(q: ActiveQuestion, ctx: string): void {
  const d = q.data;
  assert.ok(d.prompt.en.trim().length > 0, `${ctx}: empty EN prompt`);
  assert.ok(d.prompt.ar.trim().length > 0, `${ctx}: empty AR prompt`);

  switch (d.kind) {
    case 'place_value': {
      const expected = d.hundreds * 100 + d.tens * 10 + d.ones;
      assert.equal(d.value, expected, `${ctx}: place_value mismatch`);
      assert.equal(new Set(d.options).size, d.options.length, `${ctx}: duplicate place_value options`);
      assert.equal(
        d.options.filter((o) => o === d.value).length,
        1,
        `${ctx}: place_value must have exactly 1 correct option`
      );
      break;
    }

    case 'money_build': {
      assert.ok(d.targetAmount > 0, `${ctx}: money_build targetAmount must be positive`);
      assert.ok(d.availableNotes.length > 0, `${ctx}: money_build needs availableNotes`);
      assert.ok(
        canMakeAmount(d.targetAmount, d.availableNotes),
        `${ctx}: money target ${d.targetAmount} not reachable with [${d.availableNotes.join(', ')}]`
      );
      break;
    }

    case 'money_change_or_compare': {
      if (d.subKind === 'compare') {
        const expected =
          d.leftValue > d.rightValue ? '>' : d.leftValue < d.rightValue ? '<' : '=';
        assert.equal(d.answerCompare, expected, `${ctx}: compare symbol mismatch`);
      } else {
        assert.equal(typeof d.answerNumber, 'number', `${ctx}: change needs numeric answer`);
        assert.ok(d.answerNumber! >= 0, `${ctx}: negative change`);
        assert.ok(Array.isArray(d.optionsNumber), `${ctx}: change needs optionsNumber`);
        assert.equal(
          new Set(d.optionsNumber).size,
          d.optionsNumber!.length,
          `${ctx}: duplicate change options`
        );
        assert.equal(
          d.optionsNumber!.filter((o) => o === d.answerNumber).length,
          1,
          `${ctx}: change must have exactly 1 correct option`
        );
      }
      break;
    }

    case 'vertical_math': {
      const expected = d.operator === '+' ? d.top + d.bottom : d.top - d.bottom;
      assert.equal(d.answer, expected, `${ctx}: vertical_math answer mismatch`);
      assert.ok(d.answer >= 0, `${ctx}: vertical_math negative result`);
      assert.equal(new Set(d.options).size, d.options.length, `${ctx}: duplicate vertical_math options`);
      assert.equal(
        d.options.filter((o) => o === d.answer).length,
        1,
        `${ctx}: vertical_math must have exactly 1 correct option`
      );
      break;
    }

    case 'array_multiply': {
      assert.ok(d.rows >= 1 && d.cols >= 1, `${ctx}: invalid array dimensions`);
      assert.equal(d.answer, d.rows * d.cols, `${ctx}: array product mismatch`);
      assert.equal(new Set(d.options).size, d.options.length, `${ctx}: duplicate array options`);
      assert.equal(
        d.options.filter((o) => o === d.answer).length,
        1,
        `${ctx}: array must have exactly 1 correct option`
      );
      break;
    }

    case 'read_clock': {
      assert.ok(d.hour >= 1 && d.hour <= 12, `${ctx}: invalid read_clock hour ${d.hour}`);
      assert.ok(d.minute >= 0 && d.minute <= 59 && d.minute % 5 === 0, `${ctx}: invalid minute ${d.minute}`);
      assert.ok(d.correctIndex >= 0 && d.correctIndex < d.options.length, `${ctx}: invalid clock correctIndex`);
      const formatted = d.options.map((o) => `${o.hour}:${o.minute}`);
      assert.equal(new Set(formatted).size, formatted.length, `${ctx}: duplicate clock options`);
      const correctOpt = d.options[d.correctIndex];
      assert.equal(correctOpt.hour, d.hour, `${ctx}: clock option hour mismatch`);
      assert.equal(correctOpt.minute, d.minute, `${ctx}: clock option minute mismatch`);
      break;
    }

    case 'set_clock': {
      assert.ok(d.targetHour >= 1 && d.targetHour <= 12, `${ctx}: invalid set_clock targetHour`);
      assert.ok(d.targetMinute >= 0 && d.targetMinute <= 59 && d.targetMinute % 5 === 0, `${ctx}: invalid set_clock targetMinute`);
      assert.ok(d.startHour >= 1 && d.startHour <= 12, `${ctx}: invalid set_clock startHour`);
      assert.ok(d.startMinute >= 0 && d.startMinute <= 59 && d.startMinute % 5 === 0, `${ctx}: invalid set_clock startMinute`);
      break;
    }

    case 'elapsed_or_calendar': {
      assert.ok(d.correctIndex >= 0 && d.correctIndex < d.options.length, `${ctx}: invalid calendar correctIndex`);
      const enKeys = d.options.map((o) => o.en.trim());
      const arKeys = d.options.map((o) => o.ar.trim());
      assert.equal(new Set(enKeys).size, enKeys.length, `${ctx}: duplicate EN calendar options`);
      assert.equal(new Set(arKeys).size, arKeys.length, `${ctx}: duplicate AR calendar options`);
      break;
    }

    case 'capacity_pour': {
      assert.ok(d.targetMl > 0 && d.targetMl <= d.maxMl, `${ctx}: capacity target ${d.targetMl} exceeds max ${d.maxMl}`);
      assert.ok(d.scoops.length > 0, `${ctx}: capacity needs scoops`);
      assert.ok(
        canMakeAmount(d.targetMl, d.scoops),
        `${ctx}: capacity ${d.targetMl} mL not reachable with scoops [${d.scoops.join(', ')}]`
      );
      break;
    }

    case 'measure_length': {
      assert.ok(d.startCm >= 0, `${ctx}: negative startCm`);
      assert.ok(d.lengthCm > 0, `${ctx}: non-positive lengthCm`);
      assert.ok(d.startCm + d.lengthCm <= d.maxCm, `${ctx}: object overflows ruler`);
      assert.equal(new Set(d.options).size, d.options.length, `${ctx}: duplicate length options`);
      assert.equal(
        d.options.filter((o) => o === d.lengthCm).length,
        1,
        `${ctx}: length must have exactly 1 correct option`
      );
      break;
    }

    case 'mass_or_unit': {
      assert.ok(d.correctIndex >= 0 && d.correctIndex < d.options.length, `${ctx}: invalid mass correctIndex`);
      const enKeys = d.options.map((o) => o.en.trim());
      const arKeys = d.options.map((o) => o.ar.trim());
      assert.equal(new Set(enKeys).size, enKeys.length, `${ctx}: duplicate EN mass options`);
      assert.equal(new Set(arKeys).size, arKeys.length, `${ctx}: duplicate AR mass options`);
      break;
    }

    case 'fraction_or_shape': {
      assert.ok(d.correctIndex >= 0 && d.correctIndex < d.options.length, `${ctx}: invalid fraction/shape correctIndex`);
      const enKeys = d.options.map((o) => o.en.trim());
      const arKeys = d.options.map((o) => o.ar.trim());
      assert.equal(new Set(enKeys).size, enKeys.length, `${ctx}: duplicate EN fraction/shape options`);
      assert.equal(new Set(arKeys).size, arKeys.length, `${ctx}: duplicate AR fraction/shape options`);
      if (d.subKind === 'fraction') {
        assert.ok(
          (d.fractionTotalParts ?? 0) >= 2 &&
            (d.fractionShadedParts ?? 0) >= 1 &&
            (d.fractionShadedParts ?? 0) <= (d.fractionTotalParts ?? 0),
          `${ctx}: invalid fraction parts`
        );
      }
      break;
    }
  }
}

test('deterministic seeded generation validates invariants across all 12 subjects x 5 levels', () => {
  const levels: LevelNumber[] = [1, 2, 3, 4, 5];

  for (const seed of [101, 2026, 77777]) {
    resetAllQuestionHistory();
    withSeededRandom(seed, () => {
      for (const subj of EGYPT_SUBJECTS) {
        for (const lvl of levels) {
          const qs = generateSubjectQuestions(subj.id, lvl, 6, { recordHistory: false });
          assert.equal(qs.length, 6, `${subj.id}-L${lvl} (seed ${seed}) expected 6 questions`);

          const roundSigs = new Set(qs.map(getQuestionSignature));
          assert.equal(
            roundSigs.size,
            qs.length,
            `${subj.id}-L${lvl} (seed ${seed}) had duplicate questions inside one round`
          );

          qs.forEach((q, idx) =>
            assertQuestionInvariants(q, `${subj.id}-L${lvl}#${idx + 1} (seed ${seed})`)
          );
        }
      }
    });
  }
});

test('seeded PRNG produces identical question sequences for identical seeds', () => {
  resetAllQuestionHistory();
  const runA = withSeededRandom(98765, () =>
    generateSubjectQuestions('vertical_math', 5, 6, { recordHistory: false }).map(
      getQuestionSignature
    )
  );
  resetAllQuestionHistory();
  const runB = withSeededRandom(98765, () =>
    generateSubjectQuestions('vertical_math', 5, 6, { recordHistory: false }).map(
      getQuestionSignature
    )
  );
  assert.deepEqual(runA, runB);
});

test('global no-repeat registry avoids repeating questions across consecutive runs', () => {
  resetAllQuestionHistory();
  withSeededRandom(4242, () => {
    for (const subj of EGYPT_SUBJECTS) {
      const run1 = generateSubjectQuestions(subj.id, 3, 6);
      const run2 = generateSubjectQuestions(subj.id, 3, 6);
      const sigs1 = new Set(run1.map(getQuestionSignature));
      const overlaps = run2.filter((q) => sigs1.has(getQuestionSignature(q)));
      assert.equal(
        overlaps.length,
        0,
        `Subject ${subj.id} repeated ${overlaps.length} question(s) on consecutive run`
      );
    }
  });
});

test('practice quick checks generate valid unique options and avoid immediate repeats', () => {
  resetAllQuestionHistory();
  withSeededRandom(1337, () => {
    for (const subj of EGYPT_SUBJECTS) {
      const checks = Array.from({ length: 4 }, () => generatePracticeQuickCheck(subj.id));
      for (const c of checks) {
        assert.ok(c.prompt.en.length > 0 && c.prompt.ar.length > 0);
        assert.ok(c.correctIndex >= 0 && c.correctIndex < c.options.length);
        assert.equal(new Set(c.options.map((o) => o.en)).size, c.options.length);
      }
      const promptSet = new Set(checks.map((c) => c.prompt.en));
      assert.ok(
        promptSet.size >= 3,
        `Expected diverse quick checks for ${subj.id}, got ${promptSet.size} unique of 4`
      );
    }
  });
});
