import { BilingualText } from '../types/game';

export interface RegroupStepSnapshot {
  /** Displayed regrouped digit in Hundreds column (e.g. "+1" carry or updated digit like "4") */
  hundredsAnnotation: string;
  /** Displayed regrouped digit in Tens column (e.g. "+1", "0", "9", "10") */
  tensAnnotation: string;
  /** Displayed regrouped digit in Ones column (e.g. "12") */
  onesAnnotation: string;
  /** Which original top digits should appear struck-through (subtraction borrowing) */
  crossed: {
    hundreds: boolean;
    tens: boolean;
    ones: boolean;
  };
  /** Intermediate crossed tens digit when borrowing across zero (0 -> 10 -> 9) */
  intermediateTensCrossed?: string;
  /** Active column(s) to highlight for this step */
  highlightCols: ('h' | 't' | 'o')[];
  /** Clear bilingual teaching explanation for this step */
  explanation: BilingualText;
}

export interface RegroupingPlan {
  operator: '+' | '-';
  top: { h: number; t: number; o: number };
  bottom: { h: number; t: number; o: number };
  answer: number;
  hasHundreds: boolean;
  needsOnesRegroup: boolean;
  needsTensRegroup: boolean;
  borrowedAcrossZero: boolean;
  /** Final carry values for addition */
  carryToTens: number;
  carryToHundreds: number;
  /** Final updated top digits after all borrowing in subtraction */
  finalTopDigits: { h: number; t: number; o: number };
  /** Ordered teaching steps: Step 1 (Ones), Step 2 (Tens), and optional Step 3 (Hundreds summary) */
  steps: RegroupStepSnapshot[];
}

export function splitDigits3(n: number): { h: number; t: number; o: number } {
  const safe = Math.max(0, Math.floor(n));
  return {
    h: Math.floor(safe / 100),
    t: Math.floor((safe % 100) / 10),
    o: safe % 10,
  };
}

/**
 * Computes complete, step-by-step regrouping guidance for 2-digit and 3-digit
 * vertical addition and subtraction, including double regrouping (e.g., 178 + 256,
 * 512 - 278) and borrowing across a zero (e.g., 502 - 278, 400 - 156).
 */
export function computeRegroupingPlan(
  operator: '+' | '-',
  topNum: number,
  bottomNum: number
): RegroupingPlan {
  const top = splitDigits3(topNum);
  const bottom = splitDigits3(bottomNum);
  const answer = operator === '+' ? topNum + bottomNum : topNum - bottomNum;
  const hasHundreds = top.h > 0 || bottom.h > 0 || answer >= 100;

  if (operator === '+') {
    const onesSum = top.o + bottom.o;
    const carryToTens = onesSum >= 10 ? 1 : 0;
    const onesDigit = onesSum % 10;

    const tensSum = top.t + bottom.t + carryToTens;
    const carryToHundreds = tensSum >= 10 ? 1 : 0;
    const tensDigit = tensSum % 10;

    const hundredsSum = top.h + bottom.h + carryToHundreds;

    const steps: RegroupStepSnapshot[] = [];

    // Step 1: Ones column
    steps.push({
      hundredsAnnotation: '',
      tensAnnotation: carryToTens > 0 ? '+1' : '',
      onesAnnotation: '',
      crossed: { hundreds: false, tens: false, ones: false },
      highlightCols: carryToTens > 0 ? ['o', 't'] : ['o'],
      explanation:
        carryToTens > 0
          ? {
              en: `Step 1 (Ones): ${top.o} + ${bottom.o} = ${onesSum}. Write ${onesDigit} in Ones and carry +1 Ten to Tens!`,
              ar: `الخطوة ١ (الآحاد): ${top.o} + ${bottom.o} = ${onesSum}. نكتب ${onesDigit} في الآحاد ونحمل +١ إلى العشرات!`,
            }
          : {
              en: `Step 1 (Ones): ${top.o} + ${bottom.o} = ${onesSum}. No carry needed in Ones.`,
              ar: `الخطوة ١ (الآحاد): ${top.o} + ${bottom.o} = ${onesSum}. لا نحتاج لإعادة تجميع في الآحاد.`,
            },
    });

    // Step 2: Tens column (always shown with carry from step 1 preserved!)
    const tensExpr =
      carryToTens > 0 ? `${top.t} + ${bottom.t} + 1` : `${top.t} + ${bottom.t}`;
    steps.push({
      hundredsAnnotation: carryToHundreds > 0 ? '+1' : '',
      tensAnnotation: carryToTens > 0 ? '+1' : '',
      onesAnnotation: '',
      crossed: { hundreds: false, tens: false, ones: false },
      highlightCols: carryToHundreds > 0 ? ['t', 'h'] : ['t'],
      explanation:
        carryToHundreds > 0
          ? {
              en: `Step 2 (Tens): ${tensExpr} = ${tensSum}. Write ${tensDigit} in Tens and carry +1 Hundred to Hundreds!`,
              ar: `الخطوة ٢ (العشرات): ${tensExpr} = ${tensSum}. نكتب ${tensDigit} في العشرات ونحمل +١ إلى المئات!`,
            }
          : {
              en: `Step 2 (Tens): ${tensExpr} = ${tensSum}. Write ${tensDigit} in Tens.`,
              ar: `الخطوة ٢ (العشرات): ${tensExpr} = ${tensSum}. نكتب ${tensDigit} في العشرات.`,
            },
    });

    if (hasHundreds) {
      const hExpr =
        carryToHundreds > 0 ? `${top.h} + ${bottom.h} + 1` : `${top.h} + ${bottom.h}`;
      steps.push({
        hundredsAnnotation: carryToHundreds > 0 ? '+1' : '',
        tensAnnotation: carryToTens > 0 ? '+1' : '',
        onesAnnotation: '',
        crossed: { hundreds: false, tens: false, ones: false },
        highlightCols: ['h'],
        explanation: {
          en: `Step 3 (Hundreds): ${hExpr} = ${hundredsSum}. Put all digits together: ${answer}!`,
          ar: `الخطوة ٣ (المئات): ${hExpr} = ${hundredsSum}. نجمع الخانات معًا لنحصل على ${answer}!`,
        },
      });
    }

    return {
      operator,
      top,
      bottom,
      answer,
      hasHundreds,
      needsOnesRegroup: carryToTens > 0,
      needsTensRegroup: carryToHundreds > 0,
      borrowedAcrossZero: false,
      carryToTens,
      carryToHundreds,
      finalTopDigits: { ...top },
      steps,
    };
  }

  // SUBTRACTION
  let curH = top.h;
  let curT = top.t;
  let curO = top.o;
  let crossedH = false;
  let crossedT = false;
  let crossedO = false;
  let borrowedAcrossZero = false;
  let intermediateTensCrossed: string | undefined;

  const needsOnesRegroup = curO < bottom.o;
  const steps: RegroupStepSnapshot[] = [];

  // Step 1: Ones column borrowing (including borrowing across a zero!)
  if (needsOnesRegroup) {
    if (curT === 0 && curH > 0) {
      // Borrow across zero: H -> H-1, T: 0 -> 10 -> 9, O: o -> o+10
      borrowedAcrossZero = true;
      curH -= 1;
      curT = 9;
      curO += 10;
      crossedH = true;
      crossedT = true;
      crossedO = true;
      intermediateTensCrossed = '10';

      steps.push({
        hundredsAnnotation: `${curH}`,
        tensAnnotation: `${curT}`,
        onesAnnotation: `${curO}`,
        crossed: { hundreds: true, tens: true, ones: true },
        intermediateTensCrossed: '10',
        highlightCols: ['h', 't', 'o'],
        explanation: {
          en: `Step 1 (Borrow across 0): ${top.o} < ${bottom.o} and Tens is 0! Borrow 1 Hundred (${top.h} → ${curH}) so Tens becomes 10, then borrow 1 Ten (10 → 9) so Ones becomes ${curO}. Now ${curO} − ${bottom.o} = ${curO - bottom.o}.`,
          ar: `الخطوة ١ (الاستلاف عبر الصفر): ${top.o} أصغر من ${bottom.o} والعشرات ٠! نستلف ١ من المئات (${top.h} ← ${curH}) فتصبح العشرات ١٠، ثم نستلف ١ منها (١٠ ← ٩) فتصبح الآحاد ${curO}. الآن ${curO} − ${bottom.o} = ${curO - bottom.o}.`,
        },
      });
    } else {
      curT -= 1;
      curO += 10;
      crossedT = true;
      crossedO = true;

      steps.push({
        hundredsAnnotation: '',
        tensAnnotation: `${curT}`,
        onesAnnotation: `${curO}`,
        crossed: { hundreds: false, tens: true, ones: true },
        highlightCols: ['t', 'o'],
        explanation: {
          en: `Step 1 (Ones): ${top.o} < ${bottom.o}, so borrow 1 Ten (${top.t} → ${curT}). Ones becomes ${curO}. Now ${curO} − ${bottom.o} = ${curO - bottom.o}.`,
          ar: `الخطوة ١ (الآحاد): ${top.o} أصغر من ${bottom.o}، فنستلف ١ من العشرات (${top.t} ← ${curT}) وتصبح الآحاد ${curO}. الآن ${curO} − ${bottom.o} = ${curO - bottom.o}.`,
        },
      });
    }
  } else {
    steps.push({
      hundredsAnnotation: '',
      tensAnnotation: '',
      onesAnnotation: '',
      crossed: { hundreds: false, tens: false, ones: false },
      highlightCols: ['o'],
      explanation: {
        en: `Step 1 (Ones): ${curO} − ${bottom.o} = ${curO - bottom.o}. No borrowing needed in Ones.`,
        ar: `الخطوة ١ (الآحاد): ${curO} − ${bottom.o} = ${curO - bottom.o}. لا نحتاج للاستلاف في الآحاد.`,
      },
    });
  }

  // Step 2: Tens column borrowing (checks UPDATED curT!)
  const needsTensRegroup = curT < bottom.t;
  if (needsTensRegroup && curH > 0) {
    const beforeH = curH;
    const beforeT = curT;
    curH -= 1;
    curT += 10;
    crossedH = true;
    crossedT = true;

    steps.push({
      hundredsAnnotation: `${curH}`,
      tensAnnotation: `${curT}`,
      onesAnnotation: crossedO ? `${curO}` : '',
      crossed: { hundreds: crossedH, tens: crossedT, ones: crossedO },
      intermediateTensCrossed:
        crossedO && beforeT !== top.t ? `${beforeT}` : intermediateTensCrossed,
      highlightCols: ['h', 't'],
      explanation: {
        en: `Step 2 (Tens): ${beforeT} < ${bottom.t}, so borrow 1 Hundred (${beforeH} → ${curH}). Tens becomes ${curT}. Now ${curT} − ${bottom.t} = ${curT - bottom.t}.`,
        ar: `الخطوة ٢ (العشرات): ${beforeT} أصغر من ${bottom.t}، فنستلف ١ من المئات (${beforeH} ← ${curH}) وتصبح العشرات ${curT}. الآن ${curT} − ${bottom.t} = ${curT - bottom.t}.`,
      },
    });
  } else {
    steps.push({
      hundredsAnnotation: crossedH ? `${curH}` : '',
      tensAnnotation: crossedT ? `${curT}` : '',
      onesAnnotation: crossedO ? `${curO}` : '',
      crossed: { hundreds: crossedH, tens: crossedT, ones: crossedO },
      intermediateTensCrossed,
      highlightCols: ['t'],
      explanation: {
        en: `Step 2 (Tens): Subtract Tens: ${curT} − ${bottom.t} = ${curT - bottom.t}.`,
        ar: `الخطوة ٢ (العشرات): نطرح العشرات: ${curT} − ${bottom.t} = ${curT - bottom.t}.`,
      },
    });
  }

  if (hasHundreds) {
    steps.push({
      hundredsAnnotation: crossedH ? `${curH}` : '',
      tensAnnotation: crossedT ? `${curT}` : '',
      onesAnnotation: crossedO ? `${curO}` : '',
      crossed: { hundreds: crossedH, tens: crossedT, ones: crossedO },
      intermediateTensCrossed:
        needsTensRegroup && needsOnesRegroup && !borrowedAcrossZero
          ? `${top.t - 1}`
          : intermediateTensCrossed,
      highlightCols: ['h'],
      explanation: {
        en: `Step 3 (Hundreds): ${curH} − ${bottom.h} = ${curH - bottom.h}. Final answer: ${answer}!`,
        ar: `الخطوة ٣ (المئات): ${curH} − ${bottom.h} = ${curH - bottom.h}. الإجابة النهائية: ${answer}!`,
      },
    });
  }

  return {
    operator,
    top,
    bottom,
    answer,
    hasHundreds,
    needsOnesRegroup,
    needsTensRegroup: needsTensRegroup || borrowedAcrossZero,
    borrowedAcrossZero,
    carryToTens: 0,
    carryToHundreds: 0,
    finalTopDigits: { h: curH, t: curT, o: curO },
    steps,
  };
}
