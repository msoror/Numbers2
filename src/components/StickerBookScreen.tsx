import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { EGYPT_LEVELS, EGYPT_STICKERS } from '../data/egyptLevels';
import { t, UI_TEXT } from '../data/i18n';
import { PlayerProgress, StickerId } from '../types/game';
import { soundEngine } from '../utils/sound';
import { EgyptStickerSvg } from './EgyptSvgs';
import { SectionNavHeader } from './SectionNavHeader';

interface StickerBookScreenProps {
  progress: PlayerProgress;
  onNavigateHome: () => void;
  onNavigateGame: () => void;
  onNavigatePractice: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleLang: () => void;
}

export const StickerBookScreen: React.FC<StickerBookScreenProps> = ({
  progress,
  onNavigateHome,
  onNavigateGame,
  onNavigatePractice,
  onToggleMute,
  onToggleMusic,
  onToggleLang,
}) => {
  const [poppedId, setPoppedId] = useState<StickerId | null>(null);
  const lang = progress.language;
  const stickerList = Object.values(EGYPT_STICKERS);

  const handleStickerClick = (id: StickerId, unlocked: boolean) => {
    if (!unlocked) {
      soundEngine.playGentleMiss();
      return;
    }
    soundEngine.playStickerUnlock();
    setPoppedId(id);
    setTimeout(() => setPoppedId(null), 450);
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="w-full h-full bg-[#FCF9F0] flex flex-col overflow-y-auto select-none"
    >
      <SectionNavHeader
        activeSection="stickers"
        lang={lang}
        muted={progress.muted}
        musicEnabled={progress.musicEnabled}
        onNavigateHome={onNavigateHome}
        onNavigateGame={onNavigateGame}
        onNavigatePractice={onNavigatePractice}
        onNavigateStickers={() => {}}
        onToggleLang={onToggleLang}
        onToggleMute={onToggleMute}
        onToggleMusic={onToggleMusic}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-5 py-7 flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-[#133C3B]/12">
          <h1 className="font-display text-3xl font-bold text-[#133C3B]">
            {t(UI_TEXT.stickerBook, lang)}
          </h1>
          <div className="text-sm font-bold text-[#133C3B] tabular-nums">
            {t(UI_TEXT.stickers, lang)} {progress.unlockedStickers.length} / 12 · {t(UI_TEXT.stars, lang)}{' '}
            {progress.totalStars} / {EGYPT_LEVELS.length * 3}
          </div>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
          {stickerList.map((sticker) => {
            const unlocked = progress.unlockedStickers.includes(sticker.id);
            const isPopped = poppedId === sticker.id;

            return (
              <button
                key={sticker.id}
                type="button"
                onClick={() => handleStickerClick(sticker.id, unlocked)}
                className={`rounded-3xl p-4 border-2 flex flex-col items-center text-center gap-2.5 transition-transform duration-150 cursor-pointer ${
                  unlocked
                    ? 'bg-[#FEFCE8] border-[#133C3B] border-b-4 hover:-translate-y-0.5'
                    : 'bg-[#F8FAFC] border-[#CBD5E1]'
                } ${isPopped ? 'scale-105' : ''}`}
              >
                <div className="relative">
                  <EgyptStickerSvg stickerId={sticker.id} unlocked={unlocked} size={84} />
                  {!unlocked && (
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border-2 border-[#94A3B8] flex items-center justify-center text-[#64748B]">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-display text-base font-bold text-[#133C3B]">
                    {unlocked ? t(sticker.name, lang) : t(UI_TEXT.mysterySticker, lang)}
                  </div>
                  <div className="text-xs font-semibold text-[#64748B] mt-0.5">
                    {unlocked ? t(UI_TEXT.tapCelebrate, lang) : t(sticker.unlockHint, lang)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
