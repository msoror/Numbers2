import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lightbulb, Repeat2, X } from 'lucide-react';
import {
  ActiveQuestion,
  BilingualText,
  EquippedCosmetics,
  GameScreenState,
  Language,
  LevelConfig,
  PlayerProgress,
  SubjectId,
} from '../types/game';
import { t, UI_TEXT } from '../data/i18n';
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
  isPaused: boolean;
  mobileGuideOpen: boolean;
  onMobileGuideOpenChange: (open: boolean) => void;
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
            en: 'Start from the Ones on the right! Carry to Tens, then carry to Hundreds if needed.',
            ar: 'ابدأ من الآحاد على اليمين! احمل للعشرات، ثم احمل للمئات عند الحاجة.',
          }
        : {
            en: 'Start from the Ones on the right! Borrow from Tens, or from Hundreds across a zero.',
            ar: 'ابدأ من الآحاد على اليمين! استلف من العشرات، أو من المئات عند وجود صفر.',
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
          en: 'Welcome to Nile Numbers! Tap Continue Learning to jump right in, or visit the Gem Shop for outfits!',
          ar: 'أهلاً بك في أرقام النيل! اضغط واصل التعلم لتبدأ فورًا، أو زُر متجر الجواهر للملابس!',
        },
        {
          en: 'Every time you start a level, brand-new exam numbers are created just for you!',
          ar: 'في كل مرة تبدأ مستوى، تتجدد أرقام الأسئلة تلقائيًا لتتدرب أكثر!',
        },
      ];
    case 'MAP_SELECT':
      return [
        {
          en: 'Pick any of the 12 subjects! Finish levels for a Completed badge, and hit 80%+ to Master them!',
          ar: 'اختر أي موضوع من ١٢ موضوعًا! أكمل المستويات وحقّق دقة ٨٠٪ فأكثر للإتقان!',
        },
        {
          en:
            progress.totalStars > 0
              ? `You already earned ${progress.totalStars} stars and ${progress.totalGems} gems! Tap Practice Topic anytime.`
              : 'Need a quick lesson first? Tap Practice Topic at the bottom of any subject card!',
          ar:
            progress.totalStars > 0
              ? `جمعت ${progress.totalStars} نجمة و ${progress.totalGems} جوهرة! اضغط شرح الموضوع في أي وقت.`
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
          en: 'Complete all 5 levels with 80%+ recent accuracy to earn the golden Mastery celebration!',
          ar: 'أكمل المستويات الخمسة بدقة ٨٠٪ فأكثر مؤخرًا لتفتح الاحتفال الذهبي بالإتقان!',
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
          en: `You have ${progress.totalGems} Nile Gems! Visit the Gem Shop tab to dress us in outfits, accessories & sparkle trails!`,
          ar: `لديك ${progress.totalGems} جوهرة! افتح متجر الجواهر لتلبسنا ملابس وإكسسوارات وبريقًا رائعًا!`,
        },
        {
          en: `You collected ${progress.unlockedStickers.length} of 12 Egyptian stickers! Tap any unlocked sticker to celebrate.`,
          ar: `جمعت ${progress.unlockedStickers.length} من ١٢ ملصقًا مصريًا! اضغط أي ملصق مفتوح للاحتفال.`,
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
   SPARKLE TRAIL EFFECTS BEHIND WALKING CHARACTER
   ============================================================================ */
const WalkingSparkleTrail: React.FC<{
  trailId: string | null;
  facing: 'right' | 'left';
  active: boolean;
  reducedMotion: boolean;
}> = ({ trailId, facing, active, reducedMotion }) => {
  if (!trailId || !active || reducedMotion) return null;

  const isRight = facing === 'right';
  const sideClass = isRight ? '-left-11' : '-right-11';
  const driftX = isRight ? -26 : 26;

  if (trailId === 'trail_golden_sand') {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-6 ${sideClass} flex items-center gap-1.5`}
      >
        {[0, 1, 2].map((i) => (
          <motion.svg
            key={i}
            width={14 - i * 2}
            height={14 - i * 2}
            viewBox="0 0 12 12"
            fill={i === 1 ? '#FCD34D' : '#F59E0B'}
            initial={{ opacity: 0.9, scale: 0.6, x: 0, y: 0 }}
            animate={{
              opacity: [0.95, 0.7, 0],
              scale: [0.65, 1.2, 0.4],
              x: driftX * (0.6 + i * 0.25),
              y: -8 - i * 4,
            }}
            transition={{
              duration: 0.9,
              delay: i * 0.18,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          >
            <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" />
          </motion.svg>
        ))}
      </div>
    );
  }

  if (trailId === 'trail_lotus_petals') {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-7 ${sideClass} flex items-center gap-1.5`}
      >
        {[0, 1, 2].map((i) => (
          <motion.svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            initial={{ opacity: 0.9, scale: 0.7, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: [0.95, 0.75, 0],
              scale: [0.75, 1.15, 0.5],
              x: driftX * (0.55 + i * 0.28),
              y: [-2, -14 - i * 4],
              rotate: isRight ? -40 - i * 25 : 40 + i * 25,
            }}
            transition={{
              duration: 1.05,
              delay: i * 0.22,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          >
            <path
              d="M8 1C12 4 13 10 8 15C3 10 4 4 8 1Z"
              fill={i === 1 ? '#38BDF8' : '#14B8A6'}
              stroke="#133C3B"
              strokeWidth="1.2"
            />
          </motion.svg>
        ))}
      </div>
    );
  }

  if (trailId === 'trail_starlight_comets') {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-8 ${sideClass} flex items-center gap-1.5`}
      >
        {[0, 1, 2].map((i) => (
          <motion.svg
            key={i}
            width={16 - i * 2}
            height={16 - i * 2}
            viewBox="0 0 16 16"
            initial={{ opacity: 0.95, scale: 0.65, x: 0, y: 0 }}
            animate={{
              opacity: [1, 0.85, 0],
              scale: [0.7, 1.3, 0.45],
              x: driftX * (0.65 + i * 0.3),
              y: -10 - i * 5,
            }}
            transition={{
              duration: 0.85,
              delay: i * 0.16,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          >
            <path
              d="M8 0.5L9.9 5.6L15.2 6.2L11 9.7L12.3 15L8 12.1L3.7 15L5 9.7L0.8 6.2L6.1 5.6Z"
              fill={i === 1 ? '#FDE047' : '#6366F1'}
              stroke="#133C3B"
              strokeWidth="1"
            />
          </motion.svg>
        ))}
      </div>
    );
  }

  return null;
};

/* ============================================================================
   ILLUSTRATED NILE CROCODILE ("SOBEK") — BIGGER CHARACTER + COSMETICS
   ============================================================================ */
export const NileCrocodileSvg: React.FC<{
  isWalking: boolean;
  isHappy: boolean;
  cosmetics: EquippedCosmetics;
  size?: number;
}> = ({ isWalking, isHappy, cosmetics, size = 142 }) => {
  const height = Math.round((size * 102) / 118);
  return (
    <svg
      width={size}
      height={height}
      viewBox="-2 -10 118 102"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md overflow-visible"
    >
      {/* Royal Pharaoh Cape (behind body) */}
      {cosmetics.outfitId === 'outfit_pharaoh_cape' && (
        <g>
          <path
            d="M66 41 C52 38 30 39 14 48 C18 57 34 62 56 59 L68 53 Z"
            fill="#B91C1C"
            stroke="#133C3B"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path
            d="M19 49 C34 55 49 56 64 51"
            stroke="#FCD34D"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Swishing Scaly Nile Crocodile Tail */}
      <g className={isWalking || isHappy ? 'animate-fennec-tail' : ''}>
        <path
          d="M28 54 C14 54 6 47 4 40 C12 41 19 42 29 44 Z"
          fill="#059669"
          stroke="#133C3B"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
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

      {/* Equipped Body Outfits on Sobek */}
      {cosmetics.outfitId === 'outfit_explorer_vest' && (
        <g>
          <path
            d="M36 41 C45 38 58 39 66 43 L64 62 C55 64 44 64 36 60 Z"
            fill="#D97706"
            stroke="#133C3B"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <rect x="43" y="48" width="11" height="8" rx="2" fill="#FEF3C7" stroke="#133C3B" strokeWidth="1.8" />
          <circle cx="59" cy="48" r="1.8" fill="#FDE047" />
          <circle cx="59" cy="55" r="1.8" fill="#FDE047" />
        </g>
      )}

      {cosmetics.outfitId === 'outfit_starlight_robe' && (
        <g>
          <path
            d="M31 44 C44 37 59 38 68 43 L65 62 C52 66 39 65 29 59 Z"
            fill="#1E3A8A"
            stroke="#133C3B"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path d="M42 48L43.3 51L46.3 52L43.3 53L42 56L40.7 53L37.7 52L40.7 51Z" fill="#FDE047" />
          <path d="M55 44L56 46.5L58.5 47.5L56 48.5L55 51L54 48.5L51.5 47.5L54 46.5Z" fill="#38BDF8" />
          <circle cx="51" cy="57" r="1.8" fill="#FDE047" />
        </g>
      )}

      {/* Egyptian Nile Royal Collar + Lotus Gold Medallion */}
      <path
        d="M62 42 C67 48 67 59 61 65 L69 65 C75 58 75 47 70 40 Z"
        fill={cosmetics.outfitId === 'outfit_pharaoh_cape' ? '#B91C1C' : '#0284C7'}
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

      {/* Big Friendly Crocodile Eyes */}
      <circle cx="72" cy="27" r="6.5" fill="#10B981" stroke="#133C3B" strokeWidth="2.6" />
      <circle cx="81" cy="28" r="6.8" fill="#FFFFFF" stroke="#133C3B" strokeWidth="2.6" />
      <g className="animate-fennec-blink">
        <circle cx="82.5" cy="28" r="3.4" fill="#133C3B" />
        <circle cx="83.7" cy="26.7" r="1.2" fill="#FFFFFF" />
      </g>

      {/* Default Sun Headband (hidden when Golden Crown is worn) */}
      {cosmetics.accessoryId !== 'acc_golden_crown' && (
        <g>
          <path d="M64 25 C69 17 79 16 85 22" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="75" cy="17" r="4" fill="#F59E0B" stroke="#133C3B" strokeWidth="2" />
        </g>
      )}

      {/* Accessory: Explorer Goggles */}
      {cosmetics.accessoryId === 'acc_explorer_goggles' && (
        <g>
          <path d="M63 23 L87 23" stroke="#92400E" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="72" cy="22" r="5.2" fill="#38BDF8" fillOpacity="0.72" stroke="#B45309" strokeWidth="2.6" />
          <circle cx="83" cy="23" r="5.4" fill="#38BDF8" fillOpacity="0.72" stroke="#B45309" strokeWidth="2.6" />
          <path d="M70 20 L73 19 M81 21 L84 20" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}

      {/* Accessory: Golden Sun Crown */}
      {cosmetics.accessoryId === 'acc_golden_crown' && (
        <g>
          <path
            d="M64 21 L66 7 L73 14 L78 4 L83 14 L89 8 L88 21 Z"
            fill="#F59E0B"
            stroke="#133C3B"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="78" cy="15" r="3" fill="#0EA5E9" stroke="#133C3B" strokeWidth="1.5" />
        </g>
      )}

      {/* Accessory: Turquoise Ankh Charm */}
      {cosmetics.accessoryId === 'acc_turquoise_ankh' && (
        <g transform="translate(93, 14)">
          <circle cx="8" cy="6" r="5" fill="none" stroke="#0D9488" strokeWidth="3.2" />
          <path d="M8 11 V22 M3 14.5 H13" stroke="#0D9488" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="8" cy="6" r="2" fill="#FDE047" />
        </g>
      )}

      {/* Rosy Cheek */}
      <ellipse cx="76" cy="40" rx="3.4" ry="2" fill="#FB7185" opacity="0.55" />
    </svg>
  );
};

/* ============================================================================
   ILLUSTRATED HORUS THE EGYPTIAN FALCON — BIGGER CHARACTER + COSMETICS
   ============================================================================ */
export const HorusFalconSvg: React.FC<{
  isWalking: boolean;
  isHappy: boolean;
  cosmetics: EquippedCosmetics;
  size?: number;
}> = ({ isWalking, isHappy, cosmetics, size = 132 }) => {
  const height = Math.round((size * 110) / 108);
  return (
    <svg
      width={size}
      height={height}
      viewBox="-4 -10 108 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md overflow-visible"
    >
      {/* Outfit: Royal Pharaoh Cape (behind Horus) */}
      {cosmetics.outfitId === 'outfit_pharaoh_cape' && (
        <g>
          <path
            d="M40 45 C26 48 13 58 7 75 C19 79 34 78 46 72 Z"
            fill="#B91C1C"
            stroke="#133C3B"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path d="M13 72 C24 74 34 72 44 67" stroke="#FCD34D" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}

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
        fill={cosmetics.outfitId === 'outfit_starlight_robe' ? '#1E3A8A' : '#FFFFFF'}
        stroke="#133C3B"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <rect x="46.5" y="65" width="5.5" height="13" rx="2" fill="#0D9488" stroke="#133C3B" strokeWidth="1.8" />
      <path d="M35 65 C43 68 55 68 63 65" stroke="#F59E0B" strokeWidth="3.2" strokeLinecap="round" />

      {/* Equipped Torso Outfits on Horus */}
      {cosmetics.outfitId === 'outfit_explorer_vest' && (
        <g>
          <path
            d="M35 48 C43 52 55 52 63 48 L64 65 C55 68 43 68 34 65 Z"
            fill="#D97706"
            stroke="#133C3B"
            strokeWidth="2.3"
          />
          <rect x="44" y="54" width="10" height="7" rx="2" fill="#FEF3C7" stroke="#133C3B" strokeWidth="1.6" />
        </g>
      )}

      {cosmetics.outfitId === 'outfit_starlight_robe' && (
        <g>
          <path
            d="M34 48 C43 52 55 52 64 48 L65 65 C55 69 43 69 33 65 Z"
            fill="#1E3A8A"
            stroke="#133C3B"
            strokeWidth="2.3"
          />
          <path d="M51 54L52.2 56.8L55 57.8L52.2 58.8L51 61.6L49.8 58.8L47 57.8L49.8 56.8Z" fill="#FDE047" />
          <circle cx="42" cy="59" r="1.6" fill="#38BDF8" />
          <circle cx="58" cy="56" r="1.6" fill="#FDE047" />
        </g>
      )}

      {/* Royal Turquoise & Gold Usekh Collar */}
      <path
        d="M36 44 C44 52 57 52 65 44 L66 51 C57 58 43 58 34 50 Z"
        fill={cosmetics.outfitId === 'outfit_pharaoh_cape' ? '#B91C1C' : '#0D9488'}
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
      <path
        d="M38 30 C41 20 55 17 64 25 C58 24 46 25 38 30 Z"
        fill="#B45309"
        stroke="#133C3B"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Crown: Default Double Crown OR Golden Sun Crown Accessory */}
      {cosmetics.accessoryId === 'acc_golden_crown' ? (
        <g>
          <path
            d="M39 21 L42 5 L49 13 L54 2 L59 13 L66 6 L64 21 Z"
            fill="#F59E0B"
            stroke="#133C3B"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="54" cy="14" r="3.2" fill="#0EA5E9" stroke="#133C3B" strokeWidth="1.6" />
        </g>
      ) : (
        <g>
          <path
            d="M44 21 L47 7 C52 5 57 7 58 14 L58 21 Z"
            fill="#DC2626"
            stroke="#133C3B"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="52" cy="11" r="5" fill="#F59E0B" stroke="#133C3B" strokeWidth="2.2" />
        </g>
      )}

      {/* Accessory: Explorer Goggles */}
      {cosmetics.accessoryId === 'acc_explorer_goggles' && (
        <g>
          <path d="M40 24 L65 25" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          <circle cx="49" cy="24" r="4.8" fill="#38BDF8" fillOpacity="0.72" stroke="#B45309" strokeWidth="2.5" />
          <circle cx="59" cy="25" r="4.8" fill="#38BDF8" fillOpacity="0.72" stroke="#B45309" strokeWidth="2.5" />
        </g>
      )}

      {/* Eye of Horus Cheek Mark */}
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

      {/* Golden Curved Falcon Beak */}
      <path
        d="M65 31 C73 31 77 35 75 40 C72 39 68 38 64 38 Z"
        fill="#F59E0B"
        stroke="#133C3B"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M65 36.2 C69 37 72 36.6 74 35.4" stroke="#133C3B" strokeWidth="1.8" strokeLinecap="round" />

      {/* Accessory: Turquoise Ankh Charm */}
      {cosmetics.accessoryId === 'acc_turquoise_ankh' && (
        <g transform="translate(76, 46)">
          <circle cx="8" cy="6" r="5" fill="none" stroke="#0D9488" strokeWidth="3.2" />
          <path d="M8 11 V22 M3 14.5 H13" stroke="#0D9488" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="8" cy="6" r="2" fill="#FDE047" />
        </g>
      )}
    </svg>
  );
};

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
  isPaused,
  mobileGuideOpen,
  onMobileGuideOpenChange,
}) => {
  const autoCharacter = getThemeCharacter(screen, activeLevel, activePracticeSubject);
  const [manualOverride, setManualOverride] = useState<GuideCharacter | null>(null);
  const activeCharacter: GuideCharacter = manualOverride ?? autoCharacter;

  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [isWideDesktop, setIsWideDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1200 : true
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqMobile = window.matchMedia('(max-width: 767px)');
    const mqWide = window.matchMedia('(min-width: 1200px)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => {
      setIsMobileViewport(mqMobile.matches);
      setIsWideDesktop(mqWide.matches);
      setPrefersReducedMotion(mqMotion.matches);
    };
    sync();

    mqMobile.addEventListener('change', sync);
    mqWide.addEventListener('change', sync);
    mqMotion.addEventListener('change', sync);
    return () => {
      mqMobile.removeEventListener('change', sync);
      mqWide.removeEventListener('change', sync);
      mqMotion.removeEventListener('change', sync);
    };
  }, []);

  const [posX, setPosX] = useState<number>(14);
  const [facing, setFacing] = useState<'right' | 'left'>('right');
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [walkDurationMs, setWalkDurationMs] = useState<number>(2800);
  const [isHopping, setIsHopping] = useState<boolean>(false);
  const [desktopBubbleOpen, setDesktopBubbleOpen] = useState<boolean>(false);
  const [customMessage, setCustomMessage] = useState<BilingualText | null>(null);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [sparkleKey, setSparkleKey] = useState<number>(0);

  const posRef = useRef<number>(14);
  const screenRef = useRef<GameScreenState>(screen);
  const pausedRef = useRef<boolean>(isPaused);
  const reducedMotionRef = useRef<boolean>(prefersReducedMotion);
  const hopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  screenRef.current = screen;
  pausedRef.current = isPaused;
  reducedMotionRef.current = prefersReducedMotion;

  // Reset manual character override whenever the theme context changes
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
    if (reducedMotionRef.current || pausedRef.current) return;
    if (hopTimerRef.current) clearTimeout(hopTimerRef.current);
    setIsHopping(true);
    setSparkleKey((k) => k + 1);
    hopTimerRef.current = setTimeout(() => {
      setIsHopping(false);
    }, 560);
  }, []);

  const flashDesktopBubble = useCallback(
    (durationMs = 5000) => {
      if (isMobileViewport) return;
      // On narrower tablets during PLAYING, keep bubble manual so it never overlaps answer buttons
      if (screenRef.current === 'PLAYING' && !isWideDesktop) return;
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      setDesktopBubbleOpen(true);
      bubbleTimerRef.current = setTimeout(() => {
        setDesktopBubbleOpen(false);
      }, durationMs);
    },
    [isMobileViewport, isWideDesktop]
  );

  // Patrol corridors designed so the bigger character + bubble NEVER cover answers or Title chart
  const pickNextTarget = useCallback((currentX: number, activeScreen: GameScreenState): number => {
    const isPlayingStage =
      activeScreen === 'PLAYING' ||
      activeScreen === 'PAUSED' ||
      activeScreen === 'ROUND_SUMMARY';

    if (isPlayingStage) {
      // Stay cleanly in the left gutter outside centered gameplay card
      const target = currentX < 8 ? 10 + Math.random() * 2.5 : 5 + Math.random() * 2.5;
      return Math.round(target * 10) / 10;
    }

    if (activeScreen === 'TITLE_MENU') {
      // Patrol the left-to-center promenade away from the right-side Star Collection chart
      const target = currentX < 24 ? 30 + Math.random() * 14 : 11 + Math.random() * 12;
      return Math.round(target * 10) / 10;
    }

    let candidate = 12 + Math.random() * 72;
    if (Math.abs(candidate - currentX) < 18) {
      candidate = currentX > 50 ? 15 + Math.random() * 20 : 62 + Math.random() * 20;
    }
    return Math.round(candidate * 10) / 10;
  }, []);

  const clearWalkTimers = useCallback(() => {
    if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    walkTimerRef.current = null;
    idleTimerRef.current = null;
  }, []);

  const startWalkCycle = useCallback(
    (forcedTarget?: number) => {
      clearWalkTimers();
      if (pausedRef.current || reducedMotionRef.current) {
        setIsWalking(false);
        return;
      }

      const currentX = posRef.current;
      const nextX =
        forcedTarget !== undefined ? forcedTarget : pickNextTarget(currentX, screenRef.current);
      const distancePct = Math.abs(nextX - currentX);

      const durationMs = Math.max(1000, Math.min(6200, Math.round((distancePct / 9.2) * 1000)));

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
            : 2400 + Math.random() * 2200;
        idleTimerRef.current = setTimeout(() => {
          startWalkCycle();
        }, pauseMs);
      }, durationMs);
    },
    [clearWalkTimers, pickNextTarget]
  );

  // Stop walking immediately on pause or reduced motion, resume cleanly when unpaused
  useEffect(() => {
    if (isPaused || prefersReducedMotion) {
      clearWalkTimers();
      setIsWalking(false);
      setIsHopping(false);
      if (isPaused) {
        onMobileGuideOpenChange(false);
      }
      return;
    }

    const bootTimer = setTimeout(() => {
      startWalkCycle();
    }, 650);

    return () => {
      clearTimeout(bootTimer);
      clearWalkTimers();
      if (hopTimerRef.current) clearTimeout(hopTimerRef.current);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, [isPaused, prefersReducedMotion, clearWalkTimers, startWalkCycle, onMobileGuideOpenChange]);

  // Refresh coaching tip when changing screen/level/subject
  useEffect(() => {
    setCustomMessage(null);
    setTipIndex(0);
    onMobileGuideOpenChange(false);

    if (!isPaused) {
      triggerHop();
      if (!isMobileViewport && screen !== 'PAUSED') {
        flashDesktopBubble(screen === 'PLAYING' ? 4600 : 5400);
      }
    }

    const isPlayingStage =
      screen === 'PLAYING' || screen === 'PAUSED' || screen === 'ROUND_SUMMARY';

    if (isPlayingStage && posRef.current > 14) {
      startWalkCycle(7);
    } else if (screen === 'TITLE_MENU' && posRef.current > 46) {
      startWalkCycle(22);
    } else if (!isPlayingStage && posRef.current < 10) {
      startWalkCycle(22 + Math.random() * 20);
    }
  }, [
    screen,
    activeLevel.id,
    activePracticeSubject,
    isPaused,
    isMobileViewport,
    flashDesktopBubble,
    startWalkCycle,
    triggerHop,
    onMobileGuideOpenChange,
  ]);

  // Refresh tip on new round
  useEffect(() => {
    if (screen !== 'PLAYING') return;
    setCustomMessage(null);
    setTipIndex(0);
    if (roundIndex === 0 && !isMobileViewport) {
      flashDesktopBubble(4600);
    }
  }, [roundIndex, screen, isMobileViewport, flashDesktopBubble]);

  // React to student answers during gameplay
  useEffect(() => {
    if (!lastAttemptFeedback || screen !== 'PLAYING' || isPaused) return;

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
      flashDesktopBubble(2300);
    } else if (currentQuestion) {
      triggerHop();
      setCustomMessage({
        en: `Nice try! Tip: ${currentQuestion.data.hint.en}`,
        ar: `محاولة جميلة! تلميح: ${currentQuestion.data.hint.ar}`,
      });
      flashDesktopBubble(6000);
    }
  }, [lastAttemptFeedback, screen, isPaused, streak, currentQuestion, triggerHop, flashDesktopBubble]);

  const handleTapCompanion = () => {
    if (isPaused) return;
    soundEngine.playHop();
    triggerHop();
    setCustomMessage(null);

    if (isMobileViewport) {
      if (mobileGuideOpen) {
        setTipIndex((i) => i + 1);
      } else {
        onMobileGuideOpenChange(true);
      }
      return;
    }

    if (desktopBubbleOpen) {
      setTipIndex((i) => i + 1);
    }
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    setDesktopBubbleOpen(true);
    bubbleTimerRef.current = setTimeout(() => {
      setDesktopBubbleOpen(false);
    }, 6500);

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
    if (!isMobileViewport) {
      flashDesktopBubble(4800);
    }
  };

  // While Pause or Round Summary modal is open, keep the companion visually quiet & non-interactive behind the modal
  if (screen === 'PAUSED' || screen === 'ROUND_SUMMARY') {
    return null;
  }

  const meta = CHARACTER_META[activeCharacter];
  const cosmetics = progress.equippedCosmetics;
  const isPlaying = screen === 'PLAYING';

  // Hide the bottom walking track during PLAYING on narrow phones (< 768px) so answers are 100% unobstructed.
  // Kids tap the top-bar Guide button to open the top-anchored coaching sheet featuring the big character portrait!
  const showBottomWalker = !(isMobileViewport && isPlaying);

  const bubbleAlignClass =
    posX < 28
      ? 'left-0 translate-x-0'
      : posX > 72
      ? 'right-0 translate-x-0'
      : 'left-1/2 -translate-x-1/2';

  const crocSize = isMobileViewport ? 116 : isPlaying ? 128 : 146;
  const horusSize = isMobileViewport ? 108 : isPlaying ? 120 : 136;

  return (
    <>
      {/* Mobile (< md) Top-Docked Coaching Sheet — NEVER covers bottom answers or Title progress chart */}
      <AnimatePresence>
        {isMobileViewport && mobileGuideOpen && (
          <motion.div
            key="mobile-guide-sheet"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className="fixed top-15 inset-x-3 z-40 bg-[#FFFDF7] border-2 border-[#133C3B] rounded-2xl p-3 shadow-xl flex items-center gap-3"
            role="region"
            aria-label={t(UI_TEXT.guideButton, lang)}
          >
            <div className="shrink-0 -my-1">
              {activeCharacter === 'crocodile' ? (
                <NileCrocodileSvg isWalking={false} isHappy={true} cosmetics={cosmetics} size={74} />
              ) : (
                <HorusFalconSvg isWalking={false} isHappy={true} cosmetics={cosmetics} size={68} />
              )}
            </div>

            <div className="flex-1 min-w-0">
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
                    className="w-7 h-7 rounded-lg bg-[#F1EDE1] hover:bg-[#FEF3C7] text-[#133C3B] flex items-center justify-center cursor-pointer"
                  >
                    <Repeat2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMobileGuideOpenChange(false)}
                    aria-label="Hide guide tip"
                    className="w-7 h-7 rounded-lg bg-[#F1EDE1] hover:bg-[#FEE2E2] text-[#475569] hover:text-[#133C3B] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs font-bold text-[#133C3B] leading-snug">
                {displayedMessage[lang]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Walking Promenade — Big Theme-Linked Character with Equipped Outfits, Accessories & Sparkle Trails */}
      {showBottomWalker && (
        <div
          dir="ltr"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-36 overflow-visible select-none"
          aria-live="polite"
        >
          <div
            className="absolute bottom-1 will-change-transform"
            style={{
              left: `${posX}%`,
              transitionProperty: prefersReducedMotion ? 'none' : 'left',
              transitionDuration: `${walkDurationMs}ms`,
              transitionTimingFunction: 'linear',
            }}
          >
            <div className="relative flex flex-col items-center -translate-x-1/2">
              {/* Desktop Floating Speech Bubble (never shown on < md to prevent overlapping answers/charts) */}
              <AnimatePresence>
                {!isMobileViewport && desktopBubbleOpen && (
                  <motion.div
                    key={`${activeCharacter}-${displayedMessage.en}`}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.94 }}
                    transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    className={`pointer-events-auto absolute bottom-full mb-2 ${
                      isPlaying ? 'w-[235px]' : 'w-[275px]'
                    } ${bubbleAlignClass} bg-[#FFFDF7] border-2 border-[#133C3B] rounded-2xl p-3 shadow-xl`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Lightbulb
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: meta.accentColor }}
                        />
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
                            setDesktopBubbleOpen(false);
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
                {isHopping && !prefersReducedMotion && (
                  <motion.div
                    key={`sparkles-${sparkleKey}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.7, 1.35, 1.5], y: -18 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55 }}
                    className="pointer-events-none absolute -top-3 flex items-center gap-4 text-[#F59E0B]"
                    aria-hidden="true"
                  >
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 0L7.6 4.4L12 6L7.6 7.6L6 12L4.4 7.6L0 6L4.4 4.4Z" />
                    </svg>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="#0D9488">
                      <path d="M6 0L7.6 4.4L12 6L7.6 7.6L6 12L4.4 7.6L0 6L4.4 4.4Z" />
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 0L7.6 4.4L12 6L7.6 7.6L6 12L4.4 7.6L0 6L4.4 4.4Z" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Equipped Walking Sparkle Trail */}
              <WalkingSparkleTrail
                trailId={cosmetics.trailId}
                facing={facing}
                active={isWalking || isHopping}
                reducedMotion={prefersReducedMotion}
              />

              {/* Bigger Clickable Egyptian Themed Character */}
              <button
                type="button"
                onClick={handleTapCompanion}
                aria-label={
                  lang === 'ar'
                    ? `اضغط على ${meta.name.ar} للحصول على إرشاد`
                    : `Tap ${meta.name.en} for game guidance`
                }
                className="pointer-events-auto relative cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D97706] rounded-2xl transition-transform duration-200 hover:scale-105"
              >
                {/* Soft Ground Shadow */}
                <div
                  aria-hidden="true"
                  className={`absolute bottom-1 left-1/2 w-22 h-3.5 rounded-full bg-[#133C3B]/22 blur-[1.5px] transition-all duration-200 ${
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
                    transform:
                      isHopping && !prefersReducedMotion ? 'translateY(-18px)' : 'translateY(0px)',
                  }}
                >
                  {/* Facing Direction Wrapper */}
                  <div
                    style={{
                      transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
                      transition: prefersReducedMotion ? 'none' : 'transform 160ms ease-out',
                    }}
                  >
                    {/* Walking Bob Wrapper */}
                    <div className={isWalking && !prefersReducedMotion ? 'animate-fennec-bob' : ''}>
                      {activeCharacter === 'crocodile' ? (
                        <NileCrocodileSvg
                          isWalking={isWalking && !prefersReducedMotion}
                          isHappy={isHopping}
                          cosmetics={cosmetics}
                          size={crocSize}
                        />
                      ) : (
                        <HorusFalconSvg
                          isWalking={isWalking && !prefersReducedMotion}
                          isHappy={isHopping}
                          cosmetics={cosmetics}
                          size={horusSize}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
