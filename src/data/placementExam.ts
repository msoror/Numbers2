import {
  ActiveQuestion,
  BilingualText,
  Language,
  LevelNumber,
  PlacementExamResult,
  PlacementSubjectResult,
  PlacementTier,
  SubjectId,
} from '../types/game';
import {
  EGYPT_SUBJECTS,
  buildNumberOptions,
  generateSubjectQuestions,
  getQuestionSignature,
  nextRandom,
  pickOne,
  randInt,
  shuffle,
} from './egyptLevels';
import {
  getCombinedSeenSignatures,
  recordSeenQuestionSignatures,
} from '../utils/questionHistory';

export type PlacementQuestionFormat = 'core_visual' | 'word_problem' | 'explain_it';

export interface PlacementQuestion {
  id: string;
  subjectId: SubjectId;
  difficulty: 'easy' | 'hard';
  format: PlacementQuestionFormat;
  signature: string;
  prompt: BilingualText;
  storyContext?: BilingualText;
  /** Optional visual model reused from the mini-games (blocks, clock, ruler, fractions, shapes, bars, vertical stack, array, scale) */
  visualQuestion?: ActiveQuestion;
  options: BilingualText[];
  correctIndex: number;
}

export interface PlacementAnswerRecord {
  questionId: string;
  selectedIndex: number;
  responseTimeMs: number;
}

export interface PlacementSubjectComparison {
  subjectId: SubjectId;
  previousTier: PlacementTier;
  currentTier: PlacementTier;
  changed: boolean;
  deltaAccuracy: number;
  summary: BilingualText;
}

const KID_NAMES: BilingualText[] = [
  { en: 'Omar', ar: 'عمر' },
  { en: 'Salma', ar: 'سلمى' },
  { en: 'Nour', ar: 'نور' },
  { en: 'Youssef', ar: 'يوسف' },
  { en: 'Hana', ar: 'هنا' },
  { en: 'Karim', ar: 'كريم' },
  { en: 'Laila', ar: 'ليلى' },
  { en: 'Adam', ar: 'آدم' },
];

const SHOP_TOYS: BilingualText[] = [
  { en: 'toy boat', ar: 'قارب لعبة' },
  { en: 'wooden camel', ar: 'جمل خشبي' },
  { en: 'puzzle box', ar: 'علبة بازل' },
  { en: 'brass lantern', ar: 'فانوس نحاسي' },
  { en: 'story book', ar: 'كتاب قصص' },
  { en: 'paint set', ar: 'علبة ألوان' },
];

const WEEKDAYS_EXAM: BilingualText[] = [
  { en: 'Saturday', ar: 'السبت' },
  { en: 'Sunday', ar: 'الأحد' },
  { en: 'Monday', ar: 'الاثنين' },
  { en: 'Tuesday', ar: 'الثلاثاء' },
  { en: 'Wednesday', ar: 'الأربعاء' },
  { en: 'Thursday', ar: 'الخميس' },
  { en: 'Friday', ar: 'الجمعة' },
];

function padMinute(m: number): string {
  return m < 10 ? `0${m}` : `${m}`;
}

function makeUid(prefix: string, idx: number): string {
  return `${prefix}-${idx}-${Math.floor(nextRandom() * 1e7).toString(36)}`;
}

/**
 * Extracts multiple-choice options and correctIndex from a generated ActiveQuestion.
 * Returns null if the question requires interactive non-MC input (money_build, set_clock, capacity_pour).
 */
function adaptActiveQuestionToMc(
  subjectId: SubjectId,
  q: ActiveQuestion,
  idx: number
): PlacementQuestion | null {
  const sig = getQuestionSignature(q);
  const { data } = q;

  switch (data.kind) {
    case 'place_value': {
      const options = data.options.map((n) => ({ en: `${n}`, ar: `${n}` }));
      const correctIndex = data.options.indexOf(data.value);
      return {
        id: makeUid('pe-pv', idx),
        subjectId,
        difficulty: 'easy',
        format: 'core_visual',
        signature: sig,
        prompt: data.prompt,
        visualQuestion: q,
        options,
        correctIndex,
      };
    }

    case 'money_change_or_compare': {
      if (data.subKind === 'compare' && data.answerCompare) {
        const syms: ('<' | '=' | '>')[] = ['<', '=', '>'];
        return {
          id: makeUid('pe-cmp', idx),
          subjectId,
          difficulty: 'easy',
          format: 'core_visual',
          signature: sig,
          prompt: data.prompt,
          visualQuestion: q,
          options: [
            { en: '< (Less than)', ar: '< (أصغر من)' },
            { en: '= (Equal)', ar: '= (يساوي)' },
            { en: '> (Greater than)', ar: '> (أكبر من)' },
          ],
          correctIndex: syms.indexOf(data.answerCompare),
        };
      }
      if (data.subKind === 'change' && data.optionsNumber && data.answerNumber !== undefined) {
        return {
          id: makeUid('pe-chg', idx),
          subjectId,
          difficulty: 'easy',
          format: 'core_visual',
          signature: sig,
          prompt: data.prompt,
          visualQuestion: q,
          options: data.optionsNumber.map((n) => ({ en: `${n} LE`, ar: `${n} ج.م` })),
          correctIndex: data.optionsNumber.indexOf(data.answerNumber),
        };
      }
      return null;
    }

    case 'vertical_math':
      return {
        id: makeUid('pe-vm', idx),
        subjectId,
        difficulty: 'easy',
        format: 'core_visual',
        signature: sig,
        prompt: data.prompt,
        visualQuestion: q,
        options: data.options.map((n) => ({ en: `${n}`, ar: `${n}` })),
        correctIndex: data.options.indexOf(data.answer),
      };

    case 'array_multiply':
      return {
        id: makeUid('pe-arr', idx),
        subjectId,
        difficulty: 'easy',
        format: 'core_visual',
        signature: sig,
        prompt: data.prompt,
        visualQuestion: q,
        options: data.options.map((n) => ({ en: `${n}`, ar: `${n}` })),
        correctIndex: data.options.indexOf(data.answer),
      };

    case 'read_clock':
      return {
        id: makeUid('pe-clk', idx),
        subjectId,
        difficulty: 'easy',
        format: 'core_visual',
        signature: sig,
        prompt: data.prompt,
        visualQuestion: q,
        options: data.options.map((o) => {
          const text = `${o.hour}:${padMinute(o.minute)}`;
          return { en: text, ar: text };
        }),
        correctIndex: data.correctIndex,
      };

    case 'elapsed_or_calendar':
      return {
        id: makeUid('pe-cal', idx),
        subjectId,
        difficulty: 'easy',
        format: 'core_visual',
        signature: sig,
        prompt: data.prompt,
        visualQuestion: q,
        options: data.options,
        correctIndex: data.correctIndex,
      };

    case 'measure_length':
      return {
        id: makeUid('pe-len', idx),
        subjectId,
        difficulty: 'easy',
        format: 'core_visual',
        signature: sig,
        prompt: data.prompt,
        visualQuestion: q,
        options: data.options.map((n) => ({ en: `${n} cm`, ar: `${n} سم` })),
        correctIndex: data.options.indexOf(data.lengthCm),
      };

    case 'mass_or_unit':
      return {
        id: makeUid('pe-mass', idx),
        subjectId,
        difficulty: 'easy',
        format: 'core_visual',
        signature: sig,
        prompt: data.prompt,
        visualQuestion: q,
        options: data.options,
        correctIndex: data.correctIndex,
      };

    case 'fraction_or_shape':
      return {
        id: makeUid('pe-fs', idx),
        subjectId,
        difficulty: 'easy',
        format: 'core_visual',
        signature: sig,
        prompt: data.prompt,
        visualQuestion: q,
        options: data.options,
        correctIndex: data.correctIndex,
      };

    default:
      return null;
  }
}

/**
 * Generates an Easy multiple-choice visual question for a subject by reusing egyptLevels.ts
 * (and converting interactive-only money/capacity topics into clean MC equivalents).
 */
function buildEasyQuestionForSubject(
  subjectId: SubjectId,
  avoid: Set<string>,
  idx: number
): PlacementQuestion {
  // Money Easy: clean MC banknote total (visualized cleanly)
  if (subjectId === 'money') {
    for (let attempt = 0; attempt < 40; attempt++) {
      const n1 = pickOne([20, 50, 100]);
      const n2 = pickOne([10, 20]);
      const n3 = pickOne([1, 5, 10]);
      const total = n1 + n2 + n3;
      const sig = `pe-mon-easy:${n1}+${n2}+${n3}`;
      if (avoid.has(sig) && attempt < 35) continue;
      const nums = buildNumberOptions(total, [-10, -5, -1, 5, 10, 20], 5);
      return {
        id: makeUid('pe-mon-e', idx),
        subjectId: 'money',
        difficulty: 'easy',
        format: 'core_visual',
        signature: sig,
        prompt: {
          en: `Count these Egyptian banknotes: ${n1} LE + ${n2} LE + ${n3} LE. How much money in total?`,
          ar: `احسب هذه الجنيهات المصرية: ${n1} ج.م + ${n2} ج.م + ${n3} ج.م. كم المبلغ الإجمالي؟`,
        },
        options: nums.map((n) => ({ en: `${n} LE`, ar: `${n} ج.م` })),
        correctIndex: nums.indexOf(total),
      };
    }
  }

  // Capacity Easy: clean MC jug fill question
  if (subjectId === 'capacity') {
    for (let attempt = 0; attempt < 40; attempt++) {
      const poured = pickOne([100, 200, 250, 300, 400, 500, 600, 700, 750, 800]);
      const needed = 1000 - poured;
      const sig = `pe-cap-easy:${poured}`;
      if (avoid.has(sig) && attempt < 35) continue;
      const nums = buildNumberOptions(needed, [-200, -100, -50, 50, 100, 200], 50);
      return {
        id: makeUid('pe-cap-e', idx),
        subjectId: 'capacity',
        difficulty: 'easy',
        format: 'core_visual',
        signature: sig,
        prompt: {
          en: `A 1 Liter (1000 mL) Nile jug already has ${poured} mL of water. How many more mL fill it to 1 Liter?`,
          ar: `دورق النيل سعة ١ لتر (١٠٠٠ مل) به ${poured} مل من الماء. كم ملليلترًا نحتاج ليمتلئ إلى ١ لتر؟`,
        },
        options: nums.map((n) => ({ en: `${n} mL`, ar: `${n} مل` })),
        correctIndex: nums.indexOf(needed),
      };
    }
  }

  // All other 10 subjects reuse egyptLevels.ts generators directly (Level 1 or 2)
  const levelToPull: LevelNumber = subjectId === 'clock' ? 2 : 1;
  const batch = generateSubjectQuestions(subjectId, levelToPull, 6, {
    avoidSignatures: avoid,
    recordHistory: false,
  });

  for (const candidate of batch) {
    const adapted = adaptActiveQuestionToMc(subjectId, candidate, idx);
    if (adapted) return adapted;
  }

  // Fallback for clock if batch happened to have only set_clock
  const fallbackClock = generateSubjectQuestions('clock', 4, 4, {
    avoidSignatures: avoid,
    recordHistory: false,
  });
  for (const candidate of fallbackClock) {
    const adapted = adaptActiveQuestionToMc(subjectId, candidate, idx);
    if (adapted) return adapted;
  }

  // Ultimate safe fallback (should never trigger)
  return {
    id: makeUid('pe-fb', idx),
    subjectId,
    difficulty: 'easy',
    format: 'core_visual',
    signature: `pe-fb:${subjectId}:${idx}`,
    prompt: { en: 'What is 10 + 20?', ar: 'كم يساوي ١٠ + ٢٠؟' },
    options: [
      { en: '20', ar: '٢٠' },
      { en: '30', ar: '٣٠' },
      { en: '40', ar: '٤٠' },
    ],
    correctIndex: 1,
  };
}

function buildShuffledExplainOptions(
  correct: BilingualText,
  wrong1: BilingualText,
  wrong2: BilingualText
): { options: BilingualText[]; correctIndex: number } {
  const tagged = shuffle([
    { text: correct, isCorrect: true },
    { text: wrong1, isCorrect: false },
    { text: wrong2, isCorrect: false },
  ]);
  return {
    options: tagged.map((t) => t.text),
    correctIndex: tagged.findIndex((t) => t.isCorrect),
  };
}

/**
 * Generates a Harder comprehension question (Word Problem OR 3-choice "Explain It")
 * for each of the 12 subjects with fresh randomized numbers, names, and non-repeating signatures.
 */
function buildHardComprehensionForSubject(
  subjectId: SubjectId,
  avoid: Set<string>,
  idx: number
): PlacementQuestion {
  for (let tries = 0; tries < 50; tries++) {
    const candidate = buildHardComprehensionOnce(subjectId, idx);
    if (!avoid.has(candidate.signature) || tries >= 45) {
      return candidate;
    }
  }
  return buildHardComprehensionOnce(subjectId, idx);
}

function buildHardComprehensionOnce(subjectId: SubjectId, idx: number): PlacementQuestion {
  const kid = pickOne(KID_NAMES);

  switch (subjectId) {
    case 'place_value': {
      const variant = pickOne(['explain_10_tens', 'explain_compare', 'explain_zero'] as const);
      if (variant === 'explain_10_tens') {
        const { options, correctIndex } = buildShuffledExplainOptions(
          {
            en: 'Because counting by tens 10 times (10, 20, ..., 100) equals 100.',
            ar: 'لأن العد بالعشرات ١٠ مرات (١٠، ٢٠، ...، ١٠٠) يساوي ١٠٠.',
          },
          {
            en: 'Because 10 + 10 equals 100.',
            ar: 'لأن ١٠ + ١٠ يساوي ١٠٠.',
          },
          {
            en: 'Because every ten has 100 ones inside it.',
            ar: 'لأن كل عشرة تحتوي على ١٠٠ آحاد بداخلها.',
          }
        );
        return {
          id: makeUid('pe-pv-h', idx),
          subjectId,
          difficulty: 'hard',
          format: 'explain_it',
          signature: 'pe-exp:pv:10tens',
          prompt: {
            en: 'Explain it: Why do 10 tens make 100?',
            ar: 'اشرح السبب: لماذا تكوّن ١٠ عشرات العدد ١٠٠؟',
          },
          options,
          correctIndex,
        };
      }
      if (variant === 'explain_compare') {
        const hHigh = randInt(3, 8);
        const hLow = hHigh - 1;
        const left = hHigh * 100 + randInt(0, 1) * 10 + randInt(1, 5);
        const right = hLow * 100 + 9 * 10 + randInt(6, 9);
        const { options, correctIndex } = buildShuffledExplainOptions(
          {
            en: `${left} has ${hHigh} hundreds, which is more than ${hLow} hundreds in ${right}.`,
            ar: `العدد ${left} به ${hHigh} مئات، وهذا أكبر من ${hLow} مئات في العدد ${right}.`,
          },
          {
            en: `${left} is bigger because its ones digit is larger than ${right}.`,
            ar: `العدد ${left} أكبر لأن رقم الآحاد فيه أكبر من ${right}.`,
          },
          {
            en: `${right} is actually bigger because it has a 9 in the tens place.`,
            ar: `العدد ${right} أكبر فعليًا لأن به ٩ في خانة العشرات.`,
          }
        );
        return {
          id: makeUid('pe-pv-h', idx),
          subjectId,
          difficulty: 'hard',
          format: 'explain_it',
          signature: `pe-exp:pv:cmp:${left}:${right}`,
          prompt: {
            en: `Explain it: Why is ${left} greater than ${right}?`,
            ar: `اشرح السبب: لماذا العدد ${left} أكبر من ${right}؟`,
          },
          options,
          correctIndex,
        };
      }
      const h = randInt(2, 9);
      const o = randInt(1, 9);
      const num = h * 100 + o;
      const { options, correctIndex } = buildShuffledExplainOptions(
        {
          en: `The 0 holds the Tens place so the number is ${h} hundreds and ${o} ones (${h * 100} + ${o}).`,
          ar: `الصفر يحفظ خانة العشرات ليكون العدد ${h} مئات و ${o} آحاد (${h * 100} + ${o}).`,
        },
        {
          en: `The 0 means we can remove it and write ${h}${o} instead.`,
          ar: `الصفر يعني أنه يمكننا حذفه وكتابة ${h}${o} بدلاً منه.`,
        },
        {
          en: `The 0 means there are 10 tens in ${num}.`,
          ar: `الصفر يعني أن هناك ١٠ عشرات في العدد ${num}.`,
        }
      );
      return {
        id: makeUid('pe-pv-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'explain_it',
        signature: `pe-exp:pv:zero:${num}`,
        prompt: {
          en: `Explain it: What is the job of the digit 0 in ${num}?`,
          ar: `اشرح السبب: ما وظيفة الرقم ٠ في العدد ${num}؟`,
        },
        options,
        correctIndex,
      };
    }

    case 'money': {
      const paid = pickOne([50, 100, 200]);
      const price =
        paid === 50
          ? randInt(14, 42)
          : paid === 100
          ? randInt(26, 84)
          : randInt(115, 185);
      const change = paid - price;
      const toy = pickOne(SHOP_TOYS);
      const opts = buildNumberOptions(change, [-10, -5, -2, 2, 5, 10], 1);
      return {
        id: makeUid('pe-mon-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'word_problem',
        signature: `pe-wp:mon:${paid}:${price}`,
        storyContext: {
          en: `${kid.en} visited Khan El-Khalili Bazaar.`,
          ar: `زار ${kid.ar} سوق خان الخليلي.`,
        },
        prompt: {
          en: `${kid.en} bought a ${toy.en} for ${price} LE and paid with ${paid} LE. How much change should ${kid.en} get back?`,
          ar: `اشترى ${kid.ar} ${toy.ar} بسعر ${price} ج.م ودفع ${paid} ج.م. كم الباقي؟`,
        },
        options: opts.map((n) => ({ en: `${n} LE`, ar: `${n} ج.م` })),
        correctIndex: opts.indexOf(change),
      };
    }

    case 'vertical_math': {
      const askExplain = nextRandom() < 0.45;
      if (askExplain) {
        const o1 = randInt(5, 9);
        const o2 = randInt(10 - o1, 9);
        const a = randInt(2, 5) * 10 + o1;
        const b = randInt(1, 3) * 10 + o2;
        const onesSum = o1 + o2;
        const { options, correctIndex } = buildShuffledExplainOptions(
          {
            en: `${o1} + ${o2} = ${onesSum}, which is 1 ten and ${onesSum - 10} ones, so we carry 1 ten to the Tens column.`,
            ar: `${o1} + ${o2} = ${onesSum}، أي ١ عشرة و ${onesSum - 10} آحاد، فنحمل ١ عشرة إلى خانة العشرات.`,
          },
          {
            en: `We always add 1 to the Hundreds column whenever we add two numbers.`,
            ar: `نضيف ١ دائمًا إلى خانة المئات في كل مسألة جمع.`,
          },
          {
            en: `We erase the ${onesSum - 10} ones and only keep the 1 ten.`,
            ar: `نمسح ${onesSum - 10} آحاد ونحتفظ بالعشرة الواحدة فقط.`,
          }
        );
        return {
          id: makeUid('pe-vm-h', idx),
          subjectId,
          difficulty: 'hard',
          format: 'explain_it',
          signature: `pe-exp:vm:${a}+${b}`,
          prompt: {
            en: `Explain it: When adding ${a} + ${b}, why do we carry 1 to the Tens column?`,
            ar: `اشرح السبب: عند جمع ${a} + ${b}، لماذا نحمل ١ إلى خانة العشرات؟`,
          },
          options,
          correctIndex,
        };
      }
      const isSub = nextRandom() < 0.5;
      if (isSub) {
        const o1 = randInt(1, 4);
        const o2 = randInt(o1 + 2, 9);
        const a = randInt(1, 3) * 100 + randInt(4, 8) * 10 + o1;
        const b = randInt(1, 3) * 10 + o2;
        const ans = a - b;
        const opts = buildNumberOptions(ans, [-10, -2, -1, 1, 2, 10], 10);
        return {
          id: makeUid('pe-vm-h', idx),
          subjectId,
          difficulty: 'hard',
          format: 'word_problem',
          signature: `pe-wp:vm:sub:${a}-${b}`,
          prompt: {
            en: `${kid.en} had ${a} Nile shells and gave ${b} shells to a friend. How many shells are left?`,
            ar: `كان لدى ${kid.ar} ${a} صدفة من النيل وأعطى صديقه ${b} صدفة. كم صدفة بقيت معه؟`,
          },
          options: opts.map((n) => ({ en: `${n} shells`, ar: `${n} صدفة` })),
          correctIndex: opts.indexOf(ans),
        };
      }
      const o1 = randInt(5, 9);
      const o2 = randInt(10 - o1, 9);
      const a = randInt(1, 3) * 100 + randInt(2, 5) * 10 + o1;
      const b = randInt(1, 2) * 100 + randInt(1, 3) * 10 + o2;
      const ans = a + b;
      const opts = buildNumberOptions(ans, [-100, -10, -2, 2, 10, 100], 50);
      return {
        id: makeUid('pe-vm-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'word_problem',
        signature: `pe-wp:vm:add:${a}+${b}`,
        prompt: {
          en: `${kid.en} read ${a} pages last month and ${b} pages this month. How many pages altogether?`,
          ar: `قرأ ${kid.ar} ${a} صفحة الشهر الماضي و ${b} صفحة هذا الشهر. كم صفحة قرأ إجمالاً؟`,
        },
        options: opts.map((n) => ({ en: `${n} pages`, ar: `${n} صفحة` })),
        correctIndex: opts.indexOf(ans),
      };
    }

    case 'arrays': {
      const r = randInt(3, 6);
      const c = randInt(3, 6);
      if (nextRandom() < 0.45 && r !== c) {
        const total = r * c;
        const { options, correctIndex } = buildShuffledExplainOptions(
          {
            en: `Turning a ${r} × ${c} rectangle on its side makes ${c} × ${r}, using the exact same ${total} tiles.`,
            ar: `تدوير مستطيل ${r} × ${c} يعطي ${c} × ${r} بنفس عدد البلاطات تمامًا (${total}).`,
          },
          {
            en: `Because ${r} + ${c} always equals ${total}.`,
            ar: `لأن ${r} + ${c} يساوي دائمًا ${total}.`,
          },
          {
            en: `${r} × ${c} is always larger than ${c} × ${r}.`,
            ar: `${r} × ${c} دائمًا أكبر من ${c} × ${r}.`,
          }
        );
        return {
          id: makeUid('pe-arr-h', idx),
          subjectId,
          difficulty: 'hard',
          format: 'explain_it',
          signature: `pe-exp:arr:${r}x${c}`,
          prompt: {
            en: `Explain it: Why do ${r} rows of ${c} tiles and ${c} rows of ${r} tiles have the same total?`,
            ar: `اشرح السبب: لماذا يعطي ${r} صفوف من ${c} نفس ناتج ${c} صفوف من ${r}؟`,
          },
          options,
          correctIndex,
        };
      }
      const total = r * c;
      const opts = buildNumberOptions(total, [-r, -c, -2, 2, c, r], 4);
      return {
        id: makeUid('pe-arr-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'word_problem',
        signature: `pe-wp:arr:${r}x${c}`,
        prompt: {
          en: `${kid.en} planted ${r} neat rows of lotus flowers with ${c} flowers in each row. How many lotus flowers in total?`,
          ar: `زرع ${kid.ar} ${r} صفوف من زهور اللوتس، في كل صف ${c} زهور. كم زهرة في المجموع؟`,
        },
        options: opts.map((n) => ({ en: `${n} flowers`, ar: `${n} زهرة` })),
        correctIndex: opts.indexOf(total),
      };
    }

    case 'clock': {
      const dial = pickOne([2, 3, 4, 6, 7, 8, 9, 10]);
      const mins = dial * 5;
      const { options, correctIndex } = buildShuffledExplainOptions(
        {
          en: `Each number on the clock stands for 5 minutes, so ${dial} × 5 = ${mins} minutes.`,
          ar: `كل رقم على الساعة يمثل ٥ دقائق، إذن ${dial} × ٥ = ${mins} دقيقة.`,
        },
        {
          en: `Each number on the clock stands for 10 minutes, so we add 10.`,
          ar: `كل رقم على الساعة يمثل ١٠ دقائق.`,
        },
        {
          en: `The minute hand only shows ${dial} single minutes past the hour.`,
          ar: `عقرب الدقائق يشير إلى ${dial} دقائق فقط بعد الساعة.`,
        }
      );
      return {
        id: makeUid('pe-clk-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'explain_it',
        signature: `pe-exp:clk:dial:${dial}`,
        prompt: {
          en: `Explain it: Why does the long minute hand pointing to ${dial} mean :${padMinute(mins)}?`,
          ar: `اشرح السبب: لماذا يعني عقرب الدقائق عند الرقم ${dial} مرور ${mins} دقيقة؟`,
        },
        options,
        correctIndex,
      };
    }

    case 'calendar': {
      const useWordTime = nextRandom() < 0.55;
      if (useWordTime) {
        const startH = randInt(2, 10);
        const startM = pickOne([15, 30, 45]);
        const addM = pickOne([30, 45]);
        const tot = startH * 60 + startM + addM;
        const endH = ((Math.floor(tot / 60) - 1) % 12) + 1;
        const endM = tot % 60;
        const ans = `${endH}:${padMinute(endM)}`;
        const wrongs = shuffle([-15, 15, 30, 60]).map((d) => {
          const t2 = tot + d;
          const h2 = ((Math.floor(t2 / 60) - 1 + 12) % 12) + 1;
          const m2 = ((t2 % 60) + 60) % 60;
          return `${h2}:${padMinute(m2)}`;
        });
        const unique = shuffle(Array.from(new Set([ans, ...wrongs])).slice(0, 4));
        return {
          id: makeUid('pe-cal-h', idx),
          subjectId,
          difficulty: 'hard',
          format: 'word_problem',
          signature: `pe-wp:cal:${startH}:${startM}+${addM}`,
          prompt: {
            en: `${kid.en}'s felucca ride starts at ${startH}:${padMinute(startM)} and lasts ${addM} minutes. What time does it finish?`,
            ar: `تبدأ رحلة الفلوكة مع ${kid.ar} الساعة ${startH}:${padMinute(startM)} وتستمر ${addM} دقيقة. متى تنتهي؟`,
          },
          options: unique.map((t) => ({ en: t, ar: t })),
          correctIndex: unique.indexOf(ans),
        };
      }
      const startIdx = randInt(0, 6);
      const jump = randInt(3, 6);
      const targetIdx = (startIdx + jump) % 7;
      const pool = new Set<number>([targetIdx]);
      while (pool.size < 4) pool.add(randInt(0, 6));
      const arr = shuffle(Array.from(pool));
      return {
        id: makeUid('pe-cal-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'word_problem',
        signature: `pe-wp:cal:day:${startIdx}+${jump}`,
        prompt: {
          en: `${kid.en} visits the museum on ${WEEKDAYS_EXAM[startIdx].en} and will return ${jump} days later. What day will that be?`,
          ar: `زار ${kid.ar} المتحف يوم ${WEEKDAYS_EXAM[startIdx].ar} وسيعود بعد ${jump} أيام. أي يوم سيكون ذلك؟`,
        },
        options: arr.map((i) => WEEKDAYS_EXAM[i]),
        correctIndex: arr.indexOf(targetIdx),
      };
    }

    case 'length': {
      const start = randInt(2, 5);
      const len = randInt(4, 9);
      const end = start + len;
      if (nextRandom() < 0.5) {
        const { options, correctIndex } = buildShuffledExplainOptions(
          {
            en: `Because the pencil skips the first ${start} cm, so its real length is ${end} − ${start} = ${len} cm.`,
            ar: `لأن القلم لم يبدأ من الصفر وتجاوز ${start} سم، فطوله الحقيقي ${end} − ${start} = ${len} سم.`,
          },
          {
            en: `We should add ${end} + ${start} to get ${end + start} cm.`,
            ar: `يجب أن نجمع ${end} + ${start} لنحصل على ${end + start} سم.`,
          },
          {
            en: `The length is always the last number (${end} cm) no matter where it starts.`,
            ar: `الطول هو دائمًا رقم النهاية (${end} سم) مهما كانت البداية.`,
          }
        );
        return {
          id: makeUid('pe-len-h', idx),
          subjectId,
          difficulty: 'hard',
          format: 'explain_it',
          signature: `pe-exp:len:${start}:${end}`,
          prompt: {
            en: `Explain it: A pencil starts at ${start} cm and ends at ${end} cm on a ruler. Why is its length ${len} cm and not ${end} cm?`,
            ar: `اشرح السبب: يبدأ قلم عند ${start} سم وينتهي عند ${end} سم على المسطرة. لماذا طوله ${len} سم وليس ${end} سم؟`,
          },
          options,
          correctIndex,
        };
      }
      const opts = buildNumberOptions(len, [-2, -1, 1, 2, start], 1);
      if (!opts.includes(end)) opts[opts[0] === len ? 1 : 0] = end;
      const shuf = shuffle(Array.from(new Set(opts)));
      return {
        id: makeUid('pe-len-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'word_problem',
        signature: `pe-wp:len:${start}:${end}`,
        prompt: {
          en: `${kid.en} lined up a papyrus brush from the ${start} cm mark to the ${end} cm mark on a ruler. How long is the brush?`,
          ar: `وضع ${kid.ar} فرشاة رسم من علامة ${start} سم حتى ${end} سم على المسطرة. كم طول الفرشاة؟`,
        },
        options: shuf.map((n) => ({ en: `${n} cm`, ar: `${n} سم` })),
        correctIndex: shuf.indexOf(len),
      };
    }

    case 'capacity': {
      const a = pickOne([200, 250, 300, 350, 400]);
      const b = pickOne([150, 200, 250, 300, 350]);
      const left = 1000 - (a + b);
      const opts = buildNumberOptions(left, [-150, -100, -50, 50, 100, 150], 50);
      return {
        id: makeUid('pe-cap-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'word_problem',
        signature: `pe-wp:cap:${a}+${b}`,
        prompt: {
          en: `${kid.en} poured ${a} mL and then ${b} mL of water into an empty 1 Liter (1000 mL) jug. How many more mL are needed to fill it?`,
          ar: `سكب ${kid.ar} ${a} مل ثم ${b} مل من الماء في دورق فارغ سعة ١ لتر (١٠٠٠ مل). كم ملليلترًا تبقى ليمتلئ؟`,
        },
        options: opts.map((n) => ({ en: `${n} mL`, ar: `${n} مل` })),
        correctIndex: opts.indexOf(left),
      };
    }

    case 'mass': {
      const grams = pickOne([650, 750, 800, 850, 900, 950]);
      const { options, correctIndex } = buildShuffledExplainOptions(
        {
          en: `Because 1 kg equals 1000 g, and 1000 g is heavier than ${grams} g.`,
          ar: `لأن ١ كجم يساوي ١٠٠٠ جم، و ١٠٠٠ جم أثقل من ${grams} جم.`,
        },
        {
          en: `Actually ${grams} g is heavier because ${grams} is bigger than 1.`,
          ar: `في الحقيقة ${grams} جم أثقل لأن ${grams} أكبر من ١.`,
        },
        {
          en: `Because 1 kg equals 100 g.`,
          ar: `لأن ١ كجم يساوي ١٠٠ جم.`,
        }
      );
      return {
        id: makeUid('pe-mass-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'explain_it',
        signature: `pe-exp:mass:1kg:${grams}`,
        prompt: {
          en: `Explain it: Why is 1 kg of dates heavier than ${grams} g of figs?`,
          ar: `اشرح السبب: لماذا ١ كجم من التمر أثقل من ${grams} جم من التين؟`,
        },
        options,
        correctIndex,
      };
    }

    case 'shapes': {
      const variant = pickOne(['cube_vs_cyl', 'hex_vs_pent', 'square_vs_tri'] as const);
      if (variant === 'cube_vs_cyl') {
        const { options, correctIndex } = buildShuffledExplainOptions(
          {
            en: 'A Cube has 6 flat square faces and 8 sharp vertices, while a Cylinder has 2 flat circular faces and curved sides.',
            ar: 'المكعب له ٦ أوجه مربعة مستوية و ٨ رؤوس، بينما الأسطوانة لها وجهان دائريان وجانب منحني.',
          },
          {
            en: 'A Cube and a Cylinder both have 6 flat faces.',
            ar: 'المكعب والأسطوانة كلاهما له ٦ أوجه مستوية.',
          },
          {
            en: 'A Cylinder has 8 vertices and no curved surfaces.',
            ar: 'الأسطوانة لها ٨ رؤوس وليس بها أي سطح منحني.',
          }
        );
        return {
          id: makeUid('pe-shp-h', idx),
          subjectId,
          difficulty: 'hard',
          format: 'explain_it',
          signature: 'pe-exp:shp:cube_cyl',
          prompt: {
            en: 'Explain it: Which statement correctly compares a Cube and a Cylinder?',
            ar: 'اشرح السبب: أي جملة تقارن بشكل صحيح بين المكعب والأسطوانة؟',
          },
          options,
          correctIndex,
        };
      }
      if (variant === 'hex_vs_pent') {
        const { options, correctIndex } = buildShuffledExplainOptions(
          {
            en: 'A Hexagon has 6 sides and 6 vertices, which is 1 more side than a Pentagon (5 sides).',
            ar: 'السداسي له ٦ أضلاع و ٦ رؤوس، أي يزيد بضلع واحد عن الخماسي (٥ أضلاع).',
          },
          {
            en: 'A Pentagon has 6 sides and a Hexagon has 5 sides.',
            ar: 'الخماسي له ٦ أضلاع والسداسي له ٥ أضلاع.',
          },
          {
            en: 'Both shapes have 4 sides like a Square.',
            ar: 'كلا الشكلين له ٤ أضلاع مثل المربع.',
          }
        );
        return {
          id: makeUid('pe-shp-h', idx),
          subjectId,
          difficulty: 'hard',
          format: 'explain_it',
          signature: 'pe-exp:shp:hex_pent',
          prompt: {
            en: 'Explain it: How can you tell a Hexagon apart from a Pentagon?',
            ar: 'اشرح السبب: كيف تفرّق بين الشكل السداسي والشكل الخماسي؟',
          },
          options,
          correctIndex,
        };
      }
      const { options, correctIndex } = buildShuffledExplainOptions(
        {
          en: 'A Square has 4 equal sides and 4 corners, while a Triangle has 3 sides and 3 corners.',
          ar: 'المربع له ٤ أضلاع متساوية و ٤ رؤوس، بينما المثلث له ٣ أضلاع و ٣ رؤوس.',
        },
        {
          en: 'A Triangle has 4 sides and a Square has 3 sides.',
          ar: 'المثلث له ٤ أضلاع والمربع له ٣ أضلاع.',
        },
        {
          en: 'A Square is a 3D solid with 6 faces.',
          ar: 'المربع مجسم ثلاثي الأبعاد له ٦ أوجه.',
        }
      );
      return {
        id: makeUid('pe-shp-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'explain_it',
        signature: 'pe-exp:shp:sq_tri',
        prompt: {
          en: 'Explain it: What makes a Square different from a Triangle?',
          ar: 'اشرح السبب: ما الفرق بين المربع والمثلث؟',
        },
        options,
        correctIndex,
      };
    }

    case 'fractions': {
      const pair = pickOne([
        { big: '1/2', small: '1/4', bigN: 2, smallN: 4 },
        { big: '1/2', small: '1/3', bigN: 2, smallN: 3 },
        { big: '1/3', small: '1/6', bigN: 3, smallN: 6 },
        { big: '1/4', small: '1/8', bigN: 4, smallN: 8 },
      ] as const);
      const { options, correctIndex } = buildShuffledExplainOptions(
        {
          en: `Cutting the same pie into only ${pair.bigN} equal pieces makes each piece bigger than cutting it into ${pair.smallN} pieces.`,
          ar: `تقسيم نفس الفطيرة إلى ${pair.bigN} أجزاء متساوية فقط يجعل كل قطعة أكبر من تقسيمها إلى ${pair.smallN} أجزاء.`,
        },
        {
          en: `Actually ${pair.small} is bigger because ${pair.smallN} is a bigger number than ${pair.bigN}.`,
          ar: `في الحقيقة ${pair.small} أكبر لأن الرقم ${pair.smallN} أكبر من ${pair.bigN}.`,
        },
        {
          en: `Both ${pair.big} and ${pair.small} are always the exact same size.`,
          ar: `كلاهما ${pair.big} و ${pair.small} لهما نفس الحجم تمامًا.`,
        }
      );
      return {
        id: makeUid('pe-frac-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'explain_it',
        signature: `pe-exp:frac:${pair.big}:${pair.small}`,
        prompt: {
          en: `Explain it: Why is ${pair.big} of a cake bigger than ${pair.small} of the same cake?`,
          ar: `اشرح السبب: لماذا ${pair.big} من الكعكة أكبر من ${pair.small} من نفس الكعكة؟`,
        },
        options,
        correctIndex,
      };
    }

    case 'graphs': {
      const m = randInt(6, 12);
      const d = randInt(2, m - 2);
      const f = randInt(3, 9);
      const askDiff = nextRandom() < 0.55;
      if (askDiff) {
        const diff = m - d;
        const opts = buildNumberOptions(diff, [-2, -1, 1, 2, 3], 1);
        return {
          id: makeUid('pe-gr-h', idx),
          subjectId,
          difficulty: 'hard',
          format: 'word_problem',
          signature: `pe-wp:gr:diff:${m}:${d}:${f}`,
          prompt: {
            en: `On ${kid.en}'s class chart, ${m} students chose Mangoes, ${d} chose Dates, and ${f} chose Figs. How many more students chose Mangoes than Dates?`,
            ar: `في رسم فصل ${kid.ar} البياني، اختار ${m} تلميذًا المانجو و ${d} التمر و ${f} التين. بكم يزيد محبو المانجو عن التمر؟`,
          },
          options: opts.map((n) => ({ en: `${n} students`, ar: `${n} تلاميذ` })),
          correctIndex: opts.indexOf(diff),
        };
      }
      const total = m + d + f;
      const opts = buildNumberOptions(total, [-3, -2, -1, 1, 2, 3], 5);
      return {
        id: makeUid('pe-gr-h', idx),
        subjectId,
        difficulty: 'hard',
        format: 'word_problem',
        signature: `pe-wp:gr:tot:${m}:${d}:${f}`,
        prompt: {
          en: `On ${kid.en}'s bazaar chart, there are ${m} lanterns, ${d} rugs, and ${f} baskets. How many items are on the chart altogether?`,
          ar: `في رسم ${kid.ar} البياني يوجد ${m} فانوسًا و ${d} سجاد و ${f} سلال. كم إجمالي العناصر معًا؟`,
        },
        options: opts.map((n) => ({ en: `${n} items`, ar: `${n} عنصرًا` })),
        correctIndex: opts.indexOf(total),
      };
    }
  }
}

export interface GeneratePlacementExamOptions {
  avoidSignatures?: Set<string>;
  recordHistory?: boolean;
}

/**
 * Generates a fresh 24-question Placement & Comprehension Exam:
 * - 2 questions per subject across all 12 subjects
 * - Ordered Easy -> Hard inside each subject
 * - Multiple choice only (no typing)
 * - Includes both visual core questions, bilingual word problems, and "explain it" questions
 * - Honors the session + persisted no-repeat registry
 */
export function generatePlacementExam(
  options?: GeneratePlacementExamOptions
): PlacementQuestion[] {
  const avoid = options?.avoidSignatures
    ? new Set<string>(options.avoidSignatures)
    : getCombinedSeenSignatures();

  const questions: PlacementQuestion[] = [];
  let idx = 0;

  for (const subject of EGYPT_SUBJECTS) {
    const easy = buildEasyQuestionForSubject(subject.id, avoid, idx++);
    avoid.add(easy.signature);
    const hard = buildHardComprehensionForSubject(subject.id, avoid, idx++);
    avoid.add(hard.signature);
    questions.push(easy, hard);
  }

  if (options?.recordHistory !== false) {
    recordSeenQuestionSignatures(questions.map((q) => q.signature));
  }

  return questions;
}

/* ============================================================================
   SCORING, CLASSIFICATION, RECOMMENDATIONS & COMPARISON
   ============================================================================ */

export function classifySubjectAccuracy(accuracy: number): PlacementTier {
  if (accuracy < 0.5) return 'needs_support';
  if (accuracy < 0.8) return 'developing';
  return 'strong';
}

export function recommendedStartLevelForTier(
  tier: PlacementTier,
  avgResponseMs: number
): LevelNumber {
  if (tier === 'needs_support') return 1;
  if (tier === 'developing') return 2;
  return avgResponseMs <= 14000 ? 4 : 3;
}

export function overallLevelFromAccuracy(accuracy: number): BilingualText {
  if (accuracy >= 0.85) {
    return { en: 'Master Explorer (Ready for Levels 3–5)', ar: 'مستكشف بارع (جاهز للمستويات ٣–٥)' };
  }
  if (accuracy >= 0.65) {
    return { en: 'Confident Builder (Ready for Levels 2–4)', ar: 'بنّاء واثق (جاهز للمستويات ٢–٤)' };
  }
  if (accuracy >= 0.45) {
    return { en: 'Rising Apprentice (Start at Levels 1–2)', ar: 'متدرب صاعد (ابدأ من المستويات ١–٢)' };
  }
  return { en: 'Foundation Seeker (Start at Level 1)', ar: 'بداية التأسيس (ابدأ من المستوى ١)' };
}

export function scorePlacementExam(
  questions: PlacementQuestion[],
  answers: Record<string, PlacementAnswerRecord>,
  completedAt = new Date().toISOString()
): PlacementExamResult {
  const bySubject = new Map<
    SubjectId,
    { correct: number; total: number; totalMs: number }
  >();

  for (const s of EGYPT_SUBJECTS) {
    bySubject.set(s.id, { correct: 0, total: 0, totalMs: 0 });
  }

  let totalCorrect = 0;
  let totalMsAll = 0;
  let answeredCount = 0;

  for (const q of questions) {
    const bucket = bySubject.get(q.subjectId)!;
    bucket.total += 1;
    const ans = answers[q.id];
    if (ans) {
      const clampedMs = Math.max(200, Math.min(300000, Math.round(ans.responseTimeMs)));
      bucket.totalMs += clampedMs;
      totalMsAll += clampedMs;
      answeredCount += 1;
      if (ans.selectedIndex === q.correctIndex) {
        bucket.correct += 1;
        totalCorrect += 1;
      }
    }
  }

  const subjects: PlacementSubjectResult[] = EGYPT_SUBJECTS.map((s) => {
    const b = bySubject.get(s.id)!;
    const accuracy = b.total > 0 ? b.correct / b.total : 0;
    const avgResponseMs = b.total > 0 ? Math.round(b.totalMs / b.total) : 0;
    const tier = classifySubjectAccuracy(accuracy);
    const recommendedStartLevel = recommendedStartLevelForTier(tier, avgResponseMs);
    return {
      subjectId: s.id,
      correct: b.correct,
      total: b.total,
      accuracy,
      avgResponseMs,
      tier,
      recommendedStartLevel,
    };
  });

  // Sort for Top 2 Strengths (highest accuracy, then fastest response time)
  const rankedStrong = [...subjects].sort((a, b) => {
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return a.avgResponseMs - b.avgResponseMs;
  });

  // Sort for Top 2 Areas to Practice (lowest accuracy, then slowest response time)
  const rankedWeak = [...subjects].sort((a, b) => {
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    return b.avgResponseMs - a.avgResponseMs;
  });

  const overallAccuracy = questions.length > 0 ? totalCorrect / questions.length : 0;
  const avgResponseMs = answeredCount > 0 ? Math.round(totalMsAll / answeredCount) : 0;

  return {
    id: `exam-${completedAt}-${Math.floor(nextRandom() * 1e6).toString(36)}`,
    completedAt,
    overallAccuracy,
    overallLevel: overallLevelFromAccuracy(overallAccuracy),
    totalCorrect,
    totalQuestions: questions.length,
    avgResponseMs,
    subjects,
    topStrengths: rankedStrong.slice(0, 2).map((s) => s.subjectId),
    topAreasToPractice: rankedWeak.slice(0, 2).map((s) => s.subjectId),
  };
}

export function getTierLabel(tier: PlacementTier): BilingualText {
  switch (tier) {
    case 'needs_support':
      return { en: 'Needs support', ar: 'يحتاج دعمًا' };
    case 'developing':
      return { en: 'Developing', ar: 'يتطور' };
    case 'strong':
      return { en: 'Strong', ar: 'قوي' };
  }
}

export function comparePlacementResults(
  current: PlacementExamResult,
  previous: PlacementExamResult
): PlacementSubjectComparison[] {
  const prevBySubject = new Map<SubjectId, PlacementSubjectResult>();
  for (const s of previous.subjects) {
    prevBySubject.set(s.subjectId, s);
  }

  return current.subjects.map((cur) => {
    const prev = prevBySubject.get(cur.subjectId);
    const prevTier = prev?.tier ?? cur.tier;
    const changed = prev ? prev.tier !== cur.tier : false;
    const deltaAccuracy = prev ? cur.accuracy - prev.accuracy : 0;
    const subjInfo = EGYPT_SUBJECTS.find((s) => s.id === cur.subjectId);
    const prevLbl = getTierLabel(prevTier);
    const curLbl = getTierLabel(cur.tier);

    return {
      subjectId: cur.subjectId,
      previousTier: prevTier,
      currentTier: cur.tier,
      changed,
      deltaAccuracy,
      summary: {
        en: `${subjInfo?.title.en ?? cur.subjectId}: ${prevLbl.en} → ${curLbl.en}`,
        ar: `${subjInfo?.title.ar ?? cur.subjectId}: ${prevLbl.ar} ← ${curLbl.ar}`,
      },
    };
  });
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates a clean, self-contained, parent-friendly printable HTML report.
 */
export function buildPlacementReportHtml(
  result: PlacementExamResult,
  previousResult: PlacementExamResult | null,
  lang: Language
): string {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const dateStr = new Date(result.completedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const pct = Math.round(result.overallAccuracy * 100);
  const avgSec = (result.avgResponseMs / 1000).toFixed(1);

  const subjectName = (id: SubjectId) => {
    const s = EGYPT_SUBJECTS.find((x) => x.id === id);
    return s ? s.title[lang] : id;
  };

  const comparisons = previousResult ? comparePlacementResults(result, previousResult) : [];
  const changedComparisons = comparisons.filter((c) => c.changed);

  const rowsHtml = result.subjects
    .map((s) => {
      const sPct = Math.round(s.accuracy * 100);
      const tierText = getTierLabel(s.tier)[lang];
      const barColor =
        s.tier === 'strong' ? '#059669' : s.tier === 'developing' ? '#D97706' : '#E11D48';
      const sec = (s.avgResponseMs / 1000).toFixed(1);
      return `
        <tr>
          <td><strong>${escapeHtml(subjectName(s.subjectId))}</strong></td>
          <td>${s.correct}/${s.total} (${sPct}%)</td>
          <td>
            <div class="bar-track"><div class="bar-fill" style="width:${sPct}%;background:${barColor}"></div></div>
          </td>
          <td><span class="badge" style="background:${barColor}">${escapeHtml(tierText)}</span></td>
          <td>${sec}s</td>
          <td>${isAr ? `المستوى ${s.recommendedStartLevel}` : `Level ${s.recommendedStartLevel}`}</td>
        </tr>`;
    })
    .join('');

  const compHtml =
    previousResult && changedComparisons.length > 0
      ? `<section class="card">
          <h2>${isAr ? 'المقارنة مع الاختبار السابق' : 'Progress Since Previous Check'}</h2>
          <ul>
            ${changedComparisons
              .map((c) => `<li>${escapeHtml(c.summary[lang])}</li>`)
              .join('')}
          </ul>
        </section>`
      : '';

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(isAr ? 'تقرير تحديد المستوى — أرقام النيل' : 'Level Check Report — Nile Numbers')}</title>
  <style>
    body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1C1917; background: #FFFBEB; margin: 0; padding: 24px; line-height: 1.5; }
    .container { max-width: 860px; margin: 0 auto; background: #FFFFFF; border: 2px solid #FDE68A; border-radius: 16px; padding: 28px; }
    h1 { margin: 0 0 6px; color: #78350F; font-size: 26px; }
    h2 { margin: 0 0 10px; color: #0F766E; font-size: 18px; }
    .meta { color: #57534E; font-size: 14px; margin-bottom: 18px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .card { background: #FFFDF7; border: 1px solid #FDE68A; border-radius: 12px; padding: 14px; margin-bottom: 16px; }
    .stat-num { font-size: 24px; font-weight: 800; color: #78350F; }
    .stat-lbl { font-size: 12px; color: #57534E; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 14px; }
    th, td { text-align: ${isAr ? 'right' : 'left'}; padding: 10px 8px; border-bottom: 1px solid #F3F4F6; }
    th { background: #FEF3C7; color: #78350F; font-weight: 700; }
    .bar-track { width: 110px; height: 10px; background: #E7E5E4; border-radius: 99px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 99px; }
    .badge { color: #FFFFFF; padding: 3px 9px; border-radius: 99px; font-size: 12px; font-weight: 700; white-space: nowrap; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .note { font-size: 12px; color: #78716C; margin-top: 16px; text-align: center; }
    @media print { body { background: #FFF; padding: 0; } .container { border: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(isAr ? 'تقرير تحديد المستوى — أرقام النيل' : 'Nile Numbers — Level Check Report')}</h1>
    <div class="meta">${escapeHtml(isAr ? `التاريخ: ${dateStr}` : `Date: ${dateStr}`)} · ${escapeHtml(result.overallLevel[lang])}</div>

    <div class="summary-grid">
      <div class="card">
        <div class="stat-num">${result.totalCorrect}/${result.totalQuestions} (${pct}%)</div>
        <div class="stat-lbl">${escapeHtml(isAr ? 'الدرجة الإجمالية' : 'Overall Score')}</div>
      </div>
      <div class="card">
        <div class="stat-num">${avgSec}s</div>
        <div class="stat-lbl">${escapeHtml(isAr ? 'متوسط وقت الإجابة' : 'Average Response Time')}</div>
      </div>
      <div class="card">
        <div class="stat-num">${result.subjects.filter((s) => s.tier === 'strong').length}/12</div>
        <div class="stat-lbl">${escapeHtml(isAr ? 'الموضوعات القوية' : 'Strong Subjects')}</div>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <h2>${escapeHtml(isAr ? 'أقوى موضوعين' : 'Top 2 Strengths')}</h2>
        <ul>${result.topStrengths.map((id) => `<li><strong>${escapeHtml(subjectName(id))}</strong></li>`).join('')}</ul>
      </div>
      <div class="card">
        <h2>${escapeHtml(isAr ? 'أهم موضوعين للتدريب' : 'Top 2 Areas to Practise')}</h2>
        <ul>${result.topAreasToPractice.map((id) => `<li><strong>${escapeHtml(subjectName(id))}</strong></li>`).join('')}</ul>
      </div>
    </div>

    ${compHtml}

    <div class="card">
      <h2>${escapeHtml(isAr ? 'نتائج الموضوعات الاثني عشر' : 'Subject-by-Subject Breakdown')}</h2>
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(isAr ? 'الموضوع' : 'Subject')}</th>
            <th>${escapeHtml(isAr ? 'النتيجة' : 'Score')}</th>
            <th>${escapeHtml(isAr ? 'التقدم' : 'Bar')}</th>
            <th>${escapeHtml(isAr ? 'التصنيف' : 'Level')}</th>
            <th>${escapeHtml(isAr ? 'متوسط الوقت' : 'Avg Time')}</th>
            <th>${escapeHtml(isAr ? 'المستوى المقترح' : 'Recommended Start')}</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>

    <div class="note">${escapeHtml(
      isAr
        ? 'تم إنشاء هذا التقرير محليًا على هذا الجهاز. لا يؤثر اختبار تحديد المستوى سلبًا على نجوم أو إتقان الطفل.'
        : 'Generated locally on this device. Level Check results never lower a child’s earned stars or mastery.'
    )}</div>
  </div>
</body>
</html>`;
}
