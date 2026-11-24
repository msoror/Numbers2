import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lightbulb, Repeat2, X } from 'lucide-react';
import {
  ActiveQuestion,
  BilingualText,
  GameScreenState,
  Language,
  LevelConfig,
  PlayerProgress,
  SubjectId,
} from '../types/game';
import { soundEngine } from '../utils/sound';

export type GuideCharacter = 'crocodile' | 'horus';

interface WalkingCompanionProps {
  screen: GameScreenState;
  lang: Language;
  progress: PlayerProgress;
  activeLevel: LevelConfig;
  activePracticeSubject: SubjectId;
  currentQuestion?: ActiveQuestion;
  roundIndex: number;
  streak: number;
  lastAttemptFeedback: { isCorrect: boolean; seq: number } | null;
}

const CHARACTER_META: Record<
  GuideCharacter,
  {
    name: BilingualText;
    role: BilingualText;
    badgeBg: string;
    accentColor: string;
  }
> = {
  crocodile: {
    name: { en: 'Sobek', ar: 'سوبك' },
    role: { en: 'Nile Crocodile Guide', ar: 'تمساح النيل المرشد' },
    badgeBg: '#ECFDF5',
    accentColor: '#047857',
  },
  horus: {
    name: { en: 'Horus', ar: 'حورس' },
    role: { en: 'Egyptian Falcon Guide', ar: 'الصقر المصري المرشد' },
    badgeBg: '#FEF3C7',
    accentColor: '#B45309',
  },
};

function getThemeCharacter(
  screen: GameScreenState,
  activeLevel: LevelConfig,
  activePracticeSubject: SubjectId
): GuideCharacter {
  // Crocodile is linked to the Nile River theme (Title Nile backdrop, Nile Felucca world, and Nile Water Capacity)
  if (screen === 'TITLE_MENU') return 'crocodile';

  if (screen === 'PLAYING' || screen === 'PAUSED' || screen === 'ROUND_SUMMARY') {
    if (activeLevel.worldId === 'nile' || activeLevel.subjectId === 'capacity') {
      return 'crocodile';
    }
    return 'horus';
  }

  if (screen === 'PRACTICE_SUBJECT') {
    if (
      activePracticeSubject === 'vertical_math' ||
      activePracticeSubject === 'arrays' ||
      activePracticeSubject === 'capacity'
    ) {
      return 'crocodile';
    }
    return 'horus';
  }

  // Horus guides the Ancient Egyptian menus (Game Section, Practice Menu, Sticker Book)
  return 'horus';
}

function getQuestionStrategyGuide(question: ActiveQuestion): BilingualText {
  const { data } = question;
  switch (data.kind) {
    case 'place_value':
      return {
        en: 'Count the Hundreds squares, Tens rods, and Ones cubes, then combine them!',
        ar: 'عُدّ مربعات المئات وأعمدة العشرات ومكعبات الآحاد ثم اجمعها معًا!',
      };
    case 'money_build':
      return {
        en: 'Tap the biggest Egyptian Pound bills first, then add smaller ones to match the price!',
        ar: 'اضغط على الأوراق النقدية الأكبر أولاً ثم أضف الأصغر لتصل للسعر المطلوب!',
      };
    case 'money_change_or_compare':
      return data.subKind === 'compare'
        ? {
            en: 'Compare the Hundreds digit first! If equal, check Tens, then Ones.',
            ar: 'قارن رقم المئات أولاً! وإذا تساوى، انظر إلى العشرات ثم الآحاد.',
          }
        : {
            en: 'Count up from the item price to the money paid to find the change!',
            ar: 'عُدّ تصاعديًا من السعر إلى المبلغ المدفوع لتجد الباقي بسهولة!',
          };
    case 'vertical_math':
      return data.operator === '+'
        ? {
            en: 'Start from the Ones on the right! If Ones reach 10 or more, carry 1 to Tens.',
            ar: 'ابدأ من الآحاد على اليمين! إذا وصل المجموع ١٠ أو أكثر، احمل ١ للعشرات.',
          }
        : {
            en: 'Start from the Ones on the right! If the top digit is smaller, borrow 1 Ten (= 10 Ones).',
            ar: 'ابدأ من الآحاد على اليمين! إذا كان الرقم العلوي أصغر، استلف عشرة (= ١٠ آحاد).',
          };
    case 'array_multiply':
      return {
        en: 'Count the rows going down, then skip-count how many treasures are in each row!',
        ar: 'عُدّ الصفوف ثم عُدّ بالقفز لمعرفة العدد الكلي في كل صف!',
      };
    case 'read_clock':
      return {
        en: 'Short red hand shows the Hour. Long teal hand shows Minutes — count by 5s!',
        ar: 'العقرب الأحمر القصير للساعات، والعقرب الطويل للدقائق — عُدّ بالخمسات!',
      };
    case 'set_clock':
      return {
        en: 'Use the Hour and Minute buttons until the clock matches, then tap Check!',
        ar: 'استخدم أزرار الساعات والدقائق حتى تطابق الساعة الوقت المطلوب ثم اضغط تحقق!',
      };
    case 'elapsed_or_calendar':
      return {
        en: 'Count forward step by step — hour by hour or day by day!',
        ar: 'عُدّ للأمام خطوة بخطوة — ساعة بساعة أو يومًا بيوم!',
      };
    case 'capacity_pour':
      return {
        en: 'Tap the Nile water scoops to fill right up to the orange line! Tap Clear if you go over.',
        ar: 'اضغط على أكواب ماء النيل لتصل للخط البرتقالي بدقة! واضغط مسح لو زاد الماء.',
      };
    case 'measure_length':
      return {
        en: 'Look at where the object starts and ends on the ruler, then subtract!',
        ar: 'انظر أين يبدأ الجسم وأين ينتهي على المسطرة ثم اطرح البداية من النهاية!',
      };
    case 'mass_or_unit':
      return {
        en: 'Watch which side of the scale dips down — heavier weighs more! Remember: 1 kg = 1,000 g.',
        ar: 'الجهة الأثقل تنزل للأسفل! وتذكّر: ١ كيلوجرام = ١٠٠٠ جرام.',
      };
    case 'fraction_or_shape':
      if (data.subKind === 'fraction') {
        return {
          en: 'Count the shaded slices on top, and ALL equal slices on the bottom!',
          ar: 'عُدّ الأجزاء المظللة في الأعلى، وكل الأجزاء المتساوية في الأسفل!',
        };
      }
      if (data.subKind === 'shape') {
        return {
          en: 'Count the straight sides, corners, or flat faces! Tap Hint to light up corners.',
          ar: 'عُدّ الأضلاع المستقيمة أو الزوايا أو الأوجه! اضغط مساعدة لإظهار الزوايا.',
        };
      }
      return {
        en: 'Read the number on top of each bar carefully before adding or comparing!',
        ar: 'اقرأ الرقم أعلى كل عمود بدقة قبل الجمع أو المقارنة!',
      };
  }
}

function getScreenGuideTips(
  screen: GameScreenState,
  progress: PlayerProgress,
  activeLevel: LevelConfig,
  activePracticeSubject: SubjectId,
  currentQuestion?: ActiveQuestion
): BilingualText[] {
  switch (screen) {
    case 'TITLE_MENU':
      return [
        {
          en: 'Welcome to Nile Numbers! Tap Game Section to play 60 math levels, or Practice to learn first!',
          ar: 'أهلاً بك في أرقام النيل! اضغط قسم الألعاب للعب ٦٠ مستوى، أو التدريب لتفهم الدرس أولاً!',
        },
        {
          en: 'Every time you start a level, brand-new exam numbers are created just for you!',
          ar: 'في كل مرة تبدأ مستوى، تتجدد أرقام الأسئلة تلقائيًا لتتدرب أكثر!',
        },
      ];
    case 'MAP_SELECT':
      return [
        {
          en: 'Pick any of the 12 subjects! Levels 1 & 2 are open — finish Level 2 to unlock Level 3!',
          ar: 'اختر أي موضوع من ١٢ موضوعًا! المستويان ١ و ٢ مفتوحان — أكمل ٢ لفتح ٣!',
        },
        {
          en:
            progress.totalStars > 0
              ? `You already earned ${progress.totalStars} stars! Tap Practice Topic on any card if you want a visual lesson first.`
              : 'Need a quick lesson first? Tap Practice Topic at the bottom of any subject card!',
          ar:
            progress.totalStars > 0
              ? `جمعت ${progress.totalStars} نجمة حتى الآن! اضغط شرح الموضوع في أي بطاقة لو أردت درسًا تفاعليًا.`
              : 'هل تريد فهم الموضوع أولاً؟ اضغط شرح الموضوع أسفل أي بطاقة!',
        },
      ];
    case 'PRACTICE_MENU':
      return [
        {
          en: 'Tap any subject card to explore interactive math visuals and practice fresh questions!',
          ar: 'اضغط أي موضوع لتستكشف المعمل التفاعلي وتتدرّب على أسئلة متجددة!',
        },
        {
          en: 'Complete all 5 game levels in any subject to unlock a special golden celebration here!',
          ar: 'أكمل جميع المستويات الخمسة لأي موضوع لتفتح احتفالاً ذهبيًا خاصًا هنا!',
        },
      ];
    case 'PRACTICE_SUBJECT': {
      const isNileTopic =
        activePracticeSubject === 'vertical_math' ||
        activePracticeSubject === 'arrays' ||
        activePracticeSubject === 'capacity';
      return [
        isNileTopic
          ? {
              en: 'Play with the Nile interactive controls above, then try the Auto-Generated Check on the right!',
              ar: 'جرّب الأدوات التفاعلية بالأعلى، ثم اختبر فهمك في الاختبار السريع المتجدد!',
            }
          : {
              en: 'Move the interactive sliders and buttons, then click Play Subject Levels when you feel ready!',
              ar: 'حرّك الأزرار التفاعلية وجرّب بنفسك، ثم اضغط العب مستويات هذا الموضوع عندما تستعد!',
            },
        {
          en: 'Click New Question anytime to practice with fresh auto-generated numbers!',
          ar: 'اضغط سؤال جديد في أي وقت للتدرّب على أرقام جديدة تلقائيًا!',
        },
      ];
    }
    case 'STICKER_BOOK':
      return [
        {
          en: `You collected ${progress.unlockedStickers.length} of 12 Egyptian stickers! Tap any unlocked sticker to celebrate.`,
          ar: `جمعت ${progress.unlockedStickers.length} من ١٢ ملصقًا مصريًا! اضغط أي ملصق مفتوح للاحتفال.`,
        },
        {
          en: 'Finish at least one level in each of the 12 subjects to fill your whole Sticker Book!',
          ar: 'أكمل مستوى واحدًا على الأقل في كل موضوع لتملأ ألبوم الملصقات بالكامل!',
        },
      ];
    case 'PLAYING':
      if (currentQuestion) {
        return [getQuestionStrategyGuide(currentQuestion), currentQuestion.data.hint];
      }
      return [
        {
          en: `Level ${activeLevel.levelNumber}: Take your time and tap me anytime for a helpful hint!`,
          ar: `المستوى ${activeLevel.levelNumber}: خذ وقتك واضغط عليّ في أي وقت للحصول على مساعدة!`,
        },
      ];
    case 'PAUSED':
      return [
        {
          en: 'Rest your eyes, toggle Lofi music, or press Resume whenever you are ready!',
          ar: 'استرح قليلاً أو تحكم في موسيقى لوفي، واضغط استمرار عندما تكون مستعدًا!',
        },
      ];
    case 'ROUND_SUMMARY':
      return [
        {
          en: 'Fantastic work! Try Next Level or Play Again for brand-new auto-generated numbers!',
          ar: 'عمل رائع! جرّب المرحلة التالية أو العب مرة أخرى بأرقام جديدة تمامًا!',
        },
      ];
  }
}

/* ============================================================================
   ILLUSTRATED NILE CROCODILE ("SOBEK") — LARGER ANIMATED VECTOR CHARACTER
   ============================================================================ */
const NileCrocodileSvg: React.FC<{ isWalking: boolean; isHappy: boolean }> = ({
  isWalking,
  isHappy,
}) => (
  <svg
    width="106"
    height="86"
    viewBox="0 0 112 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md"
  >
    {/* Swishing Scaly Nile Crocodile Tail */}
    <g className={isWalking || isHappy ? 'animate-fennec-tail' : ''}>
      <path
        d="M28 54 C14 54 6 47 4 40 C12 41 19 42 29 44 Z"
        fill="#059669"
        stroke="#133C3B"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Tail Ridges */}
      <path d="M10 42 L13 36 L17 42" fill="#F59E0B" stroke="#133C3B" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 43 L22 37 L26 44" fill="#F59E0B" stroke="#133C3B" strokeWidth="2" strokeLinejoin="round" />
    </g>

    {/* Far Back Leg */}
    <g className={isWalking ? 'animate-fennec-leg-b' : ''}>
      <rect x="33" y="61" width="10" height="19" rx="5" fill="#047857" stroke="#133C3B" strokeWidth="2.6" />
      <ellipse cx="40" cy="79" rx="6.5" ry="3.4" fill="#047857" stroke="#133C3B" strokeWidth="2.4" />
    </g>

    {/* Far Front Leg */}
    <g className={isWalking ? 'animate-fennec-leg-a' : ''}>
      <rect x="59" y="61" width="10" height="19" rx="5" fill="#047857" stroke="#133C3B" strokeWidth="2.6" />
      <ellipse cx="66" cy="79" rx="6.5" ry="3.4" fill="#047857" stroke="#133C3B" strokeWidth="2.4" />
    </g>

    {/* Dorsal Golden-Green Back Ridges */}
    <path d="M31 41 L36 33 L41 40" fill="#F59E0B" stroke="#133C3B" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M41 39 L47 31 L53 38" fill="#F59E0B" stroke="#133C3B" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M52 39 L58 32 L63 40" fill="#F59E0B" stroke="#133C3B" strokeWidth="2.2" strokeLinejoin="round" />

    {/* Plump Friendly Crocodile Body */}
    <ellipse cx="50" cy="54" rx="26" ry="16" fill="#10B981" stroke="#133C3B" strokeWidth="3" />
    {/* Warm Cream Belly Scales */}
    <path
      d="M31 59 C38 68 62 68 70 59 C63 63 38 63 31 59 Z"
      fill="#FEF3C7"
      stroke="#133C3B"
      strokeWidth="2"
    />
    <path d="M42 61 V66 M50 62 V67 M58 61 V66" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />

    {/* Egyptian Nile Royal Collar + Lotus Gold Medallion */}
    <path
      d="M62 42 C67 48 67 59 61 65 L69 65 C75 58 75 47 70 40 Z"
      fill="#0284C7"
      stroke="#133C3B"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <path d="M64 46 L71 45 M65 53 L72 52 M64 60 L70 59" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
    <circle cx="71" cy="57" r="4.2" fill="#F59E0B" stroke="#133C3B" strokeWidth="1.8" />

    {/* Near Back Leg */}
    <g className={isWalking ? 'animate-fennec-leg-a' : ''}>
      <rect x="38" y="63" width="10.5" height="19" rx="5" fill="#10B981" stroke="#133C3B" strokeWidth="2.6" />
      <ellipse cx="45" cy="81" rx="7" ry="3.6" fill="#10B981" stroke="#133C3B" strokeWidth="2.4" />
    </g>

    {/* Near Front Leg */}
    <g className={isWalking ? 'animate-fennec-leg-b' : ''}>
      <rect x="64" y="63" width="10.5" height="19" rx="5" fill="#10B981" stroke="#133C3B" strokeWidth="2.6" />
      <ellipse cx="71" cy="81" rx="7" ry="3.6" fill="#10B981" stroke="#133C3B" strokeWidth="2.4" />
    </g>

    {/* Expressive Smiling Crocodile Head & Snout */}
    <path
      d="M63 36 C63 25 75 23 83 31 L101 34 C107 35 109 41 106 46 C103 51 94 53 84 53 L68 53 C62 53 60 44 63 36 Z"
      fill="#10B981"
      stroke="#133C3B"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Soft Lower Jaw Highlight */}
    <path d="M72 48 C83 51 96 50 104 45" stroke="#FEF3C7" strokeWidth="3.2" strokeLinecap="round" />

    {/* Cute Rounded Friendly Teeth & Happy Smile */}
    <path
      d="M73 45 C82 49 95 48 104 43"
      stroke="#133C3B"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M84 46.5 L86.5 51 L89 46.8" fill="#FFFFFF" stroke="#133C3B" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M94 46 L96.2 50 L98.5 45.2" fill="#FFFFFF" stroke="#133C3B" strokeWidth="1.6" strokeLinejoin="round" />

    {/* Little Snout Nostril */}
    <circle cx="101" cy="37.5" r="1.8" fill="#133C3B" />

    {/* Big Friendly Crocodile Eyes on Top */}
    <circle cx="72" cy="27" r="6.5" fill="#10B981" stroke="#133C3B" strokeWidth="2.6" />
    <circle cx="81" cy="28" r="6.8" fill="#FFFFFF" stroke="#133C3B" strokeWidth="2.6" />
    <g className="animate-fennec-blink">
      <circle cx="82.5" cy="28" r="3.4" fill="#133C3B" />
      <circle cx="83.7" cy="26.7" r="1.2" fill="#FFFFFF" />
    </g>

    {/* Cute Egyptian Pharaoh/Nile Sun Headband on Crocodile */}
    <path
      d="M64 25 C69 17 79 16 85 22"
      stroke="#F59E0B"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <circle cx="75" cy="17" r="4" fill="#F59E0B" stroke="#133C3B" strokeWidth="2" />

    {/* Rosy Cheek */}
    <ellipse cx="76" cy="40" rx="3.4" ry="2" fill="#FB7185" opacity="0.55" />
  </svg>
);

/* ============================================================================
   ILLUSTRATED HORUS THE EGYPTIAN FALCON — LARGER ANIMATED VECTOR CHARACTER
   ============================================================================ */
const HorusFalconSvg: React.FC<{ isWalking: boolean; isHappy: boolean }> = ({
  isWalking,
  isHappy,
}) => (
  <svg
    width="98"
    height="98"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md"
  >
    {/* Feathered Falcon Tail */}
    <g className={isWalking || isHappy ? 'animate-fennec-tail' : ''}>
      <path
        d="M32 64 L11 72 L15 62 L8 59 L27 54 Z"
        fill="#92400E"
        stroke="#133C3B"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M16 64 L28 59" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Far Falcon Leg */}
    <g className={isWalking ? 'animate-fennec-leg-b' : ''}>
      <path d="M44 73 V87" stroke="#D97706" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M40 88 L45 86 L51 88" stroke="#133C3B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Near Falcon Leg */}
    <g className={isWalking ? 'animate-fennec-leg-a' : ''}>
      <path d="M56 73 V89" stroke="#F59E0B" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M51 90 L57 88 L64 90" stroke="#133C3B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Noble Golden-Cream Torso */}
    <ellipse cx="49" cy="58" rx="18" ry="20" fill="#FEF3C7" stroke="#133C3B" strokeWidth="3" />
    {/* Royal Egyptian Linen Kilt (Shendyt) */}
    <path
      d="M34 64 C42 68 56 68 64 64 L62 76 C53 79 45 79 36 76 Z"
      fill="#FFFFFF"
      stroke="#133C3B"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
    <rect x="46.5" y="65" width="5.5" height="13" rx="2" fill="#0D9488" stroke="#133C3B" strokeWidth="1.8" />
    <path d="M35 65 C43 68 55 68 63 65" stroke="#F59E0B" strokeWidth="3.2" strokeLinecap="round" />

    {/* Royal Turquoise & Gold Usekh Collar */}
    <path
      d="M36 44 C44 52 57 52 65 44 L66 51 C57 58 43 58 34 50 Z"
      fill="#0D9488"
      stroke="#133C3B"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M39 48 C46 53 55 53 62 48" stroke="#FCD34D" strokeWidth="2.4" strokeLinecap="round" />

    {/* Fluttering Royal Falcon Wing */}
    <g className={isWalking || isHappy ? 'animate-horus-wing' : ''}>
      <path
        d="M44 48 C30 49 21 57 22 67 C31 69 44 65 49 56 Z"
        fill="#D97706"
        stroke="#133C3B"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M27 61 L40 56 M29 65 L42 60" stroke="#1D4ED8" strokeWidth="2.4" strokeLinecap="round" />
    </g>

    {/* Royal Blue & Gold Nemes Headcloth Behind Head */}
    <path
      d="M36 26 C31 32 30 43 34 48 L43 45 L42 28 Z"
      fill="#1D4ED8"
      stroke="#133C3B"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
    <path d="M33 34 L41 33 M33 40 L41 39" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />

    {/* Falcon Head */}
    <circle cx="52" cy="34" r="14.5" fill="#FDE68A" stroke="#133C3B" strokeWidth="3" />
    {/* Crown Feather Cap */}
    <path
      d="M38 30 C41 20 55 17 64 25 C58 24 46 25 38 30 Z"
      fill="#B45309"
      stroke="#133C3B"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />

    {/* Iconic Egyptian Double Crown (Pschent) + Golden Sun Disk */}
    <path
      d="M44 21 L47 7 C52 5 57 7 58 14 L58 21 Z"
      fill="#DC2626"
      stroke="#133C3B"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <circle cx="52" cy="11" r="5" fill="#F59E0B" stroke="#133C3B" strokeWidth="2.2" />

    {/* Eye of Horus (Wedjat) Inspired Cheek Mark */}
    <path
      d="M52 38 L52 44 M54 38 C57 41 60 42 62 40"
      stroke="#1D4ED8"
      strokeWidth="2.1"
      strokeLinecap="round"
    />

    {/* Expressive Blinking Falcon Eye */}
    <g className="animate-fennec-blink">
      <circle cx="56.5" cy="32.5" r="4.2" fill="#FFFFFF" stroke="#133C3B" strokeWidth="2.2" />
      <circle cx="57.7" cy="32.5" r="2.2" fill="#133C3B" />
      <circle cx="58.4" cy="31.5" r="0.9" fill="#FFFFFF" />
    </g>

    {/* Golden Curved Falcon Beak (Smiling) */}
    <path
      d="M65 31 C73 31 77 35 75 40 C72 39 68 38 64 38 Z"
      fill="#F59E0B"
      stroke="#133C3B"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
    <path d="M65 36.2 C69 37 72 36.6 74 35.4" stroke="#133C3B" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const WalkingCompanion: React.FC<WalkingCompanionProps> = ({
  screen,
  lang,
  progress,
  activeLevel,
  activePracticeSubject,
  currentQuestion,
  roundIndex,
  streak,
  lastAttemptFeedback,
}) => {
  const autoCharacter = getThemeCharacter(screen, activeLevel, activePracticeSubject);
  const [manualOverride, setManualOverride] = useState<GuideCharacter | null>(null);
  const activeCharacter: GuideCharacter = manualOverride ?? autoCharacter;

  const [posX, setPosX] = useState<number>(12);
  const [facing, setFacing] = useState<'right' | 'left'>('right');
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [walkDurationMs, setWalkDurationMs] = useState<number>(2800);
  const [isHopping, setIsHopping] = useState<boolean>(false);
  const [bubbleOpen, setBubbleOpen] = useState<boolean>(true);
  const [customMessage, setCustomMessage] = useState<BilingualText | null>(null);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [sparkleKey, setSparkleKey] = useState<number>(0);

  const posRef = useRef<number>(12);
  const screenRef = useRef<GameScreenState>(screen);
  const hopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  screenRef.current = screen;

  // Reset manual character override whenever the theme context changes so Crocodile/Horus link stays automatic
  useEffect(() => {
    setManualOverride(null);
  }, [autoCharacter]);

  const guideTips = useMemo(
    () =>
      getScreenGuideTips(screen, progress, activeLevel, activePracticeSubject, currentQuestion),
    [screen, progress, activeLevel, activePracticeSubject, currentQuestion]
  );

  const displayedMessage: BilingualText =
    customMessage ?? guideTips[tipIndex % guideTips.length] ?? guideTips[0];

  const triggerHop = useCallback(() => {
    if (hopTimerRef.current) clearTimeout(hopTimerRef.current);
    setIsHopping(true);
    setSparkleKey((k) => k + 1);
    hopTimerRef.current = setTimeout(() => {
      setIsHopping(false);
    }, 560);
  }, []);

  const flashBubble = useCallback((durationMs = 5400) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    setBubbleOpen(true);
    bubbleTimerRef.current = setTimeout(() => {
      setBubbleOpen(false);
    }, durationMs);
  }, []);

  // Keep center bottom choice bar completely unobstructed during PLAYING
  const pickNextTarget = useCallback((currentX: number, activeScreen: GameScreenState): number => {
    const isPlayingStage =
      activeScreen === 'PLAYING' ||
      activeScreen === 'PAUSED' ||
      activeScreen === 'ROUND_SUMMARY';

    if (isPlayingStage) {
      const target = currentX < 9 ? 11 + Math.random() * 3.5 : 4 + Math.random() * 3;
      return Math.round(target * 10) / 10;
    }

    let candidate = 10 + Math.random() * 76;
    if (Math.abs(candidate - currentX) < 18) {
      candidate = currentX > 50 ? 14 + Math.random() * 20 : 62 + Math.random() * 22;
    }
    return Math.round(candidate * 10) / 10;
  }, []);

  const startWalkCycle = useCallback(
    (forcedTarget?: number) => {
      if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      const currentX = posRef.current;
      const nextX =
        forcedTarget !== undefined ? forcedTarget : pickNextTarget(currentX, screenRef.current);
      const distancePct = Math.abs(nextX - currentX);

      const durationMs = Math.max(950, Math.min(6400, Math.round((distancePct / 9.5) * 1000)));

      if (distancePct >= 0.8) {
        setFacing(nextX >= currentX ? 'right' : 'left');
        setWalkDurationMs(durationMs);
        setIsWalking(true);
        posRef.current = nextX;
        setPosX(nextX);
      }

      walkTimerRef.current = setTimeout(() => {
        setIsWalking(false);
        const pauseMs =
          screenRef.current === 'PLAYING'
            ? 3800 + Math.random() * 2600
            : 2400 + Math.random() * 2400;
        idleTimerRef.current = setTimeout(() => {
          startWalkCycle();
        }, pauseMs);
      }, durationMs);
    },
    [pickNextTarget]
  );

  useEffect(() => {
    const bootTimer = setTimeout(() => {
      startWalkCycle();
    }, 650);

    return () => {
      clearTimeout(bootTimer);
      if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (hopTimerRef.current) clearTimeout(hopTimerRef.current);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, [startWalkCycle]);

  // Guide the kid automatically when navigating pages or starting a new level/subject
  useEffect(() => {
    setCustomMessage(null);
    setTipIndex(0);
    triggerHop();
    flashBubble(screen === 'PLAYING' ? 5200 : 6000);

    const isPlayingStage =
      screen === 'PLAYING' || screen === 'PAUSED' || screen === 'ROUND_SUMMARY';

    if (isPlayingStage && posRef.current > 16) {
      startWalkCycle(6);
    } else if (!isPlayingStage && posRef.current < 10) {
      startWalkCycle(22 + Math.random() * 28);
    }
  }, [screen, activeLevel.id, activePracticeSubject, flashBubble, startWalkCycle, triggerHop]);

  // On new round during gameplay, gently refresh strategy guide if bubble was closed or on round 1
  useEffect(() => {
    if (screen !== 'PLAYING') return;
    setCustomMessage(null);
    setTipIndex(0);
    if (roundIndex === 0) {
      flashBubble(5000);
    }
  }, [roundIndex, screen, flashBubble]);

  // React immediately to student answers during gameplay!
  useEffect(() => {
    if (!lastAttemptFeedback || screen !== 'PLAYING') return;

    if (lastAttemptFeedback.isCorrect) {
      triggerHop();
      setCustomMessage(
        streak >= 2
          ? {
              en: `Amazing! ${streak} in a row — you're a Nile math champion!`,
              ar: `مذهل! ${streak} إجابات صحيحة متتالية — أنت بطل الرياضيات!`,
            }
          : {
              en: 'Spot on! Awesome thinking — ready for the next one?',
              ar: 'إجابة رائعة! تفكير ذكي جدًا — مستعد للسؤال التالي؟',
            }
      );
      flashBubble(2400);
    } else if (currentQuestion) {
      triggerHop();
      setCustomMessage({
        en: `Nice try! Tip: ${currentQuestion.data.hint.en}`,
        ar: `محاولة جميلة! تلميح: ${currentQuestion.data.hint.ar}`,
      });
      flashBubble(6500);
    }
  }, [lastAttemptFeedback, screen, streak, currentQuestion, triggerHop, flashBubble]);

  const handleTapCompanion = () => {
    soundEngine.playHop();
    triggerHop();
    setCustomMessage(null);
    if (bubbleOpen) {
      setTipIndex((i) => i + 1);
    }
    flashBubble(6500);
    setTimeout(() => {
      startWalkCycle();
    }, 360);
  };

  const handleSwapCharacter = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playClick();
    const nextChar: GuideCharacter = activeCharacter === 'crocodile' ? 'horus' : 'crocodile';
    setManualOverride(nextChar);
    triggerHop();
    setCustomMessage(
      nextChar === 'crocodile'
        ? {
            en: "Splash! I'm Sobek the Nile Crocodile — let's conquer these numbers!",
            ar: 'أهلاً! أنا سوبك تمساح النيل — هيا نتفوق في الأرقام معًا!',
          }
        : {
            en: "Greetings! I'm Horus the Egyptian Falcon — follow my guidance!",
            ar: 'مرحبًا! أنا حورس الصقر المصري — اتبع إرشاداتي لتتفوق!',
          }
    );
    flashBubble(4800);
  };

  const isCompact = screen === 'PLAYING' || screen === 'PAUSED' || screen === 'ROUND_SUMMARY';
  const meta = CHARACTER_META[activeCharacter];

  // Keep speech bubble inside viewport boundaries depending on posX
  const bubbleAlignClass =
    posX < 26
      ? 'left-0 translate-x-0'
      : posX > 74
      ? 'right-0 translate-x-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div
      dir="ltr"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-28 overflow-visible select-none"
      aria-live="polite"
    >
      {/* Horizontal Walk Track */}
      <div
        className="absolute bottom-1.5 will-change-transform"
        style={{
          left: `${posX}%`,
          transitionProperty: 'left',
          transitionDuration: `${walkDurationMs}ms`,
          transitionTimingFunction: 'linear',
        }}
      >
        <div className="relative flex flex-col items-center -translate-x-1/2">
          {/* Guided Coaching Speech Bubble */}
          <AnimatePresence>
            {bubbleOpen && (
              <motion.div
                key={`${activeCharacter}-${displayedMessage.en}`}
                initial={{ opacity: 0, y: 10, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.92 }}
                transition={{ duration: 0.22 }}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                className={`pointer-events-auto absolute bottom-full mb-2 w-[245px] sm:w-[290px] ${bubbleAlignClass} bg-[#FFFDF7] border-2 border-[#133C3B] rounded-2xl p-3 shadow-xl`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" style={{ color: meta.accentColor }} />
                    <span
                      className="text-[11px] font-extrabold truncate"
                      style={{ color: meta.accentColor }}
                    >
                      {meta.name[lang]} · {meta.role[lang]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleSwapCharacter}
                      aria-label={
                        activeCharacter === 'crocodile'
                          ? 'Switch guide to Horus the Falcon'
                          : 'Switch guide to Sobek the Nile Crocodile'
                      }
                      title={
                        activeCharacter === 'crocodile'
                          ? lang === 'ar'
                            ? 'بدّل إلى حورس'
                            : 'Meet Horus'
                          : lang === 'ar'
                          ? 'بدّل إلى تمساح النيل'
                          : 'Meet Nile Croc'
                      }
                      className="w-6 h-6 rounded-lg bg-[#F1EDE1] hover:bg-[#FEF3C7] text-[#133C3B] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Repeat2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBubbleOpen(false);
                      }}
                      aria-label="Hide guide tip"
                      className="w-6 h-6 rounded-lg bg-[#F1EDE1] hover:bg-[#FEE2E2] text-[#475569] hover:text-[#133C3B] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] font-bold text-[#133C3B] leading-snug">
                  {displayedMessage[lang]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Golden & Turquoise Sparkles on Hop / Answer Cheer */}
          <AnimatePresence>
            {isHopping && (
              <motion.div
                key={`sparkles-${sparkleKey}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0], scale: [0.7, 1.35, 1.5], y: -16 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
                className="pointer-events-none absolute -top-3 flex items-center gap-4 text-[#F59E0B]"
                aria-hidden="true"
              >
                <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 0L7.6 4.4L12 6L7.6 7.6L6 12L4.4 7.6L0 6L4.4 4.4Z" />
                </svg>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="#0D9488">
                  <path d="M6 0L7.6 4.4L12 6L7.6 7.6L6 12L4.4 7.6L0 6L4.4 4.4Z" />
                </svg>
                <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 0L7.6 4.4L12 6L7.6 7.6L6 12L4.4 7.6L0 6L4.4 4.4Z" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bigger Clickable Egyptian Themed Character */}
          <button
            type="button"
            onClick={handleTapCompanion}
            aria-label={
              lang === 'ar'
                ? `اضغط على ${meta.name.ar} للحصول على إرشاد`
                : `Tap ${meta.name.en} for game guidance`
            }
            className={`pointer-events-auto relative cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D97706] rounded-2xl transition-transform duration-200 hover:scale-105 ${
              isCompact ? 'scale-85 sm:scale-95' : 'scale-100 sm:scale-105'
            }`}
          >
            {/* Soft Ground Shadow */}
            <div
              aria-hidden="true"
              className={`absolute bottom-0.5 left-1/2 w-16 h-3 rounded-full bg-[#133C3B]/22 blur-[1.5px] transition-all duration-200 ${
                isHopping ? 'opacity-35' : 'opacity-100'
              }`}
              style={{
                transform: `translateX(-50%) scale(${isHopping ? 0.65 : 1})`,
              }}
            />

            {/* Hop Wrapper */}
            <div
              className="transition-transform duration-200 ease-out"
              style={{
                transform: isHopping ? 'translateY(-18px)' : 'translateY(0px)',
              }}
            >
              {/* Facing Direction Wrapper */}
              <div
                style={{
                  transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
                  transition: 'transform 160ms ease-out',
                }}
              >
                {/* Walking Bob Wrapper */}
                <div className={isWalking ? 'animate-fennec-bob' : ''}>
                  {activeCharacter === 'crocodile' ? (
                    <NileCrocodileSvg isWalking={isWalking} isHappy={isHopping} />
                  ) : (
                    <HorusFalconSvg isWalking={isWalking} isHappy={isHopping} />
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
