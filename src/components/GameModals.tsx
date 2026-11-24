import React, { useRef } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Languages,
  Map,
  Music,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { EGYPT_STICKERS } from '../data/egyptLevels';
import { t, UI_TEXT } from '../data/i18n';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { Language, LevelConfig, RoundResult } from '../types/game';
import { EgyptStickerSvg } from './EgyptSvgs';

export { useModalFocusTrap };

interface PauseModalProps {
  level: LevelConfig;
  lang: Language;
  muted: boolean;
  musicEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExitToMap: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleLang: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  lang,
  muted,
  musicEnabled,
  onResume,
  onRestart,
  onExitToMap,
  onToggleMute,
  onToggleMusic,
  onToggleLang,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(dialogRef, true, onResume);

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[1.5px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-sm bg-[#FFFDF7] border-2 border-[#133C3B] rounded-3xl p-6 shadow-2xl animate-pop-in flex flex-col items-center text-center gap-5 outline-none"
      >
        <div>
          <div className="text-xs font-bold text-[#64748B] tabular-nums">
            {t(level.subjectName, lang)} · {t(UI_TEXT.levelShort, lang)}
            {level.levelNumber} ({t(level.difficultyLabel, lang)})
          </div>
          <h2 id="pause-title" className="font-display text-3xl font-bold text-[#133C3B] mt-1">
            {t(UI_TEXT.gamePaused, lang)}
          </h2>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full h-13 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] border-2 border-b-4 border-[#14532D] text-white font-display text-xl font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133C3B]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t(UI_TEXT.resume, lang)}</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full h-12 rounded-2xl bg-[#FEF3C7] hover:bg-[#FDE68A] border-2 border-b-4 border-[#133C3B] text-[#133C3B] font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133C3B]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t(UI_TEXT.restartLevel, lang)}</span>
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            className="w-full h-12 rounded-2xl bg-white hover:bg-[#E0F2FE] border-2 border-[#133C3B] text-[#133C3B] font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133C3B]"
          >
            <Languages className="w-4 h-4 text-[#0D9488]" />
            <span>{lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMusic}
            aria-pressed={musicEnabled && !muted}
            className={`w-full h-12 rounded-2xl border-2 border-[#133C3B] font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133C3B] ${
              musicEnabled && !muted
                ? 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E]'
                : 'bg-white hover:bg-[#F1F5F9] text-[#133C3B]'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>
              {musicEnabled && !muted ? t(UI_TEXT.lofiMusicOn, lang) : t(UI_TEXT.lofiMusicOff, lang)}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="w-full h-12 rounded-2xl bg-white hover:bg-[#F1F5F9] border-2 border-[#133C3B] text-[#133C3B] font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133C3B]"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{muted ? t(UI_TEXT.unmuteSound, lang) : t(UI_TEXT.muteSound, lang)}</span>
          </button>

          <button
            type="button"
            onClick={onExitToMap}
            className="w-full h-12 rounded-2xl bg-white hover:bg-[#F1F5F9] border-2 border-[#133C3B] text-[#133C3B] font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133C3B]"
          >
            <Map className="w-4 h-4" />
            <span>{t(UI_TEXT.worldMap, lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface RoundSummaryModalProps {
  level: LevelConfig;
  lang: Language;
  result: RoundResult;
  hasNextLevel: boolean;
  isTargetedRound?: boolean;
  levelRecentAccuracyPct?: number | null;
  isLevelMasteredNow?: boolean;
  repeatedMistakeSkill?: string | null;
  onStartTargetedPractice?: () => void;
  onNextLevel: () => void;
  onPlayAgain: () => void;
  onExitToMap: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  level,
  lang,
  result,
  hasNextLevel,
  isTargetedRound = false,
  levelRecentAccuracyPct = null,
  isLevelMasteredNow = false,
  repeatedMistakeSkill = null,
  onStartTargetedPractice,
  onNextLevel,
  onPlayAgain,
  onExitToMap,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(dialogRef, true);

  const unlockedSticker = result.newlyUnlockedSticker
    ? EGYPT_STICKERS[result.newlyUnlockedSticker]
    : null;

  const roundAccuracyPct = Math.round(
    (result.correctFirstTry / Math.max(1, result.totalRounds)) * 100
  );

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[1.5px] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-md bg-[#FFFDF7] border-2 border-[#133C3B] rounded-3xl p-5 sm:p-6 shadow-2xl animate-pop-in flex flex-col items-center text-center gap-4 outline-none my-auto"
      >
        <div>
          <div className="text-xs font-bold text-[#64748B] tabular-nums">
            {isTargetedRound
              ? `${t(UI_TEXT.targetedRoundTitle, lang)} · ${t(level.subjectName, lang)}`
              : `${t(level.subjectName, lang)} · ${t(UI_TEXT.levelShort, lang)}${level.levelNumber} · ${t(level.title, lang)}`}
          </div>
          <h2 id="victory-title" className="font-display text-3xl font-bold text-[#133C3B] mt-1">
            {t(UI_TEXT.levelComplete, lang)}
          </h2>
        </div>

        <div
          className="flex items-center justify-center gap-3"
          aria-label={
            lang === 'ar'
              ? `حصلت على ${result.starsEarned} من 3 نجوم`
              : `Earned ${result.starsEarned} of 3 stars`
          }
        >
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              className={`w-11 h-11 sm:w-12 sm:h-12 transition-transform duration-200 ${
                n <= result.starsEarned
                  ? 'text-[#F59E0B] fill-[#F59E0B] scale-105'
                  : 'text-[#CBD5E1] fill-[#E2E8F0]'
              }`}
            />
          ))}
        </div>

        {/* First-Try Score + Gems + Completed vs Mastered inline status */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-sm font-bold text-[#133C3B] tabular-nums">
            {t(UI_TEXT.firstTryLabel, lang)} {result.correctFirstTry}/{result.totalRounds} (
            {roundAccuracyPct}%) · +{result.gemsEarned} {t(UI_TEXT.nileGems, lang)}
          </div>

          {!isTargetedRound && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold tabular-nums">
              {isLevelMasteredNow ? (
                <span className="inline-flex items-center gap-1 text-[#B45309]">
                  <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>{t(UI_TEXT.masteredLabel, lang)}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#0F766E]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t(UI_TEXT.completedLabel, lang)}</span>
                </span>
              )}
              {levelRecentAccuracyPct !== null && (
                <>
                  <span className="text-[#94A3B8]" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[#475569]">
                    {t(UI_TEXT.accuracyShort, lang)} {levelRecentAccuracyPct}%
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Repeated Mistake Targeted Practice Offer */}
        {repeatedMistakeSkill && onStartTargetedPractice && !isTargetedRound && (
          <div className="w-full bg-[#FFF7ED] border-2 border-[#EA580C]/60 rounded-2xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-start gap-2 text-xs sm:text-sm font-bold text-[#9A3412] text-start">
              <Target className="w-4 h-4 shrink-0 mt-0.5 text-[#EA580C]" />
              <span>{t(UI_TEXT.targetedPracticeBanner, lang)}</span>
            </div>
            <button
              type="button"
              onClick={onStartTargetedPractice}
              className="w-full h-11 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] border-2 border-b-4 border-[#7C2D12] text-white font-display text-base font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133C3B]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t(UI_TEXT.targetedPracticeBtn, lang)}</span>
            </button>
          </div>
        )}

        {unlockedSticker ? (
          <div className="w-full bg-[#FEFCE8] border-2 border-[#F59E0B] rounded-2xl p-3.5 flex items-center gap-4">
            <EgyptStickerSvg stickerId={unlockedSticker.id} unlocked size={72} />
            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              <div className="text-xs font-bold text-[#B45309]">{t(UI_TEXT.newSticker, lang)}</div>
              <div className="font-display text-lg font-bold text-[#133C3B]">
                {t(unlockedSticker.name, lang)}
              </div>
              <div className="text-xs font-semibold text-[#475569]">
                {t(UI_TEXT.addedToBook, lang)}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#475569]">
            {!isLevelMasteredNow && !isTargetedRound
              ? t(UI_TEXT.masteryRuleNote, lang)
              : t(UI_TEXT.greatPractice, lang)}
          </div>
        )}

        <div className="w-full flex flex-col gap-2.5">
          {hasNextLevel && (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full h-12 rounded-2xl bg-[#D97706] hover:bg-[#B45309] border-2 border-b-4 border-[#133C3B] text-white font-display text-xl font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133C3B]"
            >
              <span>{t(UI_TEXT.nextLevel, lang)}</span>
              <ArrowRight className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onPlayAgain}
              className="h-11 rounded-2xl bg-[#FEF3C7] hover:bg-[#FDE68A] border-2 border-b-4 border-[#133C3B] text-[#133C3B] font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133C3B]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t(UI_TEXT.playAgain, lang)}</span>
            </button>

            <button
              type="button"
              onClick={onExitToMap}
              className="h-11 rounded-2xl bg-white hover:bg-[#F1F5F9] border-2 border-b-4 border-[#133C3B] text-[#133C3B] font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133C3B]"
            >
              <Map className="w-4 h-4" />
              <span>{t(UI_TEXT.worldMap, lang)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
