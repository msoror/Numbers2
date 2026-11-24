import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Play, RefreshCw, XCircle } from 'lucide-react';
import { EGYPT_LEVELS } from '../data/egyptLevels';
import { t, UI_TEXT } from '../data/i18n';
import {
  generatePracticeQuickCheck,
  getSubjectById,
  PRACTICE_SUBJECTS,
  PracticeCheckItem,
} from '../data/practiceSubjects';
import { LevelConfig, PlayerProgress, SubjectId } from '../types/game';
import { soundEngine } from '../utils/sound';
import { SectionNavHeader } from './SectionNavHeader';
import { PracticeVisualizer } from './practice/PracticeVisualizers';

interface PracticeSubjectLabProps {
  subjectId: SubjectId;
  progress: PlayerProgress;
  onSelectSubject: (id: SubjectId) => void;
  onBackToMenu: () => void;
  onLaunchLevel: (level: LevelConfig) => void;
  onNavigateHome: () => void;
  onNavigateGame: () => void;
  onNavigateStickers: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleLang: () => void;
}

export const PracticeSubjectLab: React.FC<PracticeSubjectLabProps> = ({
  subjectId,
  progress,
  onSelectSubject,
  onBackToMenu,
  onLaunchLevel,
  onNavigateHome,
  onNavigateGame,
  onNavigateStickers,
  onToggleMute,
  onToggleMusic,
  onToggleLang,
}) => {
  const lang = progress.language;
  const subject = getSubjectById(subjectId);
  const linkedLevel =
    EGYPT_LEVELS.find((l) => l.id === subject.linkedLevelId) ?? EGYPT_LEVELS[0];

  const [activeCheck, setActiveCheck] = useState<PracticeCheckItem>(() =>
    generatePracticeQuickCheck(subjectId)
  );
  const [solvedCount, setSolvedCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    setActiveCheck(generatePracticeQuickCheck(subjectId));
    setSelectedOption(null);
    setSolvedCount(0);
  }, [subjectId]);

  const isCorrect = selectedOption === activeCheck.correctIndex;

  const handleAnswerCheck = (idx: number) => {
    if (selectedOption === activeCheck.correctIndex) return;
    setSelectedOption(idx);
    if (idx === activeCheck.correctIndex) {
      soundEngine.playCorrect();
      setSolvedCount((c) => c + 1);
    } else {
      soundEngine.playGentleMiss();
    }
  };

  const handleGenerateNextCheck = () => {
    soundEngine.playClick();
    setActiveCheck(generatePracticeQuickCheck(subjectId));
    setSelectedOption(null);
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative w-full h-full bg-[#FCF9F0] flex flex-col overflow-y-auto"
    >
      <SectionNavHeader
        activeSection="practice"
        lang={lang}
        muted={progress.muted}
        musicEnabled={progress.musicEnabled}
        onNavigateHome={onNavigateHome}
        onNavigateGame={onNavigateGame}
        onNavigatePractice={onBackToMenu}
        onNavigateStickers={onNavigateStickers}
        onToggleLang={onToggleLang}
        onToggleMute={onToggleMute}
        onToggleMusic={onToggleMusic}
      />

      {/* Horizontal 12-Subject Switcher Strip */}
      <div className="w-full bg-white border-b border-[#133C3B]/12 shrink-0">
        <div className="max-w-7xl mx-auto px-5 py-2.5 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={onBackToMenu}
            className="h-9 px-3 rounded-lg bg-[#FCF9F0] border border-[#133C3B]/20 text-xs font-bold text-[#133C3B] flex items-center gap-1.5 hover:bg-[#FEF3C7] cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            <span>{t(UI_TEXT.backToSubjects, lang)}</span>
          </button>

          <span className="text-[#CBD5E1]" aria-hidden="true">
            |
          </span>

          {PRACTICE_SUBJECTS.map((item) => {
            const active = item.id === subject.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSubject(item.id)}
                className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#133C3B] text-white'
                    : 'text-[#475569] hover:bg-[#F1EDE1] hover:text-[#133C3B]'
                }`}
              >
                {item.order}. {t(item.shortTitle, lang)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Zone Educational Sandbox Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-5 pt-6 pb-36 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#133C3B]/12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
              <span>{t(subject.categoryLabel, lang)}</span>
              <span aria-hidden="true">·</span>
              <span>{t(subject.termTag, lang)}</span>
            </div>
            <h1
              className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#133C3B]"
              style={{ textWrap: 'balance' }}
            >
              {subject.order}. {t(subject.title, lang)}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => onLaunchLevel(linkedLevel)}
            className="h-11 px-5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {t(UI_TEXT.playRelatedGame, lang)} ({t(UI_TEXT.levelShort, lang)}1)
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-8">
          {/* Left Zone: Interactive Sandbox */}
          <section
            aria-label={t(UI_TEXT.interactiveLab, lang)}
            className="lg:col-span-8 bg-white border border-[#133C3B]/15 rounded-2xl p-5 sm:p-6 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#133C3B]/10">
              <h2 className="font-display text-lg font-bold text-[#133C3B]">
                {t(UI_TEXT.interactiveLab, lang)}
              </h2>
              <span className="text-xs font-semibold text-[#64748B]">
                {t(subject.summary, lang)}
              </span>
            </div>

            <PracticeVisualizer subjectId={subject.id} lang={lang} />
          </section>

          {/* Right Zone: Key Rules + Infinite Procedural Quick Check */}
          <aside className="lg:col-span-4 flex flex-col gap-5">
            <section className="bg-white border border-[#133C3B]/15 rounded-2xl p-5">
              <h2 className="font-display text-lg font-bold text-[#133C3B] mb-3">
                {t(UI_TEXT.keyRules, lang)}
              </h2>
              <ol className="flex flex-col gap-3">
                {subject.keyRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-[#334155] leading-relaxed">
                    <span className="font-display font-bold text-[#0F766E] tabular-nums shrink-0">
                      {idx + 1}.
                    </span>
                    <span>{t(rule, lang)}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="bg-white border border-[#133C3B]/15 rounded-2xl p-5 flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-[#133C3B]">
                  {t(UI_TEXT.quickCheck, lang)}
                </h2>
                <span className="text-xs font-bold text-[#0F766E] tabular-nums">
                  {solvedCount > 0 ? `${solvedCount} ✓` : t(UI_TEXT.freshNumbersNote, lang)}
                </span>
              </div>

              <p className="text-sm font-bold text-[#133C3B] leading-relaxed">
                {t(activeCheck.prompt, lang)}
              </p>

              <div className="flex flex-col gap-2">
                {activeCheck.options.map((opt, idx) => {
                  const chosen = selectedOption === idx;
                  const rightChoice = chosen && idx === activeCheck.correctIndex;
                  const wrongChoice = chosen && idx !== activeCheck.correctIndex;
                  return (
                    <button
                      key={`${activeCheck.id}-${idx}`}
                      type="button"
                      onClick={() => handleAnswerCheck(idx)}
                      className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        lang === 'ar' ? 'text-right' : 'text-left'
                      } ${
                        rightChoice
                          ? 'bg-[#F0FDFA] border-[#0F766E] text-[#0F766E]'
                          : wrongChoice
                          ? 'bg-[#FEF2F2] border-[#DC2626] text-[#B91C1C]'
                          : 'bg-[#FCF9F0] border-[#133C3B]/15 text-[#133C3B] hover:border-[#133C3B]'
                      }`}
                    >
                      <span>{t(opt, lang)}</span>
                      {rightChoice && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                      {wrongChoice && <XCircle className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div
                  className={`rounded-xl p-3.5 text-xs sm:text-sm font-semibold leading-relaxed ${
                    isCorrect
                      ? 'bg-[#F0FDFA] text-[#115E59] border border-[#0F766E]/25'
                      : 'bg-[#FEF2F2] text-[#991B1B] border border-[#DC2626]/25'
                  }`}
                >
                  <div className="font-bold mb-1">
                    {isCorrect
                      ? t(UI_TEXT.correctFeedback, lang)
                      : t(UI_TEXT.tryAgainFeedback, lang)}
                  </div>
                  <div>{t(activeCheck.explanation, lang)}</div>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateNextCheck}
                className="h-10 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t(UI_TEXT.tryAnother, lang)}</span>
              </button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};
