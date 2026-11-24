import React from 'react';
import { Languages, Music, Volume2, VolumeX } from 'lucide-react';
import { t, UI_TEXT } from '../data/i18n';
import { Language } from '../types/game';

export type ActiveNavSection = 'home' | 'game' | 'practice' | 'stickers';

interface SectionNavHeaderProps {
  activeSection: ActiveNavSection;
  lang: Language;
  muted: boolean;
  musicEnabled: boolean;
  onNavigateHome: () => void;
  onNavigateGame: () => void;
  onNavigatePractice: () => void;
  onNavigateStickers: () => void;
  onToggleLang: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
}

export const SectionNavHeader: React.FC<SectionNavHeaderProps> = ({
  activeSection,
  lang,
  muted,
  musicEnabled,
  onNavigateHome,
  onNavigateGame,
  onNavigatePractice,
  onNavigateStickers,
  onToggleLang,
  onToggleMute,
  onToggleMusic,
}) => {
  const navItems: { id: ActiveNavSection; label: string; onClick: () => void }[] = [
    { id: 'home', label: t(UI_TEXT.homeSection, lang), onClick: onNavigateHome },
    { id: 'game', label: t(UI_TEXT.gameSection, lang), onClick: onNavigateGame },
    { id: 'practice', label: t(UI_TEXT.practiceSection, lang), onClick: onNavigatePractice },
    { id: 'stickers', label: t(UI_TEXT.stickerBook, lang), onClick: onNavigateStickers },
  ];

  const isMusicPlaying = musicEnabled && !muted;

  return (
    <header className="w-full bg-[#FFFDF7] border-b border-[#133C3B]/15 sticky top-0 z-20 shrink-0">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#133C3B] hover:text-[#D97706] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          {t(UI_TEXT.appName, lang)}
        </button>

        {/* Zone 2: Clean Single-Line Section Links */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-4 sm:gap-7 overflow-x-auto"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-sm sm:text-base font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#133C3B]'
                    : 'text-[#64748B] hover:text-[#133C3B]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#D97706]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language, Lofi Music & Audio Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleLang}
            aria-label="Switch language"
            className="h-10 px-3 rounded-xl bg-white border border-[#133C3B]/25 text-[#133C3B] font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-[#F0FDFA] hover:border-[#0D9488] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Languages className="w-4 h-4 text-[#0D9488]" />
            <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMusic}
            aria-pressed={isMusicPlaying}
            aria-label={isMusicPlaying ? t(UI_TEXT.lofiMusicOn, lang) : t(UI_TEXT.lofiMusicOff, lang)}
            title={isMusicPlaying ? t(UI_TEXT.lofiMusicOn, lang) : t(UI_TEXT.lofiMusicOff, lang)}
            className={`h-10 px-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isMusicPlaying
                ? 'bg-[#FEF3C7] border-[#D97706] text-[#92400E]'
                : 'bg-white border-[#133C3B]/25 text-[#64748B] hover:text-[#133C3B] hover:border-[#133C3B]/45'
            }`}
          >
            <Music className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t(UI_TEXT.lofiShort, lang)}</span>
            {isMusicPlaying && (
              <span className="inline-flex items-end gap-[2px] h-3" aria-hidden="true">
                <span className="w-[2.5px] h-3 rounded-full bg-[#D97706] animate-eq-bar" />
                <span
                  className="w-[2.5px] h-2 rounded-full bg-[#D97706] animate-eq-bar"
                  style={{ animationDelay: '0.25s' }}
                />
                <span
                  className="w-[2.5px] h-3 rounded-full bg-[#D97706] animate-eq-bar"
                  style={{ animationDelay: '0.5s' }}
                />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            className="w-10 h-10 rounded-xl bg-white border border-[#133C3B]/25 text-[#133C3B] flex items-center justify-center hover:bg-[#FEF3C7] hover:border-[#D97706] transition-colors cursor-pointer shrink-0"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
