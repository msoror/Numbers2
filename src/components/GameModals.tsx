import React from 'react';
import { ArrowRight, Languages, Map, Music, Play, RotateCcw, Star, Volume2, VolumeX } from 'lucide-react';
import { EGYPT_STICKERS } from '../data/egyptLevels';
import { t, UI_TEXT } from '../data/i18n';
import { Language, LevelConfig, RoundResult } from '../types/game';
import { EgyptStickerSvg } from './EgyptSvgs';

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
}) => (
  <div
    dir={lang === 'ar' ? 'rtl' : 'ltr'}
    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="pause-title"
  >
    <div className="w-full max-w-sm bg-[#FFFDF7] border-2 border-[#133C3B] rounded-3xl p-6 shadow-2xl animate-pop-in flex flex-col items-center text-center gap-5">
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
          className="w-full h-13 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] border-2 border-b-4 border-[#14532D] text-white font-display text-xl font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{t(UI_TEXT.resume, lang)}</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="w-full h-12 rounded-2xl bg-[#FEF3C7] hover:bg-[#FDE68A] border-2 border-b-4 border-[#133C3B] text-[#133C3B] font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t(UI_TEXT.restartLevel, lang)}</span>
        </button>

        <button
          type="button"
          onClick={onToggleLang}
          className="w-full h-12 rounded-2xl bg-white hover:bg-[#E0F2FE] border-2 border-[#133C3B] text-[#133C3B] font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Languages className="w-4 h-4 text-[#0D9488]" />
          <span>{lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleMusic}
          className={`w-full h-12 rounded-2xl border-2 border-[#133C3B] font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            musicEnabled && !muted
              ? 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E]'
              : 'bg-white hover:bg-[#F1F5F9] text-[#133C3B]'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>{musicEnabled && !muted ? t(UI_TEXT.lofiMusicOn, lang) : t(UI_TEXT.lofiMusicOff, lang)}</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          className="w-full h-12 rounded-2xl bg-white hover:bg-[#F1F5F9] border-2 border-[#133C3B] text-[#133C3B] font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{muted ? t(UI_TEXT.unmuteSound, lang) : t(UI_TEXT.muteSound, lang)}</span>
        </button>

        <button
          type="button"
          onClick={onExitToMap}
          className="w-full h-12 rounded-2xl bg-white hover:bg-[#F1F5F9] border-2 border-[#133C3B] text-[#133C3B] font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Map className="w-4 h-4" />
          <span>{t(UI_TEXT.worldMap, lang)}</span>
        </button>
      </div>
    </div>
  </div>
);

interface RoundSummaryModalProps {
  level: LevelConfig;
  lang: Language;
  result: RoundResult;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onPlayAgain: () => void;
  onExitToMap: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  level,
  lang,
  result,
  hasNextLevel,
  onNextLevel,
  onPlayAgain,
  onExitToMap,
}) => {
  const unlockedSticker = result.newlyUnlockedSticker
    ? EGYPT_STICKERS[result.newlyUnlockedSticker]
    : null;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="w-full max-w-md bg-[#FFFDF7] border-2 border-[#133C3B] rounded-3xl p-6 sm:p-7 shadow-2xl animate-pop-in flex flex-col items-center text-center gap-5">
        <div>
          <div className="text-xs font-bold text-[#64748B] tabular-nums">
            {t(level.subjectName, lang)} · {t(UI_TEXT.levelShort, lang)}
            {level.levelNumber} · {t(level.title, lang)}
          </div>
          <h2 id="victory-title" className="font-display text-3xl font-bold text-[#133C3B] mt-1">
            {t(UI_TEXT.levelComplete, lang)}
          </h2>
        </div>

        <div className="flex items-center justify-center gap-3" aria-label={`Earned ${result.starsEarned} of 3 stars`}>
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              className={`w-12 h-12 transition-transform duration-200 ${
                n <= result.starsEarned
                  ? 'text-[#F59E0B] fill-[#F59E0B] scale-105'
                  : 'text-[#CBD5E1] fill-[#E2E8F0]'
              }`}
            />
          ))}
        </div>

        <div className="text-sm font-bold text-[#133C3B] tabular-nums">
          {t(UI_TEXT.firstTryLabel, lang)} {result.correctFirstTry}/{result.totalRounds} · +{result.gemsEarned}{' '}
          {t(UI_TEXT.nileGems, lang)}
        </div>

        {unlockedSticker ? (
          <div className="w-full bg-[#FEFCE8] border-2 border-[#F59E0B] rounded-2xl p-4 flex items-center gap-4">
            <EgyptStickerSvg stickerId={unlockedSticker.id} unlocked size={76} />
            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              <div className="text-xs font-bold text-[#B45309]">{t(UI_TEXT.newSticker, lang)}</div>
              <div className="font-display text-xl font-bold text-[#133C3B]">
                {t(unlockedSticker.name, lang)}
              </div>
              <div className="text-xs font-semibold text-[#475569]">
                {t(UI_TEXT.addedToBook, lang)}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-2xl px-4 py-3 text-sm font-semibold text-[#475569]">
            {t(UI_TEXT.greatPractice, lang)}
          </div>
        )}

        <div className="w-full flex flex-col gap-2.5">
          {hasNextLevel && (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full h-13 rounded-2xl bg-[#D97706] hover:bg-[#B45309] border-2 border-b-4 border-[#133C3B] text-white font-display text-xl font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>{t(UI_TEXT.nextLevel, lang)}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onPlayAgain}
              className="h-12 rounded-2xl bg-[#FEF3C7] hover:bg-[#FDE68A] border-2 border-b-4 border-[#133C3B] text-[#133C3B] font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t(UI_TEXT.playAgain, lang)}</span>
            </button>

            <button
              type="button"
              onClick={onExitToMap}
              className="h-12 rounded-2xl bg-white hover:bg-[#F1F5F9] border-2 border-b-4 border-[#133C3B] text-[#133C3B] font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
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
